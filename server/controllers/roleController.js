const Role = require("../models/roleModel");
const User = require("../models/userModel");
const RoleType = Role.RoleType;
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { USER_NOT_FOUND } = require("../utils/errorMessages");

// @desc    Create a new user
// @route   POST /api/roles
const createRole = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Check if email already exists
    const existingUser = await Role.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate confirmPassword matches password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const newUser = await Role.create({
      name,
      email,
      password,
      confirmPassword,
      role: role || Role.RoleType.USER,
    });

    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get current user's role data
// @route   GET /api/roles/me
// @access  Private
const getCurrentUserRole = async (req, res) => {
  try {
    // Fetch the user from the User collection to get the email
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: USER_NOT_FOUND,
      });
    }

    // Find the role using the email
    const role = await Role.findOne({ email: user.email }).select(
      "-password -confirmPassword"
    );
    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Role not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Error in getCurrentUserRole:", error.message, error.stack);
    // Handle database errors explicitly
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid user ID format" });
    }
    // Only return 500 for unexpected errors, not for "user not found"
    if (
      error.message === USER_NOT_FOUND ||
      error.message === "Role not found for this user"
    ) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch user role data",
    });
  }
};

// @desc    Get all users
// @route   GET /api/roles
const getAllRoles = async (req, res) => {
  try {
    console.log("Attempting to fetch roles...");
    const users = await Role.find().select("-password -confirmPassword");
    console.log("Fetched roles:", users);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllRoles:", error.message, error.stack);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch roles",
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/roles/:id
const getRoleById = async (req, res) => {
  try {
    const user = await Role.findById(req.params.id).select(
      "-password -confirmPassword"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        error: USER_NOT_FOUND,
      });
    }

    // Allow users to access their own data or admins to access any data
    const requestingUser = await Role.findById(req.user._id);
    if (
      req.params.id !== req.user._id &&
      requestingUser.role !== RoleType.ADMIN &&
      requestingUser.role !== RoleType.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Cannot access other user data",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update user details
// @route   PUT /api/roles/:id
const updateRole = async (req, res) => {
  try {
    const user = await Role.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: USER_NOT_FOUND,
      });
    }

    // Allow users to update their own data or admins to update any data
    const requestingUser = await Role.findById(req.user._id);
    if (
      req.params.id !== req.user._id &&
      requestingUser.role !== RoleType.ADMIN &&
      requestingUser.role !== RoleType.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Cannot update other user data",
      });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      user.password = req.body.password;
      user.confirmPassword = req.body.confirmPassword;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/roles/:id
const deleteRole = async (req, res) => {
  try {
    const user = await Role.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: USER_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Change user role
// @route   PATCH /api/roles/:id/role
const changeRole = async (req, res) => {
  try {
    console.log("Received role:", req.body.role);
    const user = await Role.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: USER_NOT_FOUND,
      });
    }
    if (!req.body.role || !Object.values(RoleType).includes(req.body.role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing role specified",
      });
    }

    // Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles
    const requestingUser = await Role.findById(req.user._id);
    if (
      (req.body.role === RoleType.ADMIN ||
        req.body.role === RoleType.SUPER_ADMIN) &&
      requestingUser.role !== RoleType.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error:
          "Unauthorized: Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles",
      });
    }

    user.role = req.body.role;
    await user.save();
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createRole,
  getCurrentUserRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  changeRole,
};
