const http = require('http');

function testTasksAPI() {
  console.log('Testing tasks API endpoint...');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/rewards/tasks',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('API Response:', JSON.stringify(jsonData, null, 2));
        console.log(`Found ${Array.isArray(jsonData) ? jsonData.length : 0} tasks`);

        if (Array.isArray(jsonData) && jsonData.length > 0) {
          console.log('Sample task:', jsonData[0]);
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing API:', error.message);
  });

  req.end();
}

testTasksAPI();
