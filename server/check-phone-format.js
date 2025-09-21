const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkPhoneFormat() {
  try {
    console.log('=== CHECKING PHONE NUMBER FORMAT ISSUES ===\n');

    // 1. Check drivers table
    console.log('1️⃣ DRIVERS TABLE PHONE NUMBERS:');
    const drivers = await pool.query(`
      SELECT id, driver_phone, driver_name 
      FROM drivers 
      WHERE driver_phone LIKE '%7985113984%' 
         OR driver_phone = '7985113984' 
         OR driver_phone = '+917985113984'
    `);
    console.table(drivers.rows);

    // 2. Check trips table
    console.log('\n2️⃣ TRIPS TABLE PHONE NUMBERS:');
    const trips = await pool.query(`
      SELECT id, driver_phone, mandi_buyer_pin, status 
      FROM trips 
      WHERE driver_phone LIKE '%7985113984%' 
         OR driver_phone = '7985113984' 
         OR driver_phone = '+917985113984'
      ORDER BY id DESC
    `);
    console.table(trips.rows);

    // 3. Check current_locations
    console.log('\n3️⃣ CURRENT_LOCATIONS TABLE:');
    const locations = await pool.query(`
      SELECT driver_id, driver_phone, trip_id, last_updated 
      FROM current_locations 
      WHERE driver_phone LIKE '%7985113984%'
    `);
    console.table(locations.rows);

    // 4. Check AsyncStorage format
    console.log('\n4️⃣ EXPECTED PHONE FORMAT FROM APP:');
    console.log('From your logs, phone is stored as: +917985113984');
    console.log('This includes the country code (+91)');

    // 5. Suggest fix
    console.log('\n5️⃣ SUGGESTED FIX:');
    console.log('The issue is likely that:');
    console.log('- App sends: +917985113984 (with country code)');
    console.log('- Database has: 7985113984 (without country code)');
    console.log('- OR vice versa');

    // 6. Check for any active trip with this phone
    console.log('\n6️⃣ CHECKING FOR ACTIVE TRIPS:');
    const activeCheck = await pool.query(`
      SELECT 
        id,
        driver_phone,
        mandi_buyer_pin as pin,
        status,
        trip_start_time
      FROM trips 
      WHERE status = 'active'
        AND (driver_phone = '7985113984' 
             OR driver_phone = '+917985113984'
             OR driver_phone LIKE '%7985113984%')
    `);
    
    if (activeCheck.rows.length > 0) {
      console.log('✅ Active trip found:');
      console.table(activeCheck.rows);
    } else {
      console.log('❌ No active trip found for this driver');
      console.log('This explains the "Trip not found" error!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPhoneFormat();
