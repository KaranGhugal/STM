// server/routes/userRoutes.js

const { Router } = require('express');
const { getClientInfo } = require('../middleware/clientInfo');
const { 
  getAllUsers,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
} = require('../controllers/userController');
const verifyEnvironment = require('../middleware/envCheck');
const auth = require('../middleware/auth');

const router = Router();

// Global middleware
router.use(verifyEnvironment);

// Public endpoints
router.post('/register', registerUser);
router.post('/login', getClientInfo, loginUser);

// Authentication barrier
router.use(auth);

// Protected endpoints
router.get('/', getAllUsers);
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile)
  .delete(deleteUser);

module.exports = router;