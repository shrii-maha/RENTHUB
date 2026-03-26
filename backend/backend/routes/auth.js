const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// ============================================================
// HELPER: Create JWT token, set HttpOnly cookie, send response
// ============================================================
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token, // Also send in body for localStorage fallback
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      bankName: user.bankName,
      accountHolderName: user.accountHolderName,
      accountNumber: user.accountNumber,
      ifscCode: user.ifscCode
    }
  });
};

// ============================================================
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ============================================================
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ============================================================
// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
// ============================================================
router.get('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ============================================================
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, password } = req.body;

    // --- Validation ---
    if (!fullName || !email || !phoneNumber || !address || !password) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields' });
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    if (phoneNumber.length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide a valid phone number' });
    }

    // --- Check if user already exists ---
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    // --- Create user ---
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber,
      address,
      password,
      isVerified: true // Auto-verify: no OTP friction
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('[AUTH] Register error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// ============================================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide your email and password' });
    }

    // --- Find user and include password field ---
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No account found with this email. Please sign up first.',
        shouldSignUp: true  // Frontend can use this flag to redirect
      });
    }

    // --- Admin check ---
    if (user.isAdmin) {
      return res.status(401).json({ success: false, error: 'Admin accounts must use the admin login page' });
    }

    // --- Blocked user check ---
    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    }

    // --- Password match ---
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// ============================================================
// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
// ============================================================
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !user.isAdmin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or not an admin account' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[AUTH] Admin login error:', error.message);
    res.status(500).json({ success: false, error: 'Server error during admin login' });
  }
});

// ============================================================
// @desc    Forgot Password (sends OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
// ============================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Security: Don't reveal if the email exists or not
      return res.status(200).json({ success: true, message: 'If this email exists, an OTP has been sent to it.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    // Respond immediately, send email in background
    res.status(200).json({ success: true, message: 'If this email exists, an OTP has been sent to it.' });

    // Send email asynchronously
    const sendEmail = require('../utils/sendEmail');
    sendEmail({
      email: user.email,
      subject: 'RentHub Password Reset OTP',
      message: `Your RentHub password reset code is: ${otpCode}. It is valid for 10 minutes. If you did not request this, please ignore this email.`
    }).then(() => {
      console.log(`[AUTH] Forgot password OTP sent to: ${user.email}`);
    }).catch(emailErr => {
      console.error(`[AUTH] Failed to send OTP email to ${user.email}:`, emailErr.message);
    });

  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error processing request' });
  }
});

// ============================================================
// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
// ============================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp.trim() || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code' });
    }

    // Update password — pre-save hook will hash it
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error resetting password' });
  }
});

module.exports = router;
