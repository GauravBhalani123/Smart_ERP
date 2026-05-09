const jwt = require('jsonwebtoken');
const roles = require('../config/roles');

function authMiddleware(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  authorize,
  roles,
};

