/**
 * routes/products.js
 * Handles product CRUD + image upload
 */
const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Product  = require('../models/Product');   // Mongoose product model

/* ────────────────────────
   Multer configuration
──────────────────────────*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');               // images saved here
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// optional image‑type guard
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('Only image files allowed'), ok);
};

const upload = multer({ storage, fileFilter });

/* ────────────────────────
   POST /api/products
──────────────────────────*/
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      rating,
      reviews,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      brand,
      rating: rating ? Number(rating) : undefined,
      reviews: reviews ? Number(reviews) : undefined,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

/* ────────────────────────
   GET /api/products
   Return all products
──────────────────────────*/
router.get('/', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

/* ────────────────────────
   GET /api/products/:id
   Return single product
──────────────────────────*/
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

/* ────────────────────────
   DELETE /api/products/:id
   (Optional) remove a product
──────────────────────────*/
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
