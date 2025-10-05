-- Fix location tracking to use trip_id (PIN) as the unique identifier

-- 1. First, remove the existing primary key constraint on driver_id
ALTER TABLE current_locations DROP CONSTRAINT IF EXISTS current_locations_pkey CASCADE;

-- 2. Remove the unique constraint on driver_phone if it exists
ALTER TABLE current_locations DROP CONSTRAINT IF EXISTS current_locations_driver_phone_key;

-- 3. Update any NULL trip_id entries to prevent issues
UPDATE current_locations 
SET trip_active = false 
WHERE trip_id IS NULL;

-- 4. Clean up duplicate trip_id entries (keep the most recent one)
-- First, identify duplicates
WITH duplicates AS (
  SELECT trip_id, MAX(last_updated) as max_updated
  FROM current_locations
  WHERE trip_id IS NOT NULL
  GROUP BY trip_id
  HAVING COUNT(*) > 1
)
-- Delete all but the most recent entry for each duplicate trip_id
DELETE FROM current_locations 
WHERE trip_id IN (SELECT trip_id FROM duplicates)
  AND (trip_id, last_updated) NOT IN (
    SELECT trip_id, max_updated FROM duplicates
  );

-- 5. Now we can safely add a unique constraint on trip_id
ALTER TABLE current_locations ADD CONSTRAINT current_locations_trip_id_key UNIQUE (trip_id);

-- 6. Add an index on trip_id for better performance (if not created by unique constraint)
CREATE INDEX IF NOT EXISTS idx_current_locations_trip_id ON current_locations(trip_id);

-- Note: We're keeping driver_id and driver_phone columns for reference,
-- but the primary tracking will be by trip_id (PIN)
