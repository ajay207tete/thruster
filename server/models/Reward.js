const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userWallet: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^UQ[A-Za-z0-9_-]{46}$/.test(v) || /^EQ[A-Za-z0-9_-]{46}$/.test(v);
      },
      message: 'Invalid TON wallet address format'
    }
  },
  actionType: {
    type: String,
    required: true,
    enum: ['PURCHASE', 'FOLLOW_X', 'FOLLOW_INSTAGRAM', 'SHARE_APP']
  },
  platform: {
    type: String,
    required: true,
    enum: ['STORE_PURCHASE', 'X', 'INSTAGRAM', 'APP_SHARE']
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['COMPLETED', 'PENDING'],
    default: 'COMPLETED'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
});

rewardSchema.index({ userWallet: 1, actionType: 1 });
rewardSchema.index({ userWallet: 1, timestamp: -1 });

export default mongoose.model('Reward', rewardSchema);
