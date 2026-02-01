import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888'; // Netlify dev default port

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test products endpoint
    console.log('📦 Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/.netlify/functions/products`);
    console.log('✅ Products response:', productsResponse.data);

    if (productsResponse.data.products && productsResponse.data.products.length > 0) {
      console.log(`📊 Found ${productsResponse.data.products.length} products in database`);
      productsResponse.data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price}`);
      });
    } else {
      console.log('❌ No products found in database');
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Netlify dev server might not be running. Try: cd server && npx netlify dev');
    }
  }
}

testAPI();
