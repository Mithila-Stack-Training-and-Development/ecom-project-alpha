const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Nodemailer setup (replace with your credentials)
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amanroy9658@gmail.com', // Replace with your Gmail address
    pass: 'lkiz atnf tlcp qjkv',    // Replace with your App Password
  },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via Email
const sendOTP = async (email) => {
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  try {
    await mailTransport.sendMail({
      from: 'amanroy9658@gmail.com',
      to: email,
      subject: 'ShopEase OTP Verification',
      text: `Your ShopEase OTP is ${otp}. Valid for 10 minutes.`,
    });
    console.log(`OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error('Send OTP error:', error);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }

  return { otp, otpExpires };
};

// Signup - Step 1: Request OTP
router.post('/signup/request-otp', async (req, res) => {
  const { name, email, password } = req.body;

  console.log('Received data:', req.body);

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    const { otp, otpExpires } = await sendOTP(email);
    user = new User({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      otp,
      otpExpires,
      isVerified: false,
    });
    await user.save();
    console.log('User saved with OTP:', { email, otp, otpExpires });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Signup - Step 2: Verify OTP
router.post('/signup/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  console.log('Verifying OTP:', { email, otp });

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log('Stored OTP data:', { storedOtp: user.otp, storedExpires: user.otpExpires, currentTime: new Date() });
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    console.log('OTP verified, user saved:', user.email);

    const JWT_SECRET = process.env.JWT_SECRET; // Use environment variable
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables');
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Signup Route (Legacy, auto-verified)
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    await user.save();

    const JWT_SECRET = process.env.JWT_SECRET; // Use environment variable
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables');
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) return res.status(400).json({ message: 'Invalid credentials or unverified account' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const JWT_SECRET = process.env.JWT_SECRET; // Use environment variable
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables');
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;