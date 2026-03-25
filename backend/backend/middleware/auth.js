const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user ID:', decoded.id);
    
    if (process.env.ALLOW_MOCK_LOGIN === 'true') {
      const mockUser = require('../utils/mockDb').findUserById(decoded.id);
      if (mockUser) {
        req.user = mockUser;
        return next();
      }
    }

    req.user = await User.findById(decoded.id).maxTimeMS(2000);
    console.log('User found in middleware:', req.user ? req.user.email : 'None');
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (req.user.isBlocked) {
      console.log('Blocked user attempt:', req.user.email);
      return res.status(403).json({ success: false, error: 'Your account has been blocked.' });
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'MongooseServerSelectionError' || err.message.includes('connection')) {
      return res.status(503).json({ success: false, error: 'Database is currently unreachable.' });
    }
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

// Grant access to specific roles (admin)
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'User role is not authorized' });
  }
};
