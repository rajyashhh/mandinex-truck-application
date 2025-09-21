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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mandinex server running on port ${PORT}`);
});
