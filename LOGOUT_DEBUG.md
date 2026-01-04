# Logout Debugging Guide

## Issues Addressed

1. **Logout button not logging user out**
2. **Welcome toast message persisting on screen**

## Changes Made

### 1. Added Debug Logging

**File: [src/hooks/useDiscordAuth.js](src/hooks/useDiscordAuth.js)**
- Added console logs to track logout flow
- Logs when logout function is called
- Logs Supabase signOut calls and results
- Logs auth state changes

**File: [src/App.jsx](src/App.jsx)**
- Added console logs to handleLogout function
- Logs currentUser information
- Logs setUserOffline calls
- Logs logout completion
- Wrapped in try/catch for error handling

### 2. Fixed Toast Re-triggering

**File: [src/components/common/Toast.jsx](src/components/common/Toast.jsx)**
- Changed useEffect dependency from `onClose` to `message`
- Prevents timer from resetting on every render
- Toast will now properly dismiss after 3 seconds
- Removed unused React import

### 3. Fixed User ID Mismatch (Previous Fix)

**Files: [src/hooks/useSupabaseData.js](src/hooks/useSupabaseData.js), [src/App.jsx](src/App.jsx)**
- Changed from `currentUser.id` to `currentUser.discordId`
- Updated updatePresence and setUserOffline to accept discord_id
- Added fallback logic for both ID types

## How to Debug

### Step 1: Open Browser DevTools

1. Open the application in Chrome/Firefox
2. Press F12 to open DevTools
3. Go to Console tab
4. Clear the console (trash icon)

### Step 2: Test Logout

1. **Click the "Logout" button** in the header
2. **Watch the console** for these logs:

**Expected Log Sequence:**
```
handleLogout called, currentUser: {id: "...", discordId: "...", name: "..."}
Setting user offline with discordId: 123456789
User set offline successfully
Calling logout...
Logout function called
Calling Supabase signOut...
Supabase signOut successful
Setting auth state to logged out
Logout completed
```

### Step 3: Identify the Issue

#### If you see NO logs at all:
**Problem:** Click handler not firing
**Possible causes:**
- React event handler not attached
- Button covered by another element
- JavaScript error preventing execution

**Check:**
1. Inspect the logout button element
2. Look for any errors in console before clicking
3. Check if button has `onClick` handler in React DevTools

#### If logs stop at "handleLogout called":
**Problem:** Error in handleLogout function
**Check:**
- Is `currentUser` defined?
- Is `currentUser.discordId` present?
- Look for error message in console

#### If logs stop at "Calling Supabase signOut":
**Problem:** Supabase signOut hanging or failing
**Check:**
- Network tab for failed requests
- Supabase connection status
- Check for error logs

#### If logs complete but UI doesn't change:
**Problem:** React state not updating UI
**Check:**
- React DevTools for state changes
- Check if isAuthenticated becomes false
- Look for re-render issues

### Step 4: Test Toast Dismissal

1. Log in successfully
2. **Watch for "Welcome back" toast**
3. **Start timer** - toast should disappear in 3 seconds
4. Check console for any errors

**Expected behavior:**
- Toast appears immediately
- Toast disappears after 3 seconds
- No re-triggering or looping

**If toast persists:**
- Check console for errors
- Verify timer is being set
- Check if onClose is being called

## Common Issues and Solutions

### Issue 1: "currentUser is undefined"

**Cause:** User state not properly set
**Solution:**
- Check Supabase session exists
- Verify Discord OAuth completed
- Check useDiscordAuth hook

### Issue 2: "discordId is undefined"

**Cause:** User metadata not synced from Discord
**Solution:**
```javascript
// Check user object structure in console:
console.log('User metadata:', currentUser);

// Should have:
{
  id: "supabase-auth-id",
  discordId: "discord-user-id",
  name: "Username",
  avatar: "url",
  role: "dispatcher"
}
```

### Issue 3: Logout completes but redirects back

**Cause:** Supabase auth state listener re-authenticating
**Solution:**
- Check for token in URL hash
- Clear localStorage if needed
- Verify Supabase session is actually cleared

### Issue 4: Toast shows multiple times

**Cause:** Component re-rendering
**Solution:**
- Already fixed with dependency change
- Verify change is deployed
- Clear browser cache

## Manual Testing Checklist

- [ ] Click logout button
- [ ] Console shows all expected logs
- [ ] No errors in console
- [ ] User redirected to landing page
- [ ] Login screen not shown
- [ ] Can log in again with different account
- [ ] Previous user shows as offline in Personnel tab
- [ ] Toast appears and dismisses after 3 seconds
- [ ] No toast looping or persistence

## Remove Debug Logs

Once logout is working correctly, remove debug console.log statements:

**In [src/hooks/useDiscordAuth.js](src/hooks/useDiscordAuth.js):**
```javascript
const logout = async () => {
  // Remove: console.log('Logout function called');
  // Remove: console.log('Calling Supabase signOut...');
  // Remove: console.log('Supabase signOut successful');
  // Remove: console.log('Setting auth state to logged out');

  if (supabase) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  setAuthState({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
  });
};
```

**In [src/App.jsx](src/App.jsx):**
```javascript
const handleLogout = async () => {
  // Remove all console.log statements

  try {
    if (currentUser?.discordId) {
      await setUserOffline(currentUser.discordId);
    }
    await logout();
    setShowLogin(false);
    setActiveTab('dashboard');
  } catch (error) {
    console.error('Error during logout:', error); // Keep error logs
  }
};
```

## Next Steps

1. Test logout with debug logs enabled
2. Share console output if issue persists
3. Check Network tab for failed requests
4. Verify Supabase configuration
5. Remove debug logs once working
