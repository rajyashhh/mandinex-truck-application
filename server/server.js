const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    // Insert phone number into drivers table
    const result = await pool.query(
      `INSERT INTO drivers (driver_phone, driver_name, driver_pin)
       VALUES ($1, $2, $3)
       ON CONFLICT (driver_phone) 
       DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [phone, 'Driver', '000000']
    );

    res.json({ 
      success: true, 
      driverId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update driver endpoint
app.post('/api/update-driver', async (req, res) => {
  const { phone, driverName, licenseNumber } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    // Update driver information
    const result = await pool.query(
      `UPDATE drivers 
       SET driver_name = COALESCE($2, driver_name),
           license_number = COALESCE($3, license_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE driver_phone = $1
       RETURNING id, driver_name, license_number`,
      [phone, driverName, licenseNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ 
      success: true, 
      driver: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start trip endpoint
app.post('/api/start-trip', async (req, res) => {
  const { driverPhone, ridePin, latitude, longitude } = req.body;

  if (!driverPhone || !ridePin) {
    return res.status(400).json({ error: 'Driver phone and ride pin are required' });
  }

  try {
    // Normalize phone number - remove country code if present
    const normalizedPhone = driverPhone.replace(/^\+91/, '');
    
    // Generate unique trip ID
    const tripId = `TRIP_${Date.now()}_${normalizedPhone}`;

    // Get driver ID - try both formats
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE driver_phone = $1 OR driver_phone = $2',
      [normalizedPhone, driverPhone]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const driverId = driverResult.rows[0].id;

    // Create new trip (using existing trips table structure)
    const tripResult = await pool.query(
      `INSERT INTO trips (driver_id, driver_phone, mandi_buyer_pin, trip_start_time, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'active')
       RETURNING id`,
      [driverId, normalizedPhone, ridePin]  // Use normalized phone
    );
    
    const actualTripId = tripResult.rows[0].id;

    // Initialize current location (trip_id in current_locations stores the pin, not the trip table id)
    await pool.query(
      `INSERT INTO current_locations (driver_id, driver_phone, latitude, longitude, trip_id, trip_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (driver_id) 
       DO UPDATE SET 
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         trip_id = EXCLUDED.trip_id,
         trip_active = true,
         last_updated = CURRENT_TIMESTAMP`,
      [driverId, normalizedPhone, latitude, longitude, ridePin]  // Store ridePin as trip_id with normalized phone
    );

    res.json({ 
      success: true, 
      tripId,
      message: 'Trip started successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update location endpoint (called frequently from app)
app.post('/api/update-location', async (req, res) => {
  const { 
    tripId, 
    driverPhone, 
    latitude, 
    longitude, 
    speed, 
    heading, 
    altitude,
    accuracy,
    batteryLevel,
    networkType 
  } = req.body;

  if (!tripId || !driverPhone || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Normalize phone number
    const normalizedPhone = driverPhone.replace(/^\+91/, '');
    
    // Get driver ID and trip info - try both phone formats
    const tripResult = await pool.query(
      `SELECT driver_id, trip_start_time 
       FROM trips 
       WHERE mandi_buyer_pin = $1 
       AND (driver_phone = $2 OR driver_phone = $3)
       AND status = 'active'`,
      [tripId, normalizedPhone, driverPhone]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { driver_id: driverId, trip_start_time: startTime } = tripResult.rows[0];

    // Update current location
    await pool.query(
      `UPDATE current_locations 
       SET latitude = $1, longitude = $2, speed = $3, heading = $4, 
           altitude = $5, accuracy = $6, last_updated = CURRENT_TIMESTAMP
       WHERE driver_id = $7`,
      [latitude, longitude, speed, heading, altitude, accuracy, driverId]
    );

    // Check if we need to save a snapshot (6, 12, or 24 hours)
    const hoursSinceStart = (Date.now() - new Date(startTime).getTime()) / (1000 * 60 * 60);
    
    // Check if we already have snapshots for this trip
    const snapshotCheck = await pool.query(
      'SELECT snapshot_type FROM location_snapshots WHERE trip_id = $1',
      [tripId]
    );
    const existingSnapshots = snapshotCheck.rows.map(row => row.snapshot_type);

    let snapshotType = null;
    if (hoursSinceStart >= 24 && !existingSnapshots.includes('24_hour')) {
      snapshotType = '24_hour';
    } else if (hoursSinceStart >= 12 && !existingSnapshots.includes('12_hour')) {
      snapshotType = '12_hour';
    } else if (hoursSinceStart >= 6 && !existingSnapshots.includes('6_hour')) {
      snapshotType = '6_hour';
    }

    if (snapshotType) {
      await pool.query(
        `INSERT INTO location_snapshots 
         (driver_id, driver_phone, trip_id, latitude, longitude, snapshot_type, 
          trip_start_time, location_accuracy, battery_level, network_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [driverId, driverPhone, tripId, latitude, longitude, snapshotType, 
         startTime, accuracy, batteryLevel, networkType]
      );
      console.log(`Saved ${snapshotType} snapshot for trip ${tripId}`);
    }

    res.json({ 
      success: true,
      snapshotSaved: snapshotType ? true : false,
      snapshotType
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save last location (when phone is being switched off)
app.post('/api/save-last-location', async (req, res) => {
  const { 
    tripId, 
    driverPhone, 
    latitude, 
    longitude,
    batteryLevel 
  } = req.body;

  if (!tripId || !driverPhone || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get driver ID
    const driverResult = await pool.query(
      'SELECT id FROM drivers WHERE driver_phone = $1',
      [driverPhone]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const driverId = driverResult.rows[0].id;

    // Save last location snapshot
    await pool.query(
      `INSERT INTO location_snapshots 
       (driver_id, driver_phone, trip_id, latitude, longitude, snapshot_type, 
        is_offline_capture, battery_level)
       VALUES ($1, $2, $3, $4, $5, 'last_location', true, $6)`,
      [driverId, driverPhone, tripId, latitude, longitude, batteryLevel]
    );

    // Update trip status to indicate potential interruption
    await pool.query(
      `UPDATE current_locations 
       SET trip_active = false 
       WHERE driver_id = $1`,
      [driverId]
    );

    res.json({ 
      success: true,
      message: 'Last location saved successfully'
    });
  } catch (error) {
    console.error('Save last location error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver's current location (for AgriBuild integration later)
app.get('/api/driver-location/:phone', async (req, res) => {
  const { phone } = req.params;

  try {
    const result = await pool.query(
      `SELECT cl.*, t.id as trip_id, t.mandi_buyer_pin as ride_pin, t.trip_start_time as start_time
       FROM current_locations cl
       LEFT JOIN trips t ON cl.driver_id = t.driver_id AND t.status = 'active'
       WHERE cl.driver_phone = $1 AND cl.trip_active = true`,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active trip found for this driver' });
    }

    res.json({
      success: true,
      location: result.rows[0]
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get trip snapshots (for AgriBuild to show journey progress)
app.get('/api/trip-snapshots/:tripId', async (req, res) => {
  const { tripId } = req.params;

  try {
    const snapshots = await pool.query(
      `SELECT * FROM location_snapshots 
       WHERE trip_id = $1 
       ORDER BY captured_at ASC`,
      [tripId]
    );

    res.json({
      success: true,
      snapshots: snapshots.rows
    });
  } catch (error) {
    console.error('Get snapshots error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mandinex server running on port ${PORT}`);
});
