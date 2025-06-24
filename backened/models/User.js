const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: String, // For OTP-based verification
  otpExpires: Date, // OTP expiration time
  isVerified: { type: Boolean, default: false }, // Verification status
  googleId: String, // For Google Sign-In authentication
});

module.exports = mongoose.model('User', userSchema);