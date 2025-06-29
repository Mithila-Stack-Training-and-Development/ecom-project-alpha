console.log('Starting server.js');

console.log('Loading environment variables');
require('dotenv').config(); // Load .env from project root

console.log('Verifying Razorpay keys');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error(
    'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env – aborting server start.'
  );
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

console.log('Initializing routes');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/orderRoutes'); // NEW

const app = express();

/* ─────────── Global middleware ─────────── */
app.use(cors());
app.use(express.json());

/* ─────────── Routes ─────────── */
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // mounts /api/products/…
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes); // NEW

/* ─────────── 404 handler ─────────── */
app.use((req, res) => {
  console.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

/* ─────────── MongoDB connection ─────────── */
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopease', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/* ─────────── Start server ─────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (env: ${process.env.NODE_ENV})`)
);