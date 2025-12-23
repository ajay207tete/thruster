const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['NOWPAYMENTS', 'TON'],
    index: true
  },
  status: {
    type: String,
    required: true,
    index: true
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

paymentLogSchema.index({ orderId: 1, createdAt: -1 });
paymentLogSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
