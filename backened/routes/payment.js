const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const Cart = require('../models/Cart');
const Order = require('../models/Order');

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env – cannot start payment routes');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

router.post('/create-order', auth, async (req, res) => {
  try {
    const { cartId } = req.body;
    if (!cartId) return res.status(400).json({ message: 'cartId is required' });

    const cart = await Cart.findOne({ _id: cartId, user: req.user.id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    if (!cart.items || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const totalPaise = cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity * 100);
    }, 0);
    if (totalPaise <= 0) return res.status(400).json({ message: 'Invalid cart total' });

    const rpOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: `rcpt_${cartId}`,
      payment_capture: 1,
    });

    res.json({
      orderId: rpOrder.id,
      key: RAZORPAY_KEY_ID,
      amount: totalPaise / 100,
      currency: 'INR',
    });
  } catch (err) {
    console.error('Order creation error:', err.message, err.stack);
    res.status(500).json({ message: 'Order creation failed', details: err.message });
  }
});

router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !cartId) {
      return res.status(400).json({ message: 'Missing payment fields' });
    }

    const hmac = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (hmac !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const cart = await Cart.findOne({ _id: cartId, user: req.user.id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const total = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);

    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        productId: item.product?._id,
        name: item.product?.name,
        quantity: item.quantity,
        price: item.product?.price,
      })),
      total,
      shipping: {},
      paymentMethod: 'credit_card',
      paymentId: razorpay_payment_id,
      status: 'paid',
    });
    await order.save();

    await Cart.findByIdAndUpdate(cartId, { status: 'paid' });

    res.json({ message: 'Payment verified', paymentId: razorpay_payment_id, orderId: order._id });
  } catch (err) {
    console.error('Payment verification error:', err.message, err.stack);
    res.status(500).json({ message: 'Payment verification failed', details: err.message });
  }
});

module.exports = router;