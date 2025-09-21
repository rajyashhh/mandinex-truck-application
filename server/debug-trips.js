const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function debugTrips() {
  try {
    console.log('=== DEBUGGING TRIP ISSUES ===\n');

    // 1. Check all trips
    console.log('1️⃣ ALL TRIPS IN DATABASE:');
    const allTrips = await pool.query(`
      SELECT 
        id,
        driver_phone,
        mandi_buyer_pin,
        status,
        trip_start_time,
        driver_id
      FROM trips 
      ORDER BY id DESC
      LIMIT 10
    `);
    console.table(allTrips.rows);

    // 2. Check active trips specifically
    console.log('\n2️⃣ ACTIVE TRIPS:');
    const activeTrips = await pool.query(`
      SELECT * FROM trips WHERE status = 'active'
    `);
    console.log('Active trips count:', activeTrips.rows.length);
    if (activeTrips.rows.length > 0) {
      console.table(activeTrips.rows);
    }

    // 3. Check drivers table
    console.log('\n3️⃣ DRIVERS WITH PHONE 7985113984:');
    const drivers = await pool.query(`
      SELECT id, driver_phone, driver_name 
      FROM drivers 
      WHERE driver_phone LIKE '%7985113984%'
    `);
    console.table(drivers.rows);

    // 4. Check what's in current_locations
    console.log('\n4️⃣ CURRENT LOCATIONS:');
    const locations = await pool.query(`
      SELECT 
        driver_id,
        driver_phone,
        trip_id,
        trip_active,
        last_updated
      FROM current_locations
      WHERE driver_phone LIKE '%7985113984%'
    `);
    console.table(locations.rows);

    // 5. Test the exact query from the server
    console.log('\n5️⃣ TESTING SERVER QUERY:');
    const testPins = ['123456', '123', 'TRIP_123456'];
    const testPhones = ['7985113984', '+917985113984'];
    
    for (const pin of testPins) {
      for (const phone of testPhones) {
        const result = await pool.query(
          `SELECT driver_id, trip_start_time 
           FROM trips 
           WHERE mandi_buyer_pin = $1 AND driver_phone = $2 AND status = 'active'`,
          [pin, phone]
        );
        console.log(`Pin: "${pin}", Phone: "${phone}" => Found: ${result.rows.length > 0 ? 'YES' : 'NO'}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugTrips();
