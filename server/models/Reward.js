import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  rewardType: {
    type: String,
    required: true,
    enum: ['PURCHASE', 'FOLLOW_X', 'FOLLOW_INSTAGRAM', 'SHARE_APP']
  },
  actionId: {
    type: String,
    required: true,
    index: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Compound index to prevent duplicate rewards
rewardSchema.index({ userId: 1, rewardType: 1, actionId: 1 }, { unique: true });
rewardSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model('Reward', rewardSchema);
