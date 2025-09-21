const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkLocationUpdates() {
  try {
    // Check current location
    const result = await pool.query(`
      SELECT 
        driver_phone,
        latitude,
        longitude,
        speed,
        last_updated,
        NOW() - last_updated as time_ago
      FROM current_locations
      WHERE driver_phone = '7985113984'
    `);

    if (result.rows.length > 0) {
      const location = result.rows[0];
      console.log('\n📍 CURRENT LOCATION for driver 7985113984:');
      console.log('Latitude:', location.latitude);
      console.log('Longitude:', location.longitude);
      console.log('Speed:', location.speed, 'km/h');
      console.log('Last Updated:', location.last_updated);
      console.log('Time Ago:', location.time_ago);
      console.log('\n✅ Location is updating successfully!');
    } else {
      console.log('❌ No location found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLocationUpdates();
