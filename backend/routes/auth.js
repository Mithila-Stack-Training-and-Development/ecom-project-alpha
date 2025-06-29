const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const Cart = require('../models/Cart');

// Nodemailer setup with environment variables
const { EMAIL_USER, EMAIL_PASS } = process.env;
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('EMAIL_USER or EMAIL_PASS missing in .env – aborting server start.');
  process.exit(1);
}
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Google OAuth2 Client with environment variable
const { GOOGLE_CLIENT_ID } = process.env;
if (!GOOGLE_CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID missing in .env – aborting server start.');
  process.exit(1);
}
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Secure this in production

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via Email
const sendOTP = async (email) => {
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  try {
    await mailTransport.sendMail({
      from: EMAIL_USER,
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

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const { otp, otpExpires } = await sendOTP(email);
    const user = new User({
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
    res.status(500).json({ message: 'Server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Signup - Step 2: Verify OTP
router.post('/signup/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    console.log('OTP verified, user saved:', user.email);

    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
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

    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Google Sign-In Route
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        isVerified: true,
        password: null,
      });
      await user.save();
      console.log('New user created with Google:', email);
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
      console.log('Google account linked to existing user:', email);
    }

    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

module.exports = router;