const fetch = require('node-fetch');

// Configuration
const API_BASE = 'http://192.168.43.20:3001';
const DRIVER_PHONE = '7985113984';
const TRIP_PIN = '123456';

let updateCount = 0;

// Simulate location updates
async function sendLocationUpdate() {
  updateCount++;
  
  // Simulate movement (small changes in lat/lng)
  const latitude = 28.6140 + (Math.random() * 0.001);
  const longitude = 77.2091 + (Math.random() * 0.001);
  const speed = 20 + Math.random() * 30; // 20-50 km/h
  const heading = Math.floor(Math.random() * 360);
  const batteryLevel = 100 - updateCount; // Simulate battery drain

  try {
    const response = await fetch(`${API_BASE}/api/update-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: TRIP_PIN,
        driverPhone: DRIVER_PHONE,
        latitude,
        longitude,
        speed,
        heading,
        altitude: 200,
        accuracy: 10,
        batteryLevel,
        networkType: '4g'
      })
    });

    const result = await response.json();
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`[${timestamp}] Update #${updateCount}:`, {
      lat: latitude.toFixed(6),
      lng: longitude.toFixed(6),
      speed: speed.toFixed(1) + ' km/h',
      battery: batteryLevel + '%',
      ...result
    });

    // Check if snapshot was saved
    if (result.snapshotSaved) {
      console.log(`\n🎯 SNAPSHOT SAVED: ${result.snapshotType}\n`);
    }

  } catch (error) {
    console.error('Error sending update:', error.message);
  }
}

// Test mode selection
const mode = process.argv[2];

if (mode === '--continuous') {
  console.log('📍 Starting continuous location updates (every 30 seconds)...\n');
  sendLocationUpdate(); // Send first update immediately
  setInterval(sendLocationUpdate, 30000); // Then every 30 seconds
} else if (mode === '--fast') {
  console.log('⚡ Fast mode: Sending 10 updates with 2-second intervals...\n');
  let count = 0;
  const fastInterval = setInterval(() => {
    sendLocationUpdate();
    count++;
    if (count >= 10) {
      clearInterval(fastInterval);
      console.log('\n✅ Fast mode complete. Check database for updates.');
    }
  }, 2000);
} else if (mode === '--test-snapshot') {
  console.log('🧪 Testing snapshot logic by manipulating trip time...\n');
  console.log('This would require updating the trip start time in the database.');
  console.log('Run the SQL below to test 6-hour snapshot:\n');
  console.log(`UPDATE trips SET trip_start_time = NOW() - INTERVAL '6 hours 5 minutes' WHERE mandi_buyer_pin = '${TRIP_PIN}' AND status = 'active';`);
  console.log('\nThen run: node simulate-location-updates.js --fast');
} else {
  console.log('📍 Sending a single location update...\n');
  sendLocationUpdate();
  console.log('\nUsage:');
  console.log('  node simulate-location-updates.js              # Single update');
  console.log('  node simulate-location-updates.js --fast       # 10 quick updates');
  console.log('  node simulate-location-updates.js --continuous # Update every 30s');
  console.log('  node simulate-location-updates.js --test-snapshot # Instructions for testing snapshots');
}
