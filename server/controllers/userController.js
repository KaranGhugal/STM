const User = require("../models/userModel");
const Role = require("../models/roleModel"); // Import Role model
const LoginHistory = require("../models/loginHistoryModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
const {
  PASSWORDS_DO_NOT_MATCH,
  USER_EXISTS,
  INVALID_CREDENTIALS,
  AUTH_FAILED,
  USER_NOT_FOUND_EMAIL,
  EMAIL_IN_USE,
  PASSWORD_REQUIRED,
  INCORRECT_PASSWORD,
  ACCOUNT_DELETED,
  DB_UNAVAILABLE,
  JWT_MISSING,
  FILE_UPLOAD_ERROR,
} = require("../utils/errorMessages");
const { uploadProfilePhoto } = require("../utils/fileUpload");

// Helper: Delete uploaded file on errors
const deleteUploadedFile = (req) => {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password -confirmPassword");
  res.status(200).json(
    users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo || "",
    }))
  );
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  uploadProfilePhoto(req, res, async (err) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (err) {
        throw new Error(
          err instanceof multer.MulterError
            ? FILE_UPLOAD_ERROR
            : err.message
        );
      }

      const { name, email, phone, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        throw new Error(PASSWORDS_DO_NOT_MATCH);
      }

      const userExists = await User.findOne({ email }).session(session);
      if (userExists) {
        throw new Error(USER_EXISTS);
      }

      const user = await User.create(
        [{
          name,
          email,
          phone,
          password,
          confirmPassword,
          photo: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : undefined,
        }],
        { session }
      );

      if (!user || !user[0]) {
        throw new Error('Failed to create user');
      }

      const roleExists = await Role.findOne({ email }).session(session);
      if (roleExists) {
        throw new Error('Role entry already exists for this email');
      }

      const role = await Role.create(
        [{
          name,
          email,
          password,
          confirmPassword,
          role: Role.RoleType.USER
        }],
        { session }
      );

      if (!role || !role[0]) {
        throw new Error('Failed to create role');
      }

      await session.commitTransaction();

      const token = generateToken(res, user[0]._id, role[0].role);
      res.status(201).json({
        token,
        user: {
          id: user[0]._id,
          name: user[0].name,
          email: user[0].email,
          phone: user[0].phone,
          photo: user[0].photo || "",
        },
        role: {
          roleId: role[0]._id,
          role: role[0].role,
          name: role[0].name,
          email: role[0].email,
          createdAt: role[0].createdAt,
        },
      });

    } catch (error) {
      await session.abortTransaction();
      deleteUploadedFile(req);
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  if (!process.env.JWT_SECRET) throw new Error(JWT_MISSING);
  if (mongoose.connection.readyState !== 1) throw new Error(DB_UNAVAILABLE);

  const { email, password } = req.body;
  if (!email || !password) throw new Error(INVALID_CREDENTIALS);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.error('Login failed - User not found:', email);
    return res.status(404).json({ status: false, error: AUTH_FAILED, message: USER_NOT_FOUND_EMAIL });
  }

  console.log('User found during login:', user.email);
  if (!(await bcrypt.compare(password, user.password))) {
    console.error('Login failed - Incorrect password for:', email);
    return res.status(401).json({ status: false, error: AUTH_FAILED, message: INCORRECT_PASSWORD });
  }

  const role = await Role.findOne({ email });
  if (!role) {
    console.error('Login failed - Role not found for:', email);
    return res.status(404).json({ status: false, error: "Role not found", message: "No role associated with this user" });
  }

  console.log('Role found during login:', role.role);
  await LoginHistory.create({
    userId: user._id,
    ipAddress: req.clientInfo?.ip || "Not detected",
    userAgent: req.clientInfo?.userAgent || "Unknown",
  });

  const token = generateToken(res, user._id, role.role);

  res.set({
    "X-Auth-Token": token,
    "X-User-Id": user._id.toString(),
    "X-User-Name": user.name,
    "X-User-Email": user.email,
    "X-Role": role.role,
    "X-Role-Id": role._id.toString(),
  });

  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo || "",
    },
    role: {
      roleId: role._id,
      role: role.role,
      name: role.name,
      email: role.email,
      createdAt: role.createdAt,
    },
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error(USER_NOT_FOUND);
  }
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    photo: user.photo || "",
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  uploadProfilePhoto(req, res, async (err) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (err) {
        err instanceof multer.MulterError
          ? res.status(400).json({ error: FILE_UPLOAD_ERROR })
          : res.status(500).json({ error: err.message });
        return;
      }

      const user = await User.findById(req.user._id).session(session);
      if (!user) throw new Error(USER_NOT_FOUND);

      // Find the corresponding Role entry
      const role = await Role.findOne({ email: user.email }).session(session);
      if (!role) throw new Error('Role not found for this user');

      // Update fields in User
      if (req.body.email && req.body.email !== user.email) {
        if (await User.findOne({ email: req.body.email })) {
          throw new Error(EMAIL_IN_USE);
        }
        user.email = req.body.email;
        role.email = req.body.email; // Sync email with Role
      }
      if (req.body.name) {
        user.name = req.body.name;
        role.name = req.body.name; // Sync name with Role
      }
      if (req.body.phone) user.phone = req.body.phone;

      // Password update logic
      if (req.body.password) {
        if (!req.body.currentPassword) throw new Error(PASSWORD_REQUIRED);
        if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
          throw new Error(INCORRECT_PASSWORD);
        }
        user.password = req.body.password;
        role.password = req.body.password; // Sync password with Role
        role.confirmPassword = req.body.password; // Sync confirmPassword
      }

      // Update profile photo
      if (req.file) {
        if (user.photo) fs.unlinkSync(user.photo.substring(1));
        user.photo = `/${req.file.path.replace(/\\/g, "/")}`;
      }

      await user.save({ session });
      await role.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo || "",
      });
    } catch (error) {
      await session.abortTransaction();
      deleteUploadedFile(req);
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user._id).session(session);
    if (!user) throw new Error(USER_NOT_FOUND);

    if (!req.body.password) throw new Error(PASSWORD_REQUIRED);
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error(INCORRECT_PASSWORD);
    }

    // Find the corresponding Role entry
    const role = await Role.findOne({ email: user.email }).session(session);
    if (!role) throw new Error('Role not found for this user');

    // Delete the user's profile photo if it exists
    if (user.photo) fs.unlinkSync(user.photo.substring(1));

    // Delete related data
    await LoginHistory.deleteMany({ userId: user._id }).session(session);
    await User.deleteOne({ _id: user._id }).session(session);
    await Role.deleteOne({ _id: role._id }).session(session);

    await session.commitTransaction();

    // Clear the JWT cookie
    res.clearCookie("jwt");
    res.status(200).json({ message: ACCOUNT_DELETED });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};