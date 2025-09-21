// Test location update endpoint
fetch('http://192.168.43.20:3001/api/update-location', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tripId: '123456', // Using the PIN as tripId
    driverPhone: '7985113984',
    latitude: 28.6140,
    longitude: 77.2091,
    speed: 30,
    heading: 45,
    altitude: 200,
    accuracy: 10,
    batteryLevel: 85,
    networkType: '4g'
  })
})
.then(res => res.json())
.then(json => {
  console.log('Update Location Response:', json);
})
.catch(err => console.error('Error:', err));
