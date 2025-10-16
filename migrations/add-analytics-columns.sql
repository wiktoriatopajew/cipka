-- Migration script to add analytics columns if they don't exist
-- This script can be run on PostgreSQL database

-- Add missing columns to analytics_events table if they don't exist
DO $$ 
BEGIN
    -- Check and add ipAddress column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='analytics_events' AND column_name='ip_address') THEN
        ALTER TABLE analytics_events ADD COLUMN ip_address TEXT;
    END IF;

    -- Check and add country column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='analytics_events' AND column_name='country') THEN
        ALTER TABLE analytics_events ADD COLUMN country TEXT;
    END IF;

    -- Check and add city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='analytics_events' AND column_name='city') THEN
        ALTER TABLE analytics_events ADD COLUMN city TEXT;
    END IF;

    -- Check and add deviceType column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='analytics_events' AND column_name='device_type') THEN
        ALTER TABLE analytics_events ADD COLUMN device_type TEXT;
    END IF;

    -- Check and add browser column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='analytics_events' AND column_name='browser') THEN
        ALTER TABLE analytics_events ADD COLUMN browser TEXT;
    END IF;

    -- Check and add os column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='analytics_events' AND column_name='os') THEN
        ALTER TABLE analytics_events ADD COLUMN os TEXT;
    END IF;
END $$;

-- Create index on eventType and createdAt for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date 
    ON analytics_events(event_type, created_at);

-- Create index on ipAddress for unique visitor counting
CREATE INDEX IF NOT EXISTS idx_analytics_events_ip 
    ON analytics_events(ip_address);

-- Create index on country for geographic analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_country 
    ON analytics_events(country);

COMMENT ON TABLE analytics_events IS 'Stores analytics events including page views with geolocation data';
