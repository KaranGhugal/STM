const User = require("../models/userModel");
const Role = require("../models/roleModel");
const LoginHistory = require("../models/loginHistoryModel");
const EmailVerification = require("../models/emailVerificationModel");
const PasswordReset = require("../models/passwordResetModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../utils/emailService");
const { 
  getVerificationEmailTemplate, 
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate 
} = require("../utils/emailTemplates");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");
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
  EMAIL_NOT_VERIFIED,
  INVALID_TOKEN,
  TOKEN_EXPIRED
} = require("../utils/errorMessages");
const { uploadProfilePhoto } = require("../utils/fileUpload");

// Helper: Delete uploaded file on errors
const deleteUploadedFile = (req) => {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }
};

// Helper: Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
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
      isEmailVerified: user.isEmailVerified
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
          isEmailVerified: false
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
          role: Role.RoleType.USER
        }],
        { session }
      );

      if (!role || !role[0]) {
        throw new Error('Failed to create role');
      }

      const verificationToken = generateVerificationToken();
      await EmailVerification.create(
        [{
          userId: user[0]._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }],
        { session }
      );

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        to: email,
        subject: 'Verify Your Email Address',
        html: getVerificationEmailTemplate({ name, verificationUrl })
      });

      await session.commitTransaction();

      res.status(201).json({
        message: 'Registration successful. Please verify your email.'
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

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const verificationRecord = await EmailVerification.findOne({ token });

  if (!verificationRecord) {
    throw new Error(INVALID_TOKEN);
  }

  if (verificationRecord.expiresAt < new Date()) {
    await EmailVerification.deleteOne({ _id: verificationRecord._id });
    throw new Error(TOKEN_EXPIRED);
  }

  const user = await User.findById(verificationRecord.userId);
  if (!user) {
    throw new Error(USER_NOT_FOUND_EMAIL);
  }

  user.isEmailVerified = true;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Task Manager App!',
    html: getWelcomeEmailTemplate({
      name: user.name,
      email: user.email,
      phone: user.phone
    })
  });

  await EmailVerification.deleteOne({ _id: verificationRecord._id });

  res.status(200).json({ message: 'Email verified successfully' });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(USER_NOT_FOUND_EMAIL);
  }

  if (user.isEmailVerified) {
    throw new Error('Email is already verified');
  }

  await EmailVerification.deleteMany({ userId: user._id });

  const verificationToken = generateVerificationToken();
  await EmailVerification.create({
    userId: user._id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    html: getVerificationEmailTemplate({ name: user.name, verificationUrl })
  });

  res.status(200).json({ message: 'Verification email resent successfully' });
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
    return res.status(404).json({ status: false, error: USER_NOT_FOUND_EMAIL });
  }

  if (!user.isEmailVerified) {
    throw new Error(EMAIL_NOT_VERIFIED);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.error('Login failed - Incorrect password:', email);
    return res.status(401).json({ status: false, error: INCORRECT_PASSWORD });
  }

  const role = await Role.findOne({ email });
  if (!role) {
    throw new Error('Role not found');
  }

  await LoginHistory.create({
    userId: user._id,
    email,
    loginTime: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  const token = generateToken(res, user._id, role.role);
  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo || "",
      isEmailVerified: user.isEmailVerified
    },
    role: {
      roleId: role._id,
      role: role.role,
      name: role.name,
      email: role.email,
      createdAt: role.createdAt,
    }
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(USER_NOT_FOUND_EMAIL);
  }

  await PasswordReset.deleteMany({ userId: user._id });

  const resetToken = crypto.randomBytes(32).toString('hex');
  await PasswordReset.create({
    userId: user._id,
    token: resetToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: getPasswordResetEmailTemplate({ name: user.name, resetUrl })
  });

  res.status(200).json({ message: 'Password reset email sent successfully' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new Error(PASSWORDS_DO_NOT_MATCH);
  }

  const resetRecord = await PasswordReset.findOne({ token });
  if (!resetRecord) {
    throw new Error(INVALID_TOKEN);
  }

  if (resetRecord.expiresAt < new Date()) {
    await PasswordReset.deleteOne({ _id: resetRecord._id });
    throw new Error(TOKEN_EXPIRED);
  }

  const user = await User.findById(resetRecord.userId).select("+password");
  if (!user) {
    throw new Error(USER_NOT_FOUND_EMAIL);
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();

  await PasswordReset.deleteOne({ _id: resetRecord._id });

  res.status(200).json({ message: 'Password reset successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error(USER_NOT_FOUND_EMAIL);
  }
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    photo: user.photo || "",
    isEmailVerified: user.isEmailVerified
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
        throw new Error(
          err instanceof multer.MulterError
            ? FILE_UPLOAD_ERROR
            : err.message
        );
      }

      const userId = req.user._id;
      const { name, email, phone, currentPassword, password, confirmPassword } = req.body;

      const user = await User.findById(userId).select("+password").session(session);
      if (!user) {
        throw new Error(USER_NOT_FOUND_EMAIL);
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email }).session(session);
        if (emailExists) {
          throw new Error(EMAIL_IN_USE);
        }
      }

      if (currentPassword && password && confirmPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          throw new Error(INCORRECT_PASSWORD);
        }
        if (password !== confirmPassword) {
          throw new Error(PASSWORDS_DO_NOT_MATCH);
        }
        user.password = password;
        user.confirmPassword = confirmPassword;
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      if (req.file) {
        if (user.photo && fs.existsSync(user.photo.substring(1))) {
          fs.unlinkSync(user.photo.substring(1));
        }
        user.photo = `/${req.file.path.replace(/\\/g, "/")}`;
      }

      await user.save({ session });

      const role = await Role.findOne({ email: user.email }).session(session);
      if (role) {
        role.name = user.name;
        role.email = user.email;
        await role.save({ session });
      }

      await session.commitTransaction();

      res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo || "",
        isEmailVerified: user.isEmailVerified
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
    if (!user) throw new Error(USER_NOT_FOUND_EMAIL);

    if (!req.body.password) throw new Error(PASSWORD_REQUIRED);
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error(INCORRECT_PASSWORD);
    }

    const role = await Role.findOne({ email: user.email }).session(session);
    if (!role) throw new Error('Role not found for this user');

    if (user.photo) fs.unlinkSync(user.photo.substring(1));

    await LoginHistory.deleteMany({ userId: user._id }).session(session);
    await EmailVerification.deleteMany({ userId: user._id }).session(session);
    await PasswordReset.deleteMany({ userId: user._id }).session(session);
    await User.deleteOne({ _id: user._id }).session(session);
    await Role.deleteOne({ _id: role._id }).session(session);

    await session.commitTransaction();

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
  verifyEmail,
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  deleteUser
};