
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/mailSender');
const { validatePasswordStrength, generateSecureOTP, hashOTP, jsonwebtokenId, verifyToken } = require('../utils/helperFunction');
const User = require('../models/User');


// ==========================================
// CONFIGURATION & HELPERS
// ==========================================
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: maxAgeMs
});

// ==========================================
// CONTROLLER FUNCTIONS
// ==========================================

const signup = async (req, res) => {
  try {
    const { name, email, password, academicCourse, currentSemester } = req.body;

    // Field presence validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Password validation
    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Academic Profile validation for Student
    if (!academicCourse || !academicCourse.trim()) {
      return res.status(400).json({ success: false, message: 'Academic course is required for student registration' });
    }

    const semesterNum = Number(currentSemester);
    if (!semesterNum || semesterNum < 1 || semesterNum > 8) {
      return res.status(400).json({ success: false, message: 'Current semester must be between 1 and 8' });
    }

    // Check existing account
    let existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Generate secure 6-digit OTP and expiration (10 minutes)
    const rawOTP = generateSecureOTP();
    const hashedOTP = hashOTP(rawOTP);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user document
      existingUser.name = name.trim();
      existingUser.password = password; // Pre-save hook will hash modified password
      existingUser.academicProfile = {
        courseName: academicCourse.trim(),
        currentSemester: semesterNum
      };
      existingUser.verificationOTP = hashedOTP;
      existingUser.verificationOTPExpires = otpExpires;

      await existingUser.save();
    } else {
      // Create new student document
      existingUser = new User({
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: 'STUDENT',
        academicProfile: {
          courseName: academicCourse.trim(),
          currentSemester: semesterNum
        },
        isVerified: false,
        verificationOTP: hashedOTP,
        verificationOTPExpires: otpExpires
      });

      await existingUser.save();
    }

    // Dispatch verification OTP email
    await sendOTPEmail({
      to: normalizedEmail,
      subject: 'Verify your student account',
      purposeText: 'Your verification OTP for Quick-Notes registration is',
      otp: rawOTP
    });

    return res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your email'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'An error occurred during registration' });
  }
};

const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+verificationOTP +verificationOTPExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    if (!user.verificationOTP || !user.verificationOTPExpires) {
      return res.status(400).json({ success: false, message: 'No pending OTP verification found' });
    }

    if (user.verificationOTPExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    const submittedHash = hashOTP(otp.trim());
    if (submittedHash !== user.verificationOTP) {
      return res.status(400).json({ success: false, message: 'Invalid verification OTP' });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred during OTP verification' });
  }
};

const resendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+verificationOTP +verificationOTPExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Basic cooldown protection: don't regenerate if requested less than 60 seconds ago
    if (user.verificationOTPExpires) {
      const timeRemaining = user.verificationOTPExpires.getTime() - Date.now();
      const tenMinutes = 10 * 60 * 1000;
      if (tenMinutes - timeRemaining < 60 * 1000) {
        return res.status(429).json({
          success: false,
          message: 'Please wait a minute before requesting another OTP'
        });
      }
    }

    const rawOTP = generateSecureOTP();
    user.verificationOTP = hashOTP(rawOTP);
    user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendOTPEmail({
      to: normalizedEmail,
      subject: 'Resend Verification OTP',
      purposeText: 'Your new verification OTP for Quick-Notes registration is',
      otp: rawOTP
    });

    return res.status(200).json({
      success: true,
      message: 'A new verification OTP has been sent to your email'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while resending OTP' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
   
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    console.log(process.env.ACCESS_TOKEN_SECRET)
    console.log(process.env.REFRESH_TOKEN_SECRET)
    console.log(user._id, user.role)

    // Generate JWT access & refresh tokens
    const accessToken = jsonwebtokenId(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRES
    );
    const refreshToken = jsonwebtokenId(
      { userId: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRES
    );

    console.log(accessToken, refreshToken); 

    // Hash refresh token before saving in database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set secure HTTP-only cookies
    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
    console.log("refresh",user.refreshToken);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          academicProfile: user.academicProfile,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message:error.message });
  }
};

 
const logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (incomingRefreshToken) {
      try {
        const decoded = verifyToken(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch (err) {
        // Token was invalid or expired; proceed to clear cookies
      }
    }

    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };

    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred during logout' });
  }
};

 
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+verificationOTP +verificationOTPExpires');

    if (user && user.isActive) {
      const rawOTP = generateSecureOTP();
      user.verificationOTP = hashOTP(rawOTP);
      user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.save();

      await sendOTPEmail({
        to: normalizedEmail,
        subject: 'Password Reset OTP',
        purposeText: 'Your password reset OTP for Quick Notes is',
        otp: rawOTP
      });
    }

    // Generic response to prevent account enumeration
    return res.status(200).json({
      success: true,
      message: 'If the email is registered, a password reset OTP has been sent.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while processing password reset request' });
  }
}; 

 
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+verificationOTP +verificationOTPExpires');

    if (!user || !user.verificationOTP || !user.verificationOTPExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.verificationOTPExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    const submittedHash = hashOTP(otp.trim());
    if (submittedHash !== user.verificationOTP) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Generate short-lived reset token (valid for 15 minutes)
    const resetToken = jsonwebtokenId({userId: user._id, email: user.email, purpose: 'PASSWORD_RESET'}, process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRES);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred during reset OTP verification' });
  }
};

 
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, reset token, and new password are required' });
    }

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(resetToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    if (decoded.purpose !== 'PASSWORD_RESET') {
      return res.status(400).json({ success: false, message: 'Invalid token purpose' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (decoded.email !== normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Reset token does not match provided email' });
    }

    const user = await User.findById(decoded.userId).select('+password +verificationOTP +verificationOTPExpires +refreshToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if(user.password === newPassword){
      return res.status(400).json({ success: false, message: 'New password cannot be same as old password' });
    }
    user.password = newPassword;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    user.refreshToken = null;  

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while resetting password' });
  }
};

const sendChangePasswordOTP = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('+changePasswordOTP +changePasswordOTPExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rawOTP = generateSecureOTP();
    user.changePasswordOTP = hashOTP(rawOTP);
    user.changePasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    await sendOTPEmail({
      to: user.email,
      subject: 'Change Password Verification OTP',
      purposeText: 'Your verification OTP for changing your account password is',
      otp: rawOTP
    });

    return res.status(200).json({
      success: true,
      message: 'Change password OTP sent to your registered email'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while sending change password OTP' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId
    const { currentPassword, newPassword, otp } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({ success: false, message: 'Current password, new password, and OTP are required' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password' });
    }

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    const user = await User.findById(userId).select('+password +changePasswordOTP +changePasswordOTPExpires +refreshToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Verify OTP
    if (!user.changePasswordOTP || !user.changePasswordOTPExpires) {
      return res.status(400).json({ success: false, message: 'No active change password OTP found' });
    }

    if (user.changePasswordOTPExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    const submittedHash = hashOTP(otp.trim());
    if (submittedHash !== user.changePasswordOTP) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Update password
    user.password = newPassword;
    user.changePasswordOTP = null;
    user.changePasswordOTPExpires = null;
    user.refreshToken = null; // Invalidate active refresh tokens

    await user.save();

    // Clear authentication cookies
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };
    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while changing password' });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = verifyToken(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    if (!user.refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token has been revoked' });
    }

    // Validate token against stored hash
    const isTokenValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isTokenValid) {
      // Possible token reuse detected: revoke stored token
      user.refreshToken = null;
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Refresh token rotation: issue new access token & new refresh token
    const newAccessToken = jsonwebtokenId({userId: user._id, role: user.role}, process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRES);

    const newRefreshToken = jsonwebtokenId({userId: user._id, role:user.role}, process.env.REFRESH_TOKEN_SECRET, process.env.REFRESH_TOKEN_EXPIRES);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while refreshing access token' });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          academicProfile: user.academicProfile,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while fetching user profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, academicCourse, currentSemester } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    user.academicProfile = user.academicProfile || {};
    if (academicCourse !== undefined && academicCourse !== null) {
      user.academicProfile.courseName = String(academicCourse).trim();
    }

    if (currentSemester !== undefined && currentSemester !== null) {
      const semNum = Number(currentSemester);
      if (semNum >= 1 && semNum <= 8) {
        user.academicProfile.currentSemester = semNum;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          academicProfile: user.academicProfile,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while updating profile' });
  }
};

const getAllUsersAdmin = async (req, res) => {
  try {
    const { search, q, role, status } = req.query;
    const filter = {};

    if (role) {
      filter.role = role.toUpperCase();
    } else {
      filter.role = 'STUDENT';
    }

    if (status) {
      if (status === 'active') filter.isActive = true;
      if (status === 'suspended') filter.isActive = false;
    }

    const searchTerm = search || q;
    if (searchTerm && searchTerm.trim()) {
      const sanitized = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
        { 'academicProfile.courseName': { $regex: sanitized, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email role academicProfile isVerified isActive createdAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

const updateUserStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

module.exports = {
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
};
