const { Pool } = require('pg');
const fetch = require('node-fetch');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function testSnapshotLogic() {
  console.log('🧪 TESTING SNAPSHOT LOGIC\n');

  try {
    // Step 1: Update trip start time to simulate 6+ hours elapsed
    console.log('1️⃣ Updating trip start time to 6 hours 5 minutes ago...');
    await pool.query(`
      UPDATE trips 
      SET trip_start_time = NOW() - INTERVAL '6 hours 5 minutes'
      WHERE mandi_buyer_pin = '123456' AND status = 'active'
    `);

    // Step 2: Send a location update to trigger snapshot
    console.log('2️⃣ Sending location update to trigger 6-hour snapshot...');
    const response = await fetch('http://192.168.43.20:3001/api/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: '123456',
        driverPhone: '7985113984',
        latitude: 28.6150,
        longitude: 77.2100,
        speed: 35,
        heading: 90,
        altitude: 200,
        accuracy: 10,
        batteryLevel: 75,
        networkType: '4g'
      })
    });

    const result = await response.json();
    console.log('Response:', result);

    if (result.snapshotSaved) {
      console.log(`\n✅ SUCCESS: ${result.snapshotType} snapshot was saved!\n`);
    }

    // Step 3: Check snapshots in database
    console.log('3️⃣ Checking snapshots in database...');
    const snapshots = await pool.query(`
      SELECT 
        snapshot_type,
        latitude,
        longitude,
        battery_level,
        captured_at
      FROM location_snapshots 
      WHERE driver_phone = '7985113984'
      ORDER BY captured_at DESC
    `);

    if (snapshots.rows.length > 0) {
      console.log('\n📸 SNAPSHOTS FOUND:');
      console.table(snapshots.rows);
    } else {
      console.log('❌ No snapshots found');
    }

    // Step 4: Test 12-hour snapshot
    console.log('\n4️⃣ Testing 12-hour snapshot...');
    console.log('Updating trip to 12 hours 5 minutes ago...');
    await pool.query(`
      UPDATE trips 
      SET trip_start_time = NOW() - INTERVAL '12 hours 5 minutes'
      WHERE mandi_buyer_pin = '123456' AND status = 'active'
    `);

    // Send another update
    const response2 = await fetch('http://192.168.43.20:3001/api/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: '123456',
        driverPhone: '7985113984',
        latitude: 28.6160,
        longitude: 77.2110,
        speed: 40,
        heading: 180,
        altitude: 200,
        accuracy: 10,
        batteryLevel: 50,
        networkType: '4g'
      })
    });

    const result2 = await response2.json();
    if (result2.snapshotSaved) {
      console.log(`✅ ${result2.snapshotType} snapshot saved!`);
    }

    // Final check
    console.log('\n5️⃣ Final snapshot check...');
    const finalSnapshots = await pool.query(`
      SELECT 
        snapshot_type,
        COUNT(*) as count
      FROM location_snapshots 
      WHERE driver_phone = '7985113984'
      GROUP BY snapshot_type
    `);

    console.log('\n📊 SNAPSHOT SUMMARY:');
    console.table(finalSnapshots.rows);

    // Reset trip time to actual
    console.log('\n6️⃣ Resetting trip to actual time...');
    await pool.query(`
      UPDATE trips 
      SET trip_start_time = NOW() - INTERVAL '2 hours 30 minutes'
      WHERE mandi_buyer_pin = '123456' AND status = 'active'
    `);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testSnapshotLogic();
