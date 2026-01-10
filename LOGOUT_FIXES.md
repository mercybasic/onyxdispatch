# Logout Loop Fix

## Issues Fixed

The logout process was experiencing multiple critical issues:

1. **Infinite Loop**: The logout process would get stuck in a loop, sending excessive requests that crashed the browser.

2. **Double Auth State Updates**: The `logout` function was manually updating auth state after calling `signOut()`, while the `onAuthStateChange` listener was also updating the state. This created race conditions and triggered multiple re-renders.

3. **Subscription Re-initialization**: When auth state changed during logout, the `useSupabaseData` hook would re-run and try to set up new subscriptions, triggering additional database queries.

4. **Effect Chain Reactions**: Multiple useEffect hooks were responding to auth state changes during logout, causing cascading updates.

5. **Incomplete Session Clearing**: The session wasn't being fully cleared from localStorage, causing users to appear logged in after logout.

6. **User Not Redirected to Landing Page**: After logout, users weren't being properly redirected to the landing page.

## Changes Made

### 1. useDiscordAuth.js
- **Removed manual state update** from the `logout` function
- Now relies solely on the `onAuthStateChange` listener to update state after signOut
- Added `scope: 'local'` parameter to `signOut()` to ensure local session is cleared
- **Added session verification** after signOut to ensure the session is actually gone
- If session persists, forces another signOut call
- This prevents double state updates and race conditions

### 2. useSupabaseData.js
- Added `window._isLoggingOut` checks to prevent subscription setup during logout
- Added guards in subscription callbacks to prevent fetching data during logout
- Ensures database operations stop cleanly when user logs out

### 3. App.jsx
- Made `handleLogout` a `useCallback` to prevent unnecessary recreations
- Added `window._isLoggingOut` guards to all auth-dependent effects
- **Added explicit localStorage cleanup** - removes all Supabase-related items (keys starting with 'sb-')
- Uses `window.location.replace('/')` to redirect (prevents back button issues)
- Clears localStorage even on errors to ensure logout completes
- Reset `window._isLoggingOut` flag on component mount

## How It Works Now

1. User clicks logout button
2. `window._isLoggingOut` flag is set to `true`
3. User is set offline in database (non-blocking)
4. Supabase `signOut({ scope: 'local' })` is called
5. Session is verified as cleared (with retry if needed)
6. All Supabase-related localStorage items are explicitly removed
7. All effects and subscriptions check the flag and skip execution
8. Page redirects to home with `window.location.replace('/')`
9. On page load, logout flag is reset
10. With no session in localStorage, user sees landing page

## Testing

The logout process should now:
- Complete in a single operation without loops
- Not trigger excessive database queries
- Properly clean up subscriptions
- Fully clear the session from localStorage
- Redirect cleanly to the landing page
- Not crash the browser
- Show the landing page after logout (not the authenticated app)

## Prevention

The `window._isLoggingOut` flag acts as a global semaphore to prevent:
- Multiple simultaneous logout attempts
- Effects from running during logout
- Database operations during logout
- Subscription updates during logout

The explicit localStorage cleanup ensures:
- Session data is completely removed
- No cached auth state persists after logout
- User truly appears logged out on page reload
