import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';
import Product from '../../models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ajayte207_db_user:Ajayte207@cluster0.gohrt1h.mongodb.net/thruster?appName=Cluster0';

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    await connectDB();
    console.log('MongoDB connection established successfully');

    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products in database`);

    const responseData = { products };
    console.log(`Response length: ${JSON.stringify(responseData).length} characters`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
