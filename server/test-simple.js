// Simple test to check if the server responds correctly
fetch('http://192.168.43.20:3001/api/start-trip', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    driverPhone: '7985113984', // Without +91 as per your logs
    ridePin: '123456',
    latitude: 28.6139,
    longitude: 77.2090
  })
})
.then(res => {
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  return res.text(); // Get text first to see what's being returned
})
.then(text => {
  console.log('Response text:', text);
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
  } catch (e) {
    console.log('Not valid JSON');
  }
})
.catch(err => console.error('Error:', err));
