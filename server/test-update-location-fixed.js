// Test script to verify location update fix
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testLocationUpdate() {
  const testPin = '213013'; // From your screenshot
  const testPhone = '213013'; // Using PIN as phone for MVP
  
  try {
    // First, check current_locations table structure
    console.log('Checking table constraints...');
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'current_locations'
      ORDER BY tc.constraint_type
    `);
    console.log('Current constraints:', constraints.rows);
    
    // Check if we have a row for this PIN
    console.log('\nChecking existing location for PIN:', testPin);
    const existing = await pool.query(
      'SELECT * FROM current_locations WHERE trip_id = $1',
      [testPin]
    );
    console.log('Existing rows:', existing.rows.length);
    if (existing.rows.length > 0) {
      console.log('Current location:', existing.rows[0]);
    }
    
    // Try to update location using the fixed query
    console.log('\nTesting location update...');
    const updateData = {
      tripId: testPin,
      driverId: 999, // Temporary driver ID for testing
      driverPhone: testPhone,
      latitude: 13.003807 + Math.random() * 0.0001, // Slight variation
      longitude: 77.672909 + Math.random() * 0.0001,
      speed: Math.random() * 60,
      heading: Math.random() * 360,
      altitude: 835 + Math.random() * 10,
      accuracy: 10 + Math.random() * 5
    };
    
    const result = await pool.query(
      `INSERT INTO current_locations (trip_id, driver_id, driver_phone, latitude, longitude, speed, heading, altitude, accuracy, trip_active, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP)
       ON CONFLICT (trip_id) 
       DO UPDATE SET 
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         speed = EXCLUDED.speed,
         heading = EXCLUDED.heading,
         altitude = EXCLUDED.altitude,
         accuracy = EXCLUDED.accuracy,
         trip_active = true,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
      [updateData.tripId, updateData.driverId, updateData.driverPhone, 
       updateData.latitude, updateData.longitude, updateData.speed, 
       updateData.heading, updateData.altitude, updateData.accuracy]
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Location update successful!');
      console.log('Updated location:', result.rows[0]);
    } else {
      console.log('✗ Location update failed - no rows returned');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Detail:', error.detail);
  } finally {
    await pool.end();
  }
}

testLocationUpdate();
