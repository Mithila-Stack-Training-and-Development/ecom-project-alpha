// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
require('dotenv').config();
require('dotenv').config({ path: '.env.admin' });
const adminRoutes = require('./routes/adminAuth');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);  // 🛠️ use specific base path
app.use('/api/cart', cartRoutes);         // 🛠️ use proper base path
app.use('/api/orders', orderRoutes);      // 🛠️ use proper base path
app.use('/api/admin', adminRoutes); // 🛠️ use specific base path for admin routes

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/shopease', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
