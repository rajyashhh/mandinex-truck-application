const http = require('http');

// Test data
const testData = {
  driverPhone: "1234567890",
  ridePin: "123456",
  latitude: 28.6139,
  longitude: 77.2090
};

// Make POST request
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/start-trip',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed JSON:', parsed);
    } catch (e) {
      console.log('Not valid JSON, raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(JSON.stringify(testData));
req.end();
