# Critical Debug Steps - Logout & Online Status

## Issue Summary

1. **Logout button not working** - User stays logged in
2. **Users not showing as online** - Personnel page shows everyone offline or empty

## Required Migrations

### ⚠️ CRITICAL: Run These Migrations First

You need to run **TWO** migrations in Supabase Dashboard:

#### Migration 1: Add last_seen Column

```sql
-- supabase/migrations/002_add_last_seen.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC);

CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET online = false
  WHERE last_seen < NOW() - INTERVAL '5 minutes'
    AND online = true;
END;
$$ LANGUAGE plpgsql;
```

#### Migration 2: Fix RLS Policies (Already Run)

```sql
-- supabase/migrations/003_fix_user_update_policy.sql
-- (You already ran this one)
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

CREATE POLICY "Authenticated users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text OR
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid()::text = discord_id OR
    auth.uid()::text = id::text OR
    auth.uid() IS NOT NULL
  );
```

## Debugging Instructions

### Step 1: Check Console on Logout Click

When you click the logout button, you should see this **exact sequence**:

```
1. Logout button clicked in Header
2. handleLogout called, currentUser: {id: "...", discordId: "...", name: "...", role: "..."}
3. Attempting to set user offline with discordId: 123456789
4. Calling logout...
5. Logout function called
6. Calling Supabase signOut...
7. Auth state change: SIGNED_OUT Session exists: false
8. User signed out, clearing auth state
9. Supabase signOut successful
10. Setting auth state to logged out
11. Logout completed successfully
```

**If you see:**
- **Nothing** → Button click not firing (JavaScript error before handler)
- **Stops at step 1** → `onLogout` prop not passed to Header
- **Stops at step 3** → Error in setUserOffline (check next message)
- **Stops at step 7** → Supabase signOut failing
- **All steps but UI doesn't change** → React state not triggering re-render

### Step 2: Check Personnel Page Console

When you open the Personnel tab, you should see:

```
PersonnelView - All users: [{id: "...", name: "...", online: true, ...}, ...]
PersonnelView - Online users: [{...}]
PersonnelView - Filtered users: [{...}]
```

**If you see:**
- **Empty array `[]`** → No users in database (run migration 002)
- **Users with `online: false`** → Heartbeat not running or migration 002 not run
- **No console output** → Personnel page not rendering

### Step 3: Verify Database State

Run these queries in Supabase Dashboard SQL Editor:

```sql
-- Check if last_seen column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_seen';
-- Should return: last_seen | timestamp with time zone

-- Check current users and their online status
SELECT discord_id, name, role, online, last_seen
FROM users
ORDER BY last_seen DESC NULLS LAST;
-- Should show your user with online=true and recent last_seen

-- Check RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
-- Should show two policies: INSERT and UPDATE
```

### Step 4: Manual Tests

#### Test 1: Can You Insert/Update Users?

```sql
-- Try manual insert (should work if policies are correct)
INSERT INTO users (discord_id, name, role, online, last_seen)
VALUES ('test_123', 'Test User', 'crew', true, NOW())
ON CONFLICT (discord_id) DO UPDATE
SET online = true, last_seen = NOW();

-- Should succeed without errors
```

#### Test 2: Check Heartbeat

Open console and watch for:
```
setUserOffline called with: 123456789
setUserOffline result: [{...}]
```

Every 60 seconds you should see the presence update.

## Common Issues and Fixes

### Issue: "Logout button clicked" but nothing happens

**Cause:** `onLogout` prop is undefined

**Fix:** Check App.jsx passes handleLogout to Header:
```javascript
<Header currentUser={currentUser} onLogout={handleLogout} />
```

### Issue: "Error syncing user" on login

**Cause:** RLS policy blocking upsert

**Fix:** Re-run migration 003 (see above)

### Issue: All users show as offline

**Cause:** `last_seen` column doesn't exist

**Fix:** Run migration 002 (see above)

### Issue: Logout logs complete but UI doesn't change

**Cause:** React state not triggering re-render or session persisting

**Fix 1:** Clear browser local storage:
```javascript
// In console:
localStorage.clear();
location.reload();
```

**Fix 2:** Clear Supabase session manually:
```javascript
// In console:
await supabase.auth.signOut({ scope: 'local' });
location.reload();
```

### Issue: Can't see yourself in Personnel

**Cause:** Not synced to database or online=false

**Fix:** Check database for your user:
```sql
SELECT * FROM users WHERE discord_id = 'YOUR_DISCORD_ID';
```

If not there, the upsert failed (check migration 003)

## Expected Behavior After Fixes

### Logout
1. Click logout button
2. Console shows complete sequence (10 steps)
3. Immediately redirected to landing page
4. No errors in console
5. Can log in again immediately

### Online Status
1. After login, user appears in Personnel tab
2. Status shows "Online" with green badge
3. Every 60 seconds, timestamp updates in database
4. Other users see you as online in real-time
5. When you logout, status changes to offline

### Role Assignment
1. First login: Default role = "crew"
2. Admin changes role in database
3. Refresh page: New role loads
4. Different tabs visible based on role

## Next Steps

1. **Run migration 002** if you haven't yet
2. **Verify migration 003** was applied correctly
3. **Clear browser cache and reload**
4. **Try logout again** and share exact console output
5. **Check Personnel tab** and share what you see in console

## Share This Information

If still not working, share:
1. Complete console output from clicking logout
2. Console output from Personnel tab
3. Result of database queries above
4. Any error messages in red

This will help identify exactly where the issue is!
