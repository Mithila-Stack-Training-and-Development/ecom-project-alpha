// createAdmin.js (run this once)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

mongoose.connect('mongodb://localhost:27017/adminDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const hashedPassword = await bcrypt.hash('shree', 10);
  const admin = new Admin({ email: 'sikhashri1@gmail.com', password: hashedPassword });
  await admin.save();
  console.log('Default admin created!');
  mongoose.disconnect();
});
