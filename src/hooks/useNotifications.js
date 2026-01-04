import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Register service worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', reg);
      setRegistration(reg);

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        console.log('Service Worker update found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker available');
            // Optionally notify user of update
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (title, options = {}) => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      if (registration) {
        // Use service worker notification
        await registration.showNotification(title, {
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
          vibrate: [200, 100, 200],
          ...options
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/icons/icon.svg',
          ...options
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [isSupported, permission, registration, requestPermission]);

  const sendPushNotification = useCallback(async (payload) => {
    if (!registration || !registration.active) {
      console.warn('Service worker not ready for push notifications');
      return;
    }

    try {
      // Post message to service worker to show notification
      registration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }, [registration]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    sendPushNotification,
    registration
  };
};

export default useNotifications;
