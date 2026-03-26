const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback: Check HttpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    }

    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE] Error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Your session has expired. Please log in again.' });
    }
    if (err.name === 'MongooseServerSelectionError' || err.message.includes('buffering timed out')) {
      return res.status(503).json({ success: false, error: 'Database is temporarily unavailable. Please try again.' });
    }
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

// Grant access to admins only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
};
