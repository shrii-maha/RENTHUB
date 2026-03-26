const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const mockDb = require('../utils/mockDb');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  // We send the token in json body. The frontend will store it in localStorage
  res.status(statusCode).json({
    success: true,
    token,
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

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address, password, bankName, accountHolderName, accountNumber, ifscCode } = req.body;

    if (process.env.ALLOW_MOCK_LOGIN === 'true') {
      const mockUserExists = mockDb.findUserByEmail(email);
      if (mockUserExists) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      const newMockUser = mockDb.createUser(req.body);
      return sendTokenResponse(newMockUser, 201, res);
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      address,
      password,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      otpCode,
      otpExpires
    });

    // Send Email OTP
    // await sendEmail({
    //   email: user.email,
    //   subject: 'RentHub Email Verification Code',
    //   message: `Welcome to RentHub! Your verification code is: ${otpCode}. Valid for 10 minutes.`
    // });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    try {
      if (process.env.ALLOW_MOCK_LOGIN === 'true') {
        const mockUser = mockDb.findUserByEmail(email);
        if (!mockUser) {
           return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        // In mock mode, password is plain text
        if (mockUser.password !== password) {
           return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        return sendTokenResponse(mockUser, 200, res);
      }

      // Check for user
      const user = await User.findOne({ email }).select('+password').maxTimeMS(2000);

      if (!user) {
        if (process.env.ALLOW_MOCK_LOGIN === 'true') {
           return sendTokenResponse({ _id: 'mock_user_id', fullName: 'Development User', email: email, isAdmin: false, isVerified: true }, 200, res);
        }
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (user.isAdmin) {
        return res.status(401).json({ success: false, error: 'Admin must login via admin route' });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      sendTokenResponse(user, 200, res);
    } catch (dbError) {
      if (process.env.ALLOW_MOCK_LOGIN === 'true') {
        // Fallback to purely mocked dev user if no local user created yet
        console.warn('Database connection failed, using dev fallback mock login');
        return sendTokenResponse({ _id: 'mock_user_id', fullName: 'Development User', email: email, isAdmin: false, isVerified: true }, 200, res);
      }
      throw dbError;
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isAdmin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or you are not an admin' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    if (process.env.ALLOW_MOCK_LOGIN === 'true') {
      return res.status(200).json({
        success: true,
        data: req.user
      });
    }

    const user = await User.findById(req.user.id).maxTimeMS(2000);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
router.post('/verify-otp', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User already verified' });
    }

    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
router.post('/resend-otp', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User already verified' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'RentHub New Verification Code',
      message: `Your new RentHub verification code is: ${otpCode}. Valid for 10 minutes.`
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
