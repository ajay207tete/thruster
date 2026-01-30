import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Reward from './models/Reward.js';
import PaymentLog from './models/PaymentLog.js';
import Cart from './models/Cart.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = 'mongodb+srv://ajayte207_db_user:Ajayte207@cluster0.gohrt1h.mongodb.net/thruster?appName=Cluster0';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding');

    // Clear existing data from all collections
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Reward.deleteMany({});
    await PaymentLog.deleteMany({});
    await Cart.deleteMany({});

    console.log('Cleared existing data from all collections (skipping users)');

    // Create sample products
    const products = [
      {
        name: 'Neon Jacket',
        description: 'A stylish neon jacket for the cyberpunk enthusiast.',
        imageUrl: 'https://example.com/images/neon-jacket.jpg',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['neon green', 'neon pink'],
        price: 120,
        stock: 10,
        category: 'clothing',
      },
      {
        name: 'Smart Gloves',
        description: 'Gloves with smart tech integration.',
        imageUrl: 'https://example.com/images/smart-gloves.jpg',
        sizes: ['M', 'L'],
        colors: ['black', 'grey'],
        price: 80,
        stock: 15,
        category: 'accessories',
      },
      {
        name: 'LED Cap',
        description: 'Cap with LED lights for night visibility.',
        imageUrl: 'https://example.com/images/led-cap.jpg',
        sizes: ['One Size'],
        colors: ['red', 'blue'],
        price: 60,
        stock: 20,
        category: 'headwear',
      },
      {
        name: 'Cyberpunk Boots',
        description: 'High-tech boots with integrated LED lighting.',
        imageUrl: 'https://example.com/images/cyber-boots.jpg',
        sizes: ['8', '9', '10', '11', '12'],
        colors: ['black', 'silver'],
        price: 180,
        stock: 8,
        category: 'footwear',
      },
      {
        name: 'Neural Implant',
        description: 'Advanced neural interface device.',
        imageUrl: 'https://example.com/images/neural-implant.jpg',
        sizes: ['Standard'],
        colors: ['metallic'],
        price: 500,
        stock: 3,
        category: 'electronics',
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Sample products created');

    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Products created: ${createdProducts.length}`);

    mongoose.connection.close();
    console.log('\nSeeding complete and connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
