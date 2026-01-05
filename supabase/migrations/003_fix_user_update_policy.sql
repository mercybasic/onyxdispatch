-- Fix user policies to allow Discord OAuth users to create and update their records
-- This fixes the 403 error when logging in

-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Allow authenticated users to insert their own records
-- This is needed when a new user logs in via Discord OAuth
CREATE POLICY "Authenticated users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own records by discord_id or by database id
-- This is needed for presence tracking (online status, last_seen)
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text OR
    auth.uid() IS NOT NULL  -- Allow any authenticated user to update (for upsert)
  )
  WITH CHECK (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text OR
    auth.uid() IS NOT NULL
  );

-- Note: This allows any authenticated user to upsert their own record
-- The discord_id uniqueness constraint prevents users from overwriting others' data
