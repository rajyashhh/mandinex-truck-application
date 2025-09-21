-- Create location_snapshots table for storing periodic location data
CREATE TABLE IF NOT EXISTS location_snapshots (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    trip_id VARCHAR(50), -- Can be ride PIN or unique trip identifier
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    snapshot_type VARCHAR(20) NOT NULL, -- '6_hour', '12_hour', '24_hour', 'last_location'
    trip_start_time TIMESTAMP,
    captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_offline_capture BOOLEAN DEFAULT FALSE, -- true if captured due to phone switch-off
    location_accuracy FLOAT, -- GPS accuracy in meters
    battery_level INTEGER, -- Battery percentage at time of capture
    network_type VARCHAR(20), -- 'wifi', '4g', '3g', 'offline'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for location_snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_driver_phone ON location_snapshots(driver_phone);
CREATE INDEX IF NOT EXISTS idx_snapshots_trip_id ON location_snapshots(trip_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_snapshot_type ON location_snapshots(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_captured_at ON location_snapshots(captured_at);

-- Create real-time location table (for current/latest location only)
CREATE TABLE IF NOT EXISTS current_locations (
    driver_id INTEGER PRIMARY KEY,
    driver_phone VARCHAR(20) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed FLOAT, -- Speed in km/h
    heading INTEGER, -- Direction in degrees
    altitude FLOAT, -- Altitude in meters
    accuracy FLOAT, -- GPS accuracy
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_active BOOLEAN DEFAULT TRUE,
    trip_id VARCHAR(50)
);

-- Create indexes for current_locations
CREATE INDEX IF NOT EXISTS idx_current_locations_phone ON current_locations(driver_phone);
CREATE INDEX IF NOT EXISTS idx_current_locations_last_updated ON current_locations(last_updated);

-- Create trip tracking table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(50) UNIQUE NOT NULL,
    driver_id INTEGER NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    ride_pin VARCHAR(10),
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    start_latitude DECIMAL(10, 8),
    start_longitude DECIMAL(11, 8),
    end_latitude DECIMAL(10, 8),
    end_longitude DECIMAL(11, 8),
    total_distance FLOAT -- in kilometers
);

-- Create indexes for trips
CREATE INDEX IF NOT EXISTS idx_trips_trip_id ON trips(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_phone ON trips(driver_phone);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
