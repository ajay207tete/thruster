import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/undefined
        return /^uq[a-z0-9_-]{46}$/.test(v) || /^eq[a-z0-9_-]{46}$/.test(v);
      },
      message: 'Invalid TON wallet address format'
    }
  },
  tonId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

userSchema.index({ walletAddress: 1 });

export default mongoose.model('User', userSchema);
