const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
