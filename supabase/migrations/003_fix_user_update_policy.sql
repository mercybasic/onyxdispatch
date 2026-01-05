-- Fix user update policy to allow users to update their presence status
-- This is needed because users need to set themselves offline during logout

-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create a more permissive policy that allows users to update their own records
-- by discord_id, and also allows upsert operations
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text
  );

-- Allow users to insert their own records (needed for initial Discord OAuth sync)
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text
  );

-- Note: This policy allows authenticated users to upsert their own records
-- The USING clause checks for SELECT/UPDATE permissions
-- The WITH CHECK clause validates INSERT operations
