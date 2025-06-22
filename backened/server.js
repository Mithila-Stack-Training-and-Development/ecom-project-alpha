const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products'); // Ensure this file exists
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // Mounts /api/products and other product routes

// Catch-all for undefined routes
app.use((req, res) => {
  console.log(`404 Error: No route found for ${req.method} ${req.url} from ${req.get('origin') || req.get('referer') || 'unknown'}`);
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/shopease', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));