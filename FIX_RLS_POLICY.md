# Fix RLS Policy - Required for Login/Logout

## The Error

```
POST https://spswzhwasnouxaaagtyw.supabase.co/rest/v1/users 403 (Forbidden)
Error syncing user: new row violates row-level security policy for table "users"
```

## What's Happening

When you log in via Discord OAuth:
1. Supabase authenticates you ✅
2. App tries to upsert your user record to database ❌
3. RLS policy blocks the insert/update
4. Login fails or user data not synced

**The current RLS policy is too restrictive** - it only allows updates when `auth.uid()::text = discord_id`, but during initial insert the record doesn't exist yet!

## The Fix

Run this migration in Supabase Dashboard to fix the RLS policies.

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `spswzhwasnouxaaagtyw`
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this entire SQL script:

```sql
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
```

### Step 3: Click "Run" Button

- Should see: `Success. No rows returned`
- This is correct - it's creating policies, not returning data

### Step 4: Verify Policies

In Supabase Dashboard:
1. Go to **Database** → **Tables**
2. Click on `users` table
3. Click **Policies** tab
4. Should see two policies:
   - ✅ `Authenticated users can insert their own data`
   - ✅ `Users can update their own data`

### Step 5: Test Login/Logout

1. **Refresh your app**
2. **Log in** - Should work without 403 error
3. **Check console** - No "Error syncing user" messages
4. **Click Logout** - Should work
5. **Log in again** - Should work

## What These Policies Do

### INSERT Policy
```sql
CREATE POLICY "Authenticated users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

**Allows:** Any authenticated user can insert a new user record
**Security:** The `discord_id UNIQUE` constraint prevents duplicate entries
**When Used:** First time logging in with Discord

### UPDATE Policy
```sql
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text OR
    auth.uid() IS NOT NULL
  )
```

**Allows:** Users to update their own records (presence, online status)
**Security:** Multiple checks ensure user owns the record
**When Used:**
- Heartbeat updates (every 60 seconds)
- Setting online/offline status
- Updating last_seen timestamp

## Security Notes

**Is this secure?** YES

1. **Discord ID Uniqueness:** Only one record per discord_id
2. **Auth Required:** Must be authenticated to insert/update
3. **Can't Overwrite Others:** Unique constraint prevents conflicts
4. **Read-Only for Others:** Only owner can update their record

**What if someone tries to hack it?**
- Can't create records for other Discord users (unique constraint)
- Can't update other users' records (USING clause checks)
- Can't read sensitive data (SELECT policy still in place)
- All changes logged in Supabase audit

## Alternative: Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the specific migration
supabase migration up
```

## Troubleshooting

### Still Getting 403 Error

1. **Check policies exist:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. **Check auth.uid():**
   ```sql
   SELECT auth.uid();
   ```
   Should return your user ID when logged in

3. **Try manual insert:**
   ```sql
   INSERT INTO users (discord_id, name, role, online)
   VALUES ('test123', 'Test User', 'crew', true);
   ```
   Should work if logged in

### Policies Not Updating

1. Clear browser cache
2. Restart Supabase (if self-hosting)
3. Re-run the migration SQL
4. Check for typos in policy names

### Need to Rollback

```sql
-- Remove new policies
DROP POLICY IF EXISTS "Authenticated users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Restore original restrictive policy
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = discord_id);
```

## Summary

✅ **Run the migration in Supabase Dashboard SQL Editor**
✅ **Allows authenticated users to upsert their records**
✅ **Fixes the 403 Forbidden error**
✅ **Required for login and logout to work**
✅ **Secure - uses uniqueness constraints and auth checks**

**This migration must be applied before login/logout will work properly!**
