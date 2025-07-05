const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  category: String,
  brand: String,
  image: String,        // URL or relative path to image
  rating: Number,
  reviews: Number,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
