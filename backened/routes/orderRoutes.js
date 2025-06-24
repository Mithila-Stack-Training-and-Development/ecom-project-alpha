const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authenticate = require('../middleware/authenticate'); // JWT middleware

// ⬇️ Create Order (POST /api/orders)
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0 || !total) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const order = new Order({
      userId: req.user.id,
      items,
      total,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// ⬇️ Get Orders for logged-in user (GET /api/orders)
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

module.exports = router;
