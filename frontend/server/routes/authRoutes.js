const express = require('express');
const router = express.Router();

const {
  signup,
  verifySignupOTP,
  resendSignupOTP,
  login,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  sendChangePasswordOTP,
  changePassword,
  refreshAccessToken,
  getMe,
  updateProfile,
  getAllUsersAdmin,
  updateUserStatusAdmin
} = require('../controllers/authController');

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

// Student Registration & Verification
router.post('/signup', signup);
router.post('/verify-signup-otp', verifySignupOTP);
router.post('/resend-signup-otp', resendSignupOTP);

// Login & Session Management
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

// Password Recovery (Unauthenticated)
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// ==========================================
// PROTECTED AUTHENTICATION ROUTES
// ==========================================

// Current Authenticated User Profile & Update
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// In-Session Password Change (Requires Login)
router.post('/send-change-password-otp', authenticate, sendChangePasswordOTP);
router.post('/change-password', authenticate, changePassword);

// ==========================================
// ADMIN USER MANAGEMENT ROUTES
// ==========================================
router.get('/users', authenticate, authorizeRoles('ADMIN'), getAllUsersAdmin);
router.patch('/users/:id/status', authenticate, authorizeRoles('ADMIN'), updateUserStatusAdmin);

module.exports = router;
