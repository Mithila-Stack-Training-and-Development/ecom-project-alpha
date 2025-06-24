const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const { protect } = require('../middleware/auth');

// Place Order from Cart
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
    });

    await order.save();
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders for a user
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
