const { Router } = require('express');
const { getClientInfo } = require('../middleware/clientInfo');
const { 
  getAllUsers,
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
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
router.post('/auth/register', registerUser);
router.post('/auth/login', getClientInfo, loginUser);
router.get('/auth/verify-email/:token', verifyEmail);
router.post('/auth/resend-verification', resendVerification);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password/:token', resetPassword);

// Authentication barrier
router.use(auth);

// Protected endpoints
router.get('/users', getAllUsers);
router.route('/auth/profile')
  .get(getUserProfile)
  .put(updateUserProfile)
  .delete(deleteUser);

module.exports = router;