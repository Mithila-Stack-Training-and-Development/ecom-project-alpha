/* ─────────── server.js ─────────── */
console.log('Starting server.js');

/* 1) ENV & early validation */
require('dotenv').config();            // loads .env at project root
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NODE_ENV } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error(
    'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env – aborting.'
  );
  process.exit(1);
}

/* 2) Core deps */
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');

/* 3) Route modules */
const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const cartRoutes     = require('./routes/cart');
const paymentRoutes  = require('./routes/payment');
const orderRoutes    = require('./routes/orderRoutes');   // ← orders endpoint

const app = express();

/* 4) Global middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* 5) API routes */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);   // ← mount products route correctly here
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

/* 6) Static file serving */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* 7) Serve React build in production */
if (NODE_ENV === 'production') {
  const client = path.join(__dirname, 'client', 'dist');
  app.use(express.static(client));
  app.get('*', (req, res) => res.sendFile(path.join(client, 'index.html')));
}

/* 8) 404 + error handling */
app.use((req, res) => {
  console.warn(`404 → ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error →', err);
  res.status(500).json({ message: 'Internal server error' });
});

/* 9) MongoDB connection */
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

/* 10) Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀  Server running on http://localhost:${PORT}`)
);
