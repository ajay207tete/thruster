import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

async function testProductsAPI() {
  try {
    console.log('🧪 Testing Products API endpoint...\n');

    // Test products endpoint
    console.log('📦 Testing GET /api/products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
    console.log('✅ Products API response received');

    const products = productsResponse.data;
    console.log('📊 Response type:', typeof products);
    console.log('📊 Response length:', Array.isArray(products) ? products.length : 'N/A');

    if (Array.isArray(products) && products.length > 0) {
      console.log(`📋 Found ${products.length} products in database:`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || 'Unnamed'} - $${product.price || 'N/A'} (${product.category || 'No category'})`);
        console.log(`   Stock: ${product.stock || 0}, Image: ${product.imageUrl ? '✅' : '❌'}`);
      });
      console.log('\n✅ Products API test PASSED - Products are available!');
    } else if (products.products && Array.isArray(products.products)) {
      // Handle paginated response
      console.log(`📋 Found ${products.products.length} products in paginated response:`);
      products.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || 'Unnamed'} - $${product.price || 'N/A'}`);
      });
      console.log('\n✅ Products API test PASSED - Products are available!');
    } else {
      console.log('❌ No products found in database');
      console.log('Response data:', products);
      console.log('\n❌ Products API test FAILED - No products returned');
    }

  } catch (error) {
    console.error('❌ Products API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server might not be running. Try: node server/server.js');
    } else if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testProductsAPI();
