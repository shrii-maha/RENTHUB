const User = require('../models/User');

exports.verified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address to access this feature'
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error check' });
  }
};
