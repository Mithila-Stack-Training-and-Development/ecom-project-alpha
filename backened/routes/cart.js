const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Add item to cart
router.post('/cart', protect, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart
router.get('/cart', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.user.id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
