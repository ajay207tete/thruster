const { Handler } = require('@netlify/functions');
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../../models/User');

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  await connectDB();

  try {
    if (event.httpMethod === 'POST' && event.path.endsWith('/wallet-connect')) {
      const { walletAddress } = JSON.parse(event.body || '{}');

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            message: 'Wallet address is required'
          }),
        };
      }

      // Validate wallet address format
      const walletRegex = /^UQ[A-Za-z0-9_-]{46}$|^EQ[A-Za-z0-9_-]{46}$/;
      if (!walletRegex.test(walletAddress)) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            message: 'Invalid wallet address format'
          }),
        };
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

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          user: {
            walletAddress: user.walletAddress,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          }
        }),
      };
    }

    if (event.httpMethod === 'POST' && event.path.endsWith('/ton-id/callback')) {
      const { code, state } = JSON.parse(event.body || '{}');

      if (!code) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            message: 'Authorization code is required'
          }),
        };
      }

      try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://oauth.ton.id/oauth/token', {
          grant_type: 'authorization_code',
          code,
          client_id: process.env.TON_ID_CLIENT_ID,
          client_secret: process.env.TON_ID_CLIENT_SECRET,
          redirect_uri: 'https://thruster-three.vercel.app/auth/callback'
        });

        const { access_token, id_token } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://oauth.ton.id/oauth/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });

        const userInfo = userResponse.data;

        // Find or create user
        let user = await User.findOne({ tonId: userInfo.sub });

        if (!user) {
          user = new User({
            tonId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            walletAddress: userInfo.wallet_address ? userInfo.wallet_address.toLowerCase() : null
          });
          await user.save();
        } else {
          user.lastLogin = new Date();
          await user.save();
        }

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: true,
            user: {
              tonId: user.tonId,
              email: user.email,
              name: user.name,
              walletAddress: user.walletAddress,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin
            },
            token: access_token
          }),
        };
      } catch (tokenError: any) {
        console.error('TON ID token exchange error:', tokenError);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            message: 'Failed to exchange authorization code'
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Endpoint not found'
      }),
    };

  } catch (error) {
    console.error('Auth function error:', error);

    if (error.code === 11000) {
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Wallet address already exists'
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      }),
    };
  }
};
