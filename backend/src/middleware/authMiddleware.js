// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    // attach a stable shape
    req.user = { _id: user._id, id: String(user._id), email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
