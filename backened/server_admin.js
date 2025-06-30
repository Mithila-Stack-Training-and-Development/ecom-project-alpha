require('dotenv').config({ path: '.env.admin' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRoutes = require('./routes/adminAuth');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to Admin MongoDB'))
  .catch((err) => console.error('Mongo error:', err));

app.listen(process.env.PORT, () =>
  console.log(`Admin backend running on port ${process.env.PORT}`)
);
