const express = require('express');
const router = express.Router();
const {
  createRole,
  getCurrentUserRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  changeRole
} = require('../controllers/roleController');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes
router.use(auth);

// Route to get current user's role data (accessible to all authenticated users)
router.get('/me', getCurrentUserRole);

// Routes requiring admin access
router.route('/')
  .post(roleMiddleware, createRole)    // Create new user (admin only)
  .get(roleMiddleware, getAllRoles);   // Get all users (admin only)

router.route('/:id')
  .get(getRoleById)                     // Get user by ID (authenticated users)
  .put(updateRole)                      // Update user details (authenticated users)
  .delete(roleMiddleware, deleteRole); // Delete user by ID (admin only)

router.route('/:id/role')
  .patch(roleMiddleware, changeRole);  // Change user role (admin only)

module.exports = router;