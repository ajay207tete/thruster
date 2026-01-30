import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userWalletAddress: {
    type: String,
    required: true,
    index: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    qty: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['TON', 'INR']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  txHash: {
    type: String
  },
  rewardPointsEarned: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

orderSchema.index({ userWalletAddress: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
