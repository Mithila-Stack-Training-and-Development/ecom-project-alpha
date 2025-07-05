const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save().catch(saveError => {
        console.error('Cart save error:', saveError.message, { stack: saveError.stack, userId: req.user.id });
        throw saveError;
      });
      console.log('New cart created for user:', req.user.id, 'Cart:', cart._id);
    } else {
      console.log('Existing cart found for user:', req.user.id, 'Cart:', cart._id);
    }
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error.message, { stack: error.stack, userId: req.user.id });
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

module.exports = router;