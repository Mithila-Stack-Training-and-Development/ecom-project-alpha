const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
