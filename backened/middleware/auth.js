const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Auth error:', error.name, error.message, { token: token.slice(0, 10) + '...' });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired', error: error.name });
    }
    res.status(401).json({ message: 'Token is invalid', error: error.name });
  }
};