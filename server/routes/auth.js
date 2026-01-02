import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/wallet-connect
router.post('/wallet-connect', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Validate wallet address format
    const walletRegex = /^UQ[A-Za-z0-9_-]{46}$|^EQ[A-Za-z0-9_-]{46}$/;
    if (!walletRegex.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    // Check if user exists
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      // Create new user
      user = new User({
        walletAddress: walletAddress.toLowerCase()
      });
      await user.save();
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Wallet connect error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Wallet address already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
