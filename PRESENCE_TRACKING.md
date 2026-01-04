# User Presence Tracking System

The Onyx Dispatch system now includes comprehensive user presence tracking to show which personnel are online in real-time.

## How It Works

### Database Schema

**New Field:** `last_seen` timestamp added to the `users` table
- Tracks the last time a user was active
- Updated every 60 seconds via heartbeat
- Used to determine online/offline status

**Existing Field:** `online` boolean
- `true` when user is actively logged in
- `false` when user logs out or becomes inactive

### Presence Updates

**On Login:**
- User's `online` status set to `true`
- `last_seen` timestamp updated to current time
- User appears in Personnel view immediately

**During Session (Heartbeat):**
- Every 60 seconds, `last_seen` timestamp is updated
- Keeps user marked as online
- Minimal database impact with efficient updates

**On Logout:**
- User's `online` status set to `false`
- `last_seen` timestamp updated
- User appears offline immediately

**On Page Close/Tab Switch:**
- `beforeunload` event sets user offline
- `visibilitychange` event marks user offline when tab hidden
- User marked online again when returning to tab

### Automatic Cleanup

**Database Function:** `update_user_online_status()`
- Marks users offline if `last_seen` > 5 minutes ago
- Should be scheduled to run periodically (using pg_cron or application scheduler)
- Handles cases where browser closes without firing beforeunload

## Implementation Details

### Frontend Components

**1. Heartbeat System ([src/App.jsx](src/App.jsx))**
```javascript
// Updates presence every 60 seconds
useEffect(() => {
  if (!isAuthenticated || !currentUser?.id) return;

  updatePresence(currentUser.id);

  const heartbeatInterval = setInterval(() => {
    updatePresence(currentUser.id);
  }, 60000);

  return () => clearInterval(heartbeatInterval);
}, [isAuthenticated, currentUser, updatePresence]);
```

**2. Page Visibility Tracking**
- Detects when user switches tabs or minimizes window
- Sets user offline when tab is hidden
- Sets user online when tab becomes visible again

**3. Logout Handler**
- Async function waits for offline status to update
- Ensures user is marked offline before session ends

### Backend Functions

**syncUser** - Initial login sync
- Creates or updates user record
- Sets `online: true`
- Updates `last_seen` timestamp

**updatePresence** - Heartbeat update
- Updates `last_seen` to current time
- Ensures `online: true`
- Called every 60 seconds

**setUserOffline** - Logout/disconnect
- Sets `online: false`
- Updates `last_seen` to current time
- Called on logout or page close

## Personnel View Display

The Personnel view ([src/components/views/PersonnelView.jsx](src/components/views/PersonnelView.jsx)) shows:

**Online Users:**
- Green status badge
- Green dot indicator
- Avatar has online class styling

**Offline Users:**
- Gray status badge
- No online indicator
- Avatar shows without online class

**Filter Options:**
- All Personnel
- Online only
- Offline only
- By role (dispatcher/pilot/crew)

## Migration Required

**Before deploying, run the migration:**

```bash
# Using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase Dashboard
# SQL Editor > New Query > Paste contents of:
# supabase/migrations/002_add_last_seen.sql
```

**Migration adds:**
- `last_seen` column to users table
- Index on `last_seen` for performance
- `update_user_online_status()` function for cleanup

## Optional: Scheduled Cleanup

To automatically mark inactive users offline, schedule the cleanup function:

**Option 1: Using pg_cron (Supabase Pro)**
```sql
SELECT cron.schedule(
  'cleanup-offline-users',
  '*/5 * * * *', -- Every 5 minutes
  'SELECT update_user_online_status()'
);
```

**Option 2: Application-level (Current)**
- Heartbeat system handles most cases
- Page visibility handles tab switches
- beforeunload handles browser close
- 5-minute timeout is safety net

**Option 3: Supabase Edge Function**
```typescript
// Can be triggered on a schedule
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(...)

  await supabase.rpc('update_user_online_status')

  return new Response('OK')
})
```

## Testing

### Test Online Status

1. **Open two browser windows:**
   - Window A: Log in as dispatcher
   - Window B: Log in as crew member

2. **Check Personnel tab in Window A:**
   - Both users should show as "Online"
   - Green status badges visible

3. **Close Window B:**
   - User should show "Offline" in Window A within 1-2 seconds

4. **Switch Window A to another tab:**
   - Come back after 1 minute
   - User should still be online (heartbeat working)

### Test Heartbeat

1. Log in and open browser DevTools
2. Go to Network tab
3. Every 60 seconds, you should see:
   - PATCH request to `/rest/v1/users`
   - Updates `online` and `last_seen` fields

### Test Logout

1. Log in and verify online status
2. Click logout
3. Log in with different account
4. Check Personnel tab
5. Previous user should show as offline

## Browser Support

**Full Support:**
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)

**Features:**
- ✅ Heartbeat updates (all browsers)
- ✅ Page visibility detection (all modern browsers)
- ⚠️ beforeunload can be unreliable on mobile (heartbeat timeout handles this)

## Performance Considerations

**Database Impact:**
- One update per user every 60 seconds
- Indexed queries on `last_seen` field
- Minimal overhead even with many users

**Network Usage:**
- ~100 bytes per heartbeat update
- 1 request per minute per user
- Negligible bandwidth usage

**Real-time Updates:**
- Supabase subscriptions handle status changes
- Personnel view updates automatically
- No polling required

## Troubleshooting

### Users Not Showing Online

1. **Check migration was run:**
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'users' AND column_name = 'last_seen';
   ```

2. **Verify heartbeat is running:**
   - Open browser DevTools > Network
   - Should see periodic PATCH requests to users table

3. **Check user record:**
   ```sql
   SELECT name, online, last_seen
   FROM users
   WHERE discord_id = 'YOUR_DISCORD_ID';
   ```

### Users Stuck Online

1. **Run cleanup function manually:**
   ```sql
   SELECT update_user_online_status();
   ```

2. **Check last_seen values:**
   ```sql
   SELECT name, online, last_seen,
          NOW() - last_seen as inactive_duration
   FROM users
   WHERE online = true;
   ```

3. **Force offline if needed:**
   ```sql
   UPDATE users
   SET online = false
   WHERE last_seen < NOW() - INTERVAL '5 minutes';
   ```

## Future Enhancements

Potential improvements:
- User activity indicators (typing, viewing, etc.)
- "Away" status after period of inactivity
- Custom status messages
- Last seen timestamp display ("5 minutes ago")
- Presence in specific views/channels
- Mobile app push notifications on status changes
