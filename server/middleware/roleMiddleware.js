const Role = require('../models/roleModel');
const User = require('../models/userModel'); 
const { USER_NOT_FOUND, AUTH_FAILED } = require('../utils/errorMessages');

const roleMiddleware = async (req, res, next) => {
  try {
    // Fetch the user from the User collection to get the email
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: USER_NOT_FOUND });
    }

    // Now find the role using the email
    const roleUser = await Role.findOne({ email: user.email });
    if (!roleUser) {
      return res.status(404).json({ success: false, error: USER_NOT_FOUND });
    }

    // Check if the user has admin privileges
    if (roleUser.role !== Role.RoleType.ADMIN && roleUser.role !== Role.RoleType.SUPER_ADMIN) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
    }

    // Optionally, attach the roleUser to req for downstream use
    req.roleUser = roleUser;
    next();
  } catch (error) {
    console.error("Role middleware error:", error.message);
    res.status(401).json({ success: false, error: AUTH_FAILED });
  }
};

module.exports = roleMiddleware;