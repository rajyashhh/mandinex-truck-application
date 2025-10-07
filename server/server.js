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

    let driverId;
    
    if (driverResult.rows.length === 0) {
      // TEMPORARY BYPASS: Create driver on-the-fly for testing
      console.log('Driver not found, creating temporary driver for testing...');
      
      try {
        const tempDriverResult = await pool.query(
          `INSERT INTO drivers (driver_phone, driver_name, driver_pin, license_number)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [normalizedPhone, 'Test Driver', '000000', 'TEST-LICENSE']
        );
        driverId = tempDriverResult.rows[0].id;
        console.log('Temporary driver created with ID:', driverId);
      } catch (error) {
        console.error('Error creating temporary driver:', error);
        return res.status(404).json({ error: 'Driver not found' });
      }
    } else {
      driverId = driverResult.rows[0].id;
    }
    
    // Validate PIN against trips table from AgriBuild
    // Now also checking for 'active' status to allow re-joining
    const pinValidation = await pool.query(
      `SELECT t.id, t.vehicle_id, t.mandi_buyer_pin, t.status,
              v.vehicle_number, v.driver_id as assigned_driver_id,
              t.driver_phone as current_driver_phone
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       WHERE t.mandi_buyer_pin = $1 
       AND t.status IN ('scheduled', 'pending', 'active')
       LIMIT 1`,
      [ridePin]
    );
    
    if (pinValidation.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid PIN. Please check with the farmer for correct PIN.' });
    }
    
    const validTrip = pinValidation.rows[0];
    
    // Check if this is an active trip being re-joined
    if (validTrip.status === 'active') {
      // Check if it's the same driver re-joining
      if (validTrip.current_driver_phone && 
          validTrip.current_driver_phone !== normalizedPhone && 
          validTrip.current_driver_phone !== driverPhone) {
        return res.status(403).json({ 
          error: 'This trip is already active with another driver. Please contact support if this is an error.' 
        });
      }
      
      console.log(`Driver ${normalizedPhone} is re-joining active trip ${validTrip.id}`);
      
      // For active trips, just update the location and continue
      // No need to update trip status or start time
    } else {
      // For new trips (scheduled/pending), update status to active
      const updateResult = await pool.query(
        `UPDATE trips 
         SET status = 'active',
             driver_id = $1,
             driver_phone = $2,
             trip_start_time = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id`,
        [driverId, normalizedPhone, validTrip.id]
      );
    }
    
    // Optional: Check if driver is assigned to this vehicle
    // BYPASS: Skip this check for test drivers
    if (validTrip.assigned_driver_id && validTrip.assigned_driver_id !== driverId && !normalizedPhone.includes('Test')) {
      console.log('Note: Driver not assigned to vehicle, but allowing for testing');
      // return res.status(403).json({ error: 'You are not authorized for this vehicle.' });
    }

    // Initialize current location (trip_id in current_locations stores the pin, not the trip table id)
    // First, mark any previous trips as inactive for this driver
    await pool.query(
      `UPDATE current_locations 
       SET trip_active = false 
       WHERE driver_id = $1`,
      [driverId]
    );
    
    // Now insert new location for this trip
    await pool.query(
      `INSERT INTO current_locations (driver_id, driver_phone, latitude, longitude, trip_id, trip_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (trip_id) 
       DO UPDATE SET 
         driver_id = EXCLUDED.driver_id,
         driver_phone = EXCLUDED.driver_phone,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         trip_active = true,
         last_updated = CURRENT_TIMESTAMP`,
      [driverId, normalizedPhone, latitude, longitude, ridePin]  // Store ridePin as trip_id with normalized phone
    );

    res.json({ 
      success: true, 
      tripId,
      message: validTrip.status === 'active' ? 'Trip resumed successfully' : 'Trip started successfully',
      isResumed: validTrip.status === 'active'
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
    // Note: tripId here is actually the PIN
    const tripResult = await pool.query(
      `SELECT driver_id, trip_start_time 
       FROM trips 
       WHERE mandi_buyer_pin = $1 
       AND status = 'active'`,
      [tripId]  // Just check PIN and active status
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or not active' });
    }

    const { driver_id: driverId, trip_start_time: startTime } = tripResult.rows[0];

    // Check if driver_id is NULL (can happen in MVP when driver not registered)
    if (!driverId) {
      console.log('Warning: driver_id is NULL for trip', tripId);
      // For MVP, we'll create a temporary driver_id based on the PIN
      // This ensures location updates work even without driver registration
      const tempDriverId = parseInt(tripId) || 999999; // Use PIN as driver_id or fallback
      
      // First, try to update trips table with this temporary driver_id
      await pool.query(
        `UPDATE trips SET driver_id = $1 WHERE mandi_buyer_pin = $2 AND driver_id IS NULL`,
        [tempDriverId, tripId]
      );
      
      // Use the temporary driver_id for location tracking
      const updateResult = await pool.query(
        `INSERT INTO current_locations (driver_id, driver_phone, trip_id, latitude, longitude, speed, heading, altitude, accuracy, trip_active, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP)
         ON CONFLICT (trip_id) 
         DO UPDATE SET 
           driver_id = EXCLUDED.driver_id,
           driver_phone = EXCLUDED.driver_phone,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           speed = EXCLUDED.speed,
           heading = EXCLUDED.heading,
           altitude = EXCLUDED.altitude,
           accuracy = EXCLUDED.accuracy,
           trip_active = true,
           last_updated = CURRENT_TIMESTAMP
         RETURNING *`,
        [tempDriverId, normalizedPhone || tripId, tripId, latitude, longitude, speed, heading, altitude, accuracy]
      );
      
      console.log(`Location updated for trip ${tripId} with temp driver_id ${tempDriverId}:`, updateResult.rows[0] ? 'Success' : 'Failed');
      
    } else {
      // Normal case when driver_id exists
      const updateResult = await pool.query(
        `INSERT INTO current_locations (driver_id, driver_phone, trip_id, latitude, longitude, speed, heading, altitude, accuracy, trip_active, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP)
         ON CONFLICT (trip_id) 
         DO UPDATE SET 
           driver_id = EXCLUDED.driver_id,
           driver_phone = EXCLUDED.driver_phone,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           speed = EXCLUDED.speed,
           heading = EXCLUDED.heading,
           altitude = EXCLUDED.altitude,
           accuracy = EXCLUDED.accuracy,
           trip_active = true,
           last_updated = CURRENT_TIMESTAMP
         RETURNING *`,
        [driverId, normalizedPhone, tripId, latitude, longitude, speed, heading, altitude, accuracy]
      );
      
      console.log(`Location updated for trip ${tripId}:`, updateResult.rows[0] ? 'Success' : 'Failed');
    }

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
