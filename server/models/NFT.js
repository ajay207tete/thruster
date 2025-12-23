const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  walletAddress: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^UQ[A-Za-z0-9_-]{46}$/.test(v) || /^EQ[A-Za-z0-9_-]{46}$/.test(v);
      },
      message: 'Invalid TON wallet address format'
    }
  },
  nftAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  metadataUrl: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

nftSchema.index({ walletAddress: 1, createdAt: -1 });
nftSchema.index({ nftAddress: 1 });

nftSchema.pre('save', async function(next) {
  try {
    const Order = mongoose.model('Order');
    const order = await Order.findById(this.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.nftMinted) {
      throw new Error('NFT already minted for this order');
    }

    order.nftMinted = true;
    await order.save();

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('NFT', nftSchema);
