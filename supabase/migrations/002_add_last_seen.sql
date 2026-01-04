-- Add last_seen column to users table for presence tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries on last_seen
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC);

-- Function to automatically mark users offline if they haven't been seen in 5 minutes
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET online = false
  WHERE last_seen < NOW() - INTERVAL '5 minutes'
    AND online = true;
END;
$$ LANGUAGE plpgsql;

-- Note: In production, you would schedule this function to run periodically
-- using pg_cron or call it from your application
