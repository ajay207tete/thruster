import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
const userService = require('../../services/user.service');

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
    const path = event.path.replace('/.netlify/functions/user', '');
    const method = event.httpMethod;

    // POST /api/user/register
    if (method === 'POST' && path === '/register') {
      const { walletAddress } = JSON.parse(event.body || '{}');

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const result = await userService.registerUser(walletAddress);

      return {
        statusCode: result.success ? 201 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/user/profile/:walletAddress
    if (method === 'GET' && path.startsWith('/profile/')) {
      const walletAddress = path.replace('/profile/', '');

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const result = await userService.getUserProfile(walletAddress);

      return {
        statusCode: result.success ? 200 : 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // PUT /api/user/profile/:walletAddress
    if (method === 'PUT' && path.startsWith('/profile/')) {
      const walletAddress = path.replace('/profile/', '');
      const updateData = JSON.parse(event.body || '{}');

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const result = await userService.updateUserProfile(walletAddress, updateData);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // DELETE /api/user/:walletAddress
    if (method === 'DELETE' && path.startsWith('/')) {
      const walletAddress = path.substring(1);

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const result = await userService.deleteUser(walletAddress);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
      };
    }

    // GET /api/user/stats/admin
    if (method === 'GET' && path === '/stats/admin') {
      const result = await userService.getUserStats();

      return {
        statusCode: result.success ? 200 : 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/user/admin/all
    if (method === 'GET' && path === '/admin/all') {
      const queryParams = event.queryStringParameters || {};
      const page = parseInt(queryParams.page || '1');
      const limit = parseInt(queryParams.limit || '20');

      const result = await userService.getAllUsers(page, limit);

      return {
        statusCode: result.success ? 200 : 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // POST /api/user/login
    if (method === 'POST' && path === '/login') {
      const { walletAddress } = JSON.parse(event.body || '{}');

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const result = await userService.loginUser(walletAddress);

      return {
        statusCode: result.success ? 200 : 401,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
    };

  } catch (error: any) {
    console.error('User function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
