const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const authenticate = require('../middleware/auth');

// Create Order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!Array.isArray(items) || items.length === 0 || total == null) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const badItem = items.find(
      (item) =>
        !item.name ||
        !item.productId ||
        !item.quantity ||
        item.quantity <= 0 ||
        item.price == null ||
        item.price < 0
    );
    if (badItem) {
      return res.status(400).json({ message: 'Invalid order item', item: badItem });
    }

    const order = new Order({
      userId: new mongoose.Types.ObjectId(req.user.id),
      items,
      total,
      status: 'Pending', // optional default status
    });

    await order.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get Orders for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    // Sort by createdAt descending for latest orders first
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

module.exports = router;
