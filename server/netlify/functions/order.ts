import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import orderService from '../../services/order.service';

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
    const path = event.path.replace('/.netlify/functions/order', '');
    const method = event.httpMethod;

    // POST /api/order/create
    if (method === 'POST' && path === '/create') {
      const { walletAddress, paymentMethod, shippingDetails } = JSON.parse(event.body || '{}');

      if (!walletAddress || !paymentMethod) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address and payment method are required' }),
        };
      }

      const result = await orderService.createOrderFromCart(walletAddress, paymentMethod, shippingDetails);

      return {
        statusCode: result.success ? 200 : 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    // GET /api/order/:orderId
    if (method === 'GET' && path.startsWith('/')) {
      const orderId = path.substring(1);

      if (!orderId) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Order ID is required' }),
        };
      }

      const result = await orderService.getOrderById(orderId);

      return {
        statusCode: result.success ? 200 : 404,
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
    console.error('Order function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
