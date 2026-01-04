# Progressive Web App (PWA) Setup

Onyx Dispatch is now configured as a Progressive Web App with push notification support.

## Features

### ✅ PWA Capabilities

- **Installable**: Users can install the app on their devices (desktop and mobile)
- **Offline Support**: Service worker caches critical assets for offline access
- **Fast Loading**: Cached resources load instantly on repeat visits
- **App-like Experience**: Runs in standalone mode without browser UI

### ✅ Push Notifications

- **New Request Alerts**: Dispatchers receive notifications when new service requests arrive
- **Priority Alerts**: Critical requests trigger non-dismissible notifications
- **Real-time Updates**: Notifications sent immediately via Supabase real-time subscriptions
- **Smart Permissions**: Permission requested 2 seconds after dispatcher login

## How It Works

### Service Worker Registration

The service worker is automatically registered in `src/hooks/useNotifications.js`:
- Registers at `/service-worker.js`
- Handles caching strategy
- Manages push notifications
- Updates automatically when new version is deployed

### Notification System

**For Dispatchers:**
1. Log in to the application
2. After 2 seconds, you'll be prompted to allow notifications
3. When a new request is submitted, you'll receive:
   - Browser/system notification with request details
   - Toast message in the app
   - Real-time update in the requests list

**Notification Details:**
- Shows request type, location, and priority
- Critical priority requests require user interaction to dismiss
- Each notification is tagged to prevent duplicates
- Clicking notification brings you back to the app

### Installation

**Desktop (Chrome/Edge):**
1. Visit the deployed site
2. Look for install icon in address bar
3. Click "Install Onyx Dispatch"
4. App opens in standalone window

**Mobile (iOS Safari):**
1. Visit the site in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon appears on home screen

**Mobile (Android Chrome):**
1. Visit the site in Chrome
2. Tap menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. App icon appears on home screen

## Files

### Core PWA Files
- `/public/manifest.json` - App manifest with metadata
- `/public/service-worker.js` - Service worker for caching and notifications
- `/public/icons/icon.svg` - App icon (rescue service themed)
- `/index.html` - PWA meta tags and manifest link

### React Integration
- `/src/hooks/useNotifications.js` - React hook for notification management
- `/src/App.jsx` - Notification triggers and permission handling

## Configuration

### Manifest Settings

```json
{
  "name": "Onyx Dispatch - Emergency Services Network",
  "short_name": "Onyx Dispatch",
  "theme_color": "#3b82f6",
  "background_color": "#0a0e17",
  "display": "standalone"
}
```

### Notification Permission

Notifications are requested automatically for dispatchers:
- Triggered 2 seconds after successful login
- Only requested once per browser
- Can be managed in browser settings

## Testing PWA Features

### Local Testing

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Serve the build:**
   ```bash
   npx serve dist
   ```

3. **Test in Chrome:**
   - Open Chrome DevTools
   - Go to Application tab
   - Check "Manifest" section
   - Check "Service Workers" section
   - Test "Add to home screen" prompt

### Testing Notifications

1. Log in as a dispatcher
2. Grant notification permission when prompted
3. Open a second browser window (or use Supabase dashboard)
4. Create a new service request
5. Verify notification appears in first window

### Lighthouse Audit

Run a PWA audit:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Click "Generate report"
5. Should score 90+ for PWA compliance

## Browser Support

- ✅ Chrome/Edge (Desktop & Android) - Full support
- ✅ Safari (iOS & macOS) - PWA support, limited notifications
- ✅ Firefox (Desktop) - PWA support
- ⚠️ Safari iOS - No push notifications (requires Add to Home Screen first)

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS is enabled (required for service workers)
- Clear browser cache and reload

### Notifications Not Working
- Check notification permission in browser settings
- Verify service worker is active (DevTools > Application > Service Workers)
- Ensure user is logged in as dispatcher
- Check browser supports notifications

### PWA Not Installable
- Verify manifest.json is accessible at `/manifest.json`
- Check manifest has required fields
- Ensure service worker is registered
- HTTPS is required (localhost is exempt)

## Future Enhancements

Potential improvements:
- Push notification server for offline notifications
- Background sync for offline request submission
- Custom notification sounds
- Notification grouping for multiple requests
- Rich notifications with action buttons
- Web Share API integration
