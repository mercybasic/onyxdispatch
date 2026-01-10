# Logout Loop Fix

## Issues Fixed

The logout process was experiencing an infinite loop that crashed the browser due to excessive requests. The root causes were:

1. **Double Auth State Updates**: The `logout` function was manually updating auth state after calling `signOut()`, while the `onAuthStateChange` listener was also updating the state. This created race conditions and triggered multiple re-renders.

2. **Subscription Re-initialization**: When auth state changed during logout, the `useSupabaseData` hook would re-run and try to set up new subscriptions, triggering additional database queries.

3. **Effect Chain Reactions**: Multiple useEffect hooks were responding to auth state changes during logout, causing cascading updates.

## Changes Made

### 1. useDiscordAuth.js
- **Removed manual state update** from the `logout` function
- Now relies solely on the `onAuthStateChange` listener to update state after signOut
- This prevents double state updates and race conditions

### 2. useSupabaseData.js
- Added `window._isLoggingOut` checks to prevent subscription setup during logout
- Added guards in subscription callbacks to prevent fetching data during logout
- Ensures database operations stop cleanly when user logs out

### 3. App.jsx
- Made `handleLogout` a `useCallback` to prevent unnecessary recreations
- Added `window._isLoggingOut` guards to all auth-dependent effects
- Added 100ms delay before redirect to ensure state changes are processed
- Changed from `window.location.replace` to `window.location.href` for cleaner reload
- Reset `window._isLoggingOut` flag on component mount

## How It Works Now

1. User clicks logout button
2. `window._isLoggingOut` flag is set to `true`
3. User is set offline in database (non-blocking)
4. Supabase `signOut()` is called
5. All effects and subscriptions check the flag and skip execution
6. `onAuthStateChange` listener updates auth state to logged out
7. Small delay ensures state changes are processed
8. Page redirects to home with clean reload
9. On page load, logout flag is reset

## Testing

The logout process should now:
- Complete in a single operation without loops
- Not trigger excessive database queries
- Properly clean up subscriptions
- Redirect cleanly to the landing page
- Not crash the browser

## Prevention

The `window._isLoggingOut` flag acts as a global semaphore to prevent:
- Multiple simultaneous logout attempts
- Effects from running during logout
- Database operations during logout
- Subscription updates during logout
