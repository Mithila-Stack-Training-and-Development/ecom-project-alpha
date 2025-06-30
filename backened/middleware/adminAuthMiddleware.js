const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.header('admin-token');
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

module.exports = adminAuth;
