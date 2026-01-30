import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userWalletAddress: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['follow_x', 'follow_instagram', 'join_telegram', 'share_app', 'purchase']
  },
  points: {
    type: Number,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  completed: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

activitySchema.index({ userWalletAddress: 1, actionType: 1 });

export default mongoose.model('Activity', activitySchema);
