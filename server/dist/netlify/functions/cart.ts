import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import Cart from '../../models/Cart';

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
    const path = event.path.replace('/.netlify/functions/cart', '');
    const method = event.httpMethod;

    // GET /api/cart/:walletAddress
    if (method === 'GET' && path.startsWith('/')) {
      const walletAddress = path.substring(1);

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const cart = await Cart.findOne({ walletAddress: walletAddress.toLowerCase() })
        .populate('items.productId', 'name price image description')
        .lean();

      if (!cart) {
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            cart: { walletAddress: walletAddress.toLowerCase(), items: [], totalItems: 0, totalPrice: 0 }
          }),
        };
      }

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          cart: {
            ...cart,
            totalItems,
            totalPrice
          }
        }),
      };
    }

    // POST /api/cart/add
    if (method === 'POST' && path === '/add') {
      const { walletAddress, productId, quantity = 1 } = JSON.parse(event.body || '{}');

      if (!walletAddress || !productId) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address and product ID are required' }),
        };
      }

      let cart = await Cart.findOne({ walletAddress: walletAddress.toLowerCase() });

      if (!cart) {
        cart = new Cart({
          walletAddress: walletAddress.toLowerCase(),
          items: []
        });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
      await cart.populate('items.productId', 'name price image description');

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Item added to cart',
          cart: {
            ...cart.toObject(),
            totalItems,
            totalPrice
          }
        }),
      };
    }

    // PUT /api/cart/update
    if (method === 'PUT' && path === '/update') {
      const { walletAddress, productId, quantity } = JSON.parse(event.body || '{}');

      if (!walletAddress || !productId || quantity === undefined) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address, product ID, and quantity are required' }),
        };
      }

      const cart = await Cart.findOne({ walletAddress: walletAddress.toLowerCase() });

      if (!cart) {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Cart not found' }),
        };
      }

      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Item not found in cart' }),
        };
      }

      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      await cart.populate('items.productId', 'name price image description');

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Cart updated',
          cart: {
            ...cart.toObject(),
            totalItems,
            totalPrice
          }
        }),
      };
    }

    // DELETE /api/cart/clear/:walletAddress
    if (method === 'DELETE' && path.startsWith('/clear/')) {
      const walletAddress = path.replace('/clear/', '');

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address is required' }),
        };
      }

      const cart = await Cart.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { items: [] },
        { new: true }
      );

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Cart cleared',
          cart: {
            walletAddress: walletAddress.toLowerCase(),
            items: [],
            totalItems: 0,
            totalPrice: 0
          }
        }),
      };
    }

    // DELETE /api/cart/remove
    if (method === 'DELETE' && path === '/remove') {
      const { walletAddress, productId } = JSON.parse(event.body || '{}');

      if (!walletAddress || !productId) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Wallet address and product ID are required' }),
        };
      }

      const cart = await Cart.findOne({ walletAddress: walletAddress.toLowerCase() });

      if (!cart) {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, message: 'Cart not found' }),
        };
      }

      cart.items = cart.items.filter(
        item => item.productId.toString() !== productId
      );

      await cart.save();
      await cart.populate('items.productId', 'name price image description');

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Item removed from cart',
          cart: {
            ...cart.toObject(),
            totalItems,
            totalPrice
          }
        }),
      };
    }

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
    };

  } catch (error: any) {
    console.error('Cart function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
