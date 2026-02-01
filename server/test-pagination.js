const axios = require('axios');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

async function testPagination() {
  console.log('Testing pagination API...');

  try {
    // Test page 1 with limit 5
    console.log('\n1. Testing page 1 with limit 5:');
    const response1 = await axios.get(`${API_BASE_URL}/products?page=1&limit=5`);
    console.log('Status:', response1.status);
    console.log('Has products array:', Array.isArray(response1.data.products));
    console.log('Products count:', response1.data.products?.length || 0);
    console.log('Pagination info:', JSON.stringify(response1.data.pagination, null, 2));

    // Test page 2 with limit 5
    console.log('\n2. Testing page 2 with limit 5:');
    const response2 = await axios.get(`${API_BASE_URL}/products?page=2&limit=5`);
    console.log('Status:', response2.status);
    console.log('Products count:', response2.data.products?.length || 0);
    console.log('Pagination info:', JSON.stringify(response2.data.pagination, null, 2));

    // Test without pagination params (backward compatibility)
    console.log('\n3. Testing without pagination params:');
    const response3 = await axios.get(`${API_BASE_URL}/products`);
    console.log('Status:', response3.status);
    console.log('Response type:', typeof response3.data);
    console.log('Has products array:', Array.isArray(response3.data.products));
    console.log('Products count:', Array.isArray(response3.data.products) ? response3.data.products.length : 'N/A');

    // Test invalid page
    console.log('\n4. Testing invalid page number:');
    const response4 = await axios.get(`${API_BASE_URL}/products?page=999&limit=5`);
    console.log('Status:', response4.status);
    console.log('Products count:', response4.data.products?.length || 0);
    console.log('Pagination info:', JSON.stringify(response4.data.pagination, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPagination();
