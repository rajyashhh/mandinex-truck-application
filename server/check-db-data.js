const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SQD4T7tKXWwY@ep-flat-cake-a1sumi3b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabaseData() {
  try {
    console.log('=== CHECKING DATABASE DATA ===\n');

    // 1. Check Active Trips
    console.log('📍 ACTIVE TRIPS:');
    const activeTrips = await pool.query(`
      SELECT 
        id,
        driver_id,
        driver_phone,
        mandi_buyer_pin as pin,
        trip_start_time,
        status,
        EXTRACT(EPOCH FROM (NOW() - trip_start_time))/3600 as hours_elapsed
      FROM trips 
      WHERE status = 'active'
      ORDER BY trip_start_time DESC
      LIMIT 10
    `);
    
    if (activeTrips.rows.length > 0) {
      console.table(activeTrips.rows.map(row => ({
        ...row,
        hours_elapsed: parseFloat(row.hours_elapsed).toFixed(2) + ' hrs'
      })));
    } else {
      console.log('No active trips found\n');
    }

    // 2. Check Current Locations
    console.log('\n🚚 CURRENT LOCATIONS (Real-time tracking):');
    const currentLocations = await pool.query(`
      SELECT 
        cl.driver_id,
        cl.driver_phone,
        cl.latitude,
        cl.longitude,
        cl.speed,
        cl.trip_active,
        cl.trip_id as pin_used,
        cl.last_updated,
        EXTRACT(EPOCH FROM (NOW() - cl.last_updated)) as seconds_since_update
      FROM current_locations cl
      ORDER BY cl.last_updated DESC
      LIMIT 10
    `);
    
    if (currentLocations.rows.length > 0) {
      console.table(currentLocations.rows.map(row => ({
        ...row,
        latitude: parseFloat(row.latitude).toFixed(6),
        longitude: parseFloat(row.longitude).toFixed(6),
        seconds_ago: Math.round(row.seconds_since_update) + 's ago'
      })));
    } else {
      console.log('No current locations found\n');
    }

    // 3. Check Location Snapshots
    console.log('\n📸 LOCATION SNAPSHOTS (6/12/24 hour checkpoints):');
    const snapshots = await pool.query(`
      SELECT 
        id,
        driver_phone,
        trip_id,
        snapshot_type,
        latitude,
        longitude,
        battery_level,
        network_type,
        captured_at,
        is_offline_capture
      FROM location_snapshots 
      ORDER BY captured_at DESC
      LIMIT 20
    `);
    
    if (snapshots.rows.length > 0) {
      console.table(snapshots.rows.map(row => ({
        ...row,
        latitude: parseFloat(row.latitude).toFixed(6),
        longitude: parseFloat(row.longitude).toFixed(6),
        battery: row.battery_level ? row.battery_level + '%' : 'N/A'
      })));
    } else {
      console.log('No location snapshots found yet\n');
    }

    // 4. Summary Stats
    console.log('\n📊 SUMMARY STATISTICS:');
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM trips WHERE status = 'active') as active_trips,
        (SELECT COUNT(*) FROM current_locations WHERE trip_active = true) as drivers_tracking,
        (SELECT COUNT(*) FROM location_snapshots) as total_snapshots,
        (SELECT COUNT(DISTINCT trip_id) FROM location_snapshots) as trips_with_snapshots
    `);
    
    console.table(stats.rows);

    // 5. Check for trips that should have snapshots
    console.log('\n⏰ TRIPS DUE FOR SNAPSHOTS:');
    const tripsForSnapshots = await pool.query(`
      SELECT 
        t.id,
        t.driver_phone,
        t.mandi_buyer_pin,
        t.trip_start_time,
        EXTRACT(EPOCH FROM (NOW() - t.trip_start_time))/3600 as hours_elapsed,
        CASE 
          WHEN EXTRACT(EPOCH FROM (NOW() - t.trip_start_time))/3600 >= 24 THEN 'Due for 24hr snapshot'
          WHEN EXTRACT(EPOCH FROM (NOW() - t.trip_start_time))/3600 >= 12 THEN 'Due for 12hr snapshot'
          WHEN EXTRACT(EPOCH FROM (NOW() - t.trip_start_time))/3600 >= 6 THEN 'Due for 6hr snapshot'
          ELSE 'No snapshot due yet'
        END as snapshot_status
      FROM trips t
      WHERE t.status = 'active'
      ORDER BY t.trip_start_time
    `);
    
    if (tripsForSnapshots.rows.length > 0) {
      console.table(tripsForSnapshots.rows.map(row => ({
        ...row,
        hours_elapsed: parseFloat(row.hours_elapsed).toFixed(2) + ' hrs'
      })));
    }

  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

// Add command line option to continuously monitor
if (process.argv.includes('--watch')) {
  console.log('🔄 Monitoring database (updates every 10 seconds)...\n');
  setInterval(async () => {
    console.clear();
    await checkDatabaseData();
  }, 10000);
  checkDatabaseData();
} else {
  checkDatabaseData();
}
