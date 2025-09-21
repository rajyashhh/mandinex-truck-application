const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  try {
    // Check trips table columns
    const tripsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trips' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== TRIPS TABLE COLUMNS ===');
    tripsColumns.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });

    // Check current_locations table columns
    const currentLocColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'current_locations' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== CURRENT_LOCATIONS TABLE COLUMNS ===');
    currentLocColumns.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });

    // Check location_snapshots table columns
    const snapshotsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'location_snapshots' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== LOCATION_SNAPSHOTS TABLE COLUMNS ===');
    snapshotsColumns.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('Error checking schema:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
