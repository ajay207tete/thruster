const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^UQ[A-Za-z0-9_-]{46}$/.test(v) || /^EQ[A-Za-z0-9_-]{46}$/.test(v);
      },
      message: 'Invalid TON wallet address format'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ walletAddress: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', function(next) {
  this.lastLogin = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
