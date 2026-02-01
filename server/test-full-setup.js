import mongoose from 'mongoose';
import Product from './models/Product.js';
import axios from 'axios';

const MONGODB_URI = 'mongodb+srv://ajayte207_db_user:Ajayte207@cluster0.gohrt1h.mongodb.net/thruster?appName=Cluster0';
const API_BASE_URL = 'http://localhost:8888'; // Netlify dev server

async function testFullSetup() {
  console.log('🚀 Testing Full Setup: Database + API + Products\n');

  try {
    // Step 1: Connect to database and seed products
    console.log('📊 Step 1: Connecting to database and seeding products...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    // Seed products
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
    console.log(`✅ Seeded ${createdProducts.length} products`);

    // Step 2: Test API endpoint
    console.log('\n🌐 Step 2: Testing API endpoint...');

    try {
      const response = await axios.get(`${API_BASE_URL}/.netlify/functions/products`, {
        timeout: 5000 // 5 second timeout
      });

      console.log('✅ API call successful');
      console.log('📦 Response structure:', {
        hasProducts: !!response.data.products,
        productCount: response.data.products?.length || 0,
        hasPagination: !!response.data.pagination
      });

      if (response.data.products && response.data.products.length > 0) {
        console.log('🎉 SUCCESS: Products are visible via API!');
        console.log('📋 Sample products:');
        response.data.products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
        });

        if (response.data.pagination) {
          console.log('📄 Pagination info:', {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            hasNextPage: response.data.pagination.hasNextPage
          });
        }
      } else {
        console.log('❌ API returned empty products array');
      }

    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
      if (apiError.code === 'ECONNREFUSED') {
        console.log('💡 SOLUTION: Start Netlify dev server with: cd server && npx netlify dev');
      } else if (apiError.code === 'ENOTFOUND') {
        console.log('💡 SOLUTION: Check if Netlify dev server is running on port 8888');
      }
    }

    // Step 3: Summary
    console.log('\n📋 SETUP SUMMARY:');
    console.log('✅ Database: Connected and seeded');
    console.log('✅ Products: 5 products created');
    console.log('⏳ API: Test completed (see results above)');

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start Netlify dev server: cd server && npx netlify dev');
    console.log('2. Start Expo client: cd client && npx expo start');
    console.log('3. Check shop page for products');

  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testFullSetup();
