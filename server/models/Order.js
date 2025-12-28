const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['NOWPAYMENTS', 'TON_NATIVE']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  paymentId: {
    type: String,
    sparse: true
  },
  invoiceUrl: {
    type: String
  },
  txHash: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  }
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ paymentStatus: 1 });

orderSchema.pre('save', function(next) {
  if (this.paymentStatus === 'PAID' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
