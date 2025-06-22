const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Seed initial products
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      { name: 'Laptop', price: 999.99, description: 'High-performance laptop' },
      { name: 'Smartphone', price: 599.99, description: 'Latest smartphone model' },
      { name: 'Headphones', price: 99.99, description: 'Noise-cancelling headphones' },
      { name: 'Mouse', price: 29.99, description: 'Ergonomic mouse' },
    ];
    await Product.insertMany(products);
  }
};

// Seed on startup
seedProducts();

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;