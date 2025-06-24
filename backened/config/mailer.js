/**
 * Nodemailer transport – uses a Gmail “App password”.
 * 1. Turn on 2-Step Verification for your Google account
 * 2. Generate an App Password (➜ Security ➜ App passwords)
 * 3. Put it in .env as GMAIL_PASS
 */

const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,   // your@gmail.com
    pass: process.env.GMAIL_PASS,   // 16-char app password
  },
});

module.exports = mailTransport;
