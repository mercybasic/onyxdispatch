import { supabase, isSupabaseConfigured } from '../lib/supabase';

// VAPID keys for push notifications (in production, store these securely)
// Generate new keys with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Check if browser supports notifications
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get current notification permission status
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

// Subscribe user to push notifications
export const subscribeToPushNotifications = async (userId) => {
  if (!isNotificationSupported()) {
    throw new Error('Push notifications not supported');
  }

  try {
    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Save subscription to database
    if (isSupabaseConfigured()) {
      await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: subscription.toJSON(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (userId) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Remove subscription from database
    if (isSupabaseConfigured()) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

// Show local notification (doesn't require push service)
export const showLocalNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [200, 100, 200],
      ...options
    });
  }
};

// Notify dispatcher of new request
export const notifyNewRequest = (request) => {
  const title = '🚨 New Service Request';
  const options = {
    body: `${request.type} - ${request.priority} priority\n${request.location}`,
    tag: `request-${request.id}`,
    requireInteraction: true,
    data: {
      type: 'new_request',
      requestId: request.id,
      url: '/?tab=requests'
    },
    actions: [
      { action: 'view', title: 'View Request', icon: '/icons/icon-96x96.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/icons/icon-96x96.png' }
    ]
  };

  return showLocalNotification(title, options);
};

// Notify crew of assignment
export const notifyCrewAssignment = (request, crew) => {
  const title = '🎯 Mission Assigned';
  const options = {
    body: `${crew.name} dispatched to ${request.type}\n${request.location}`,
    tag: `assignment-${request.id}`,
    requireInteraction: true,
    data: {
      type: 'crew_assignment',
      requestId: request.id,
      crewId: crew.id,
      url: '/?tab=crews'
    },
    actions: [
      { action: 'view', title: 'View Mission', icon: '/icons/icon-96x96.png' },
      { action: 'acknowledge', title: 'Acknowledge', icon: '/icons/icon-96x96.png' }
    ]
  };

  return showLocalNotification(title, options);
};

// Notify status update
export const notifyStatusUpdate = (request, newStatus) => {
  const statusEmojis = {
    'assigned': '📋',
    'in-progress': '🚀',
    'completed': '✅',
    'cancelled': '❌'
  };

  const title = `${statusEmojis[newStatus] || '📢'} Mission Status Updated`;
  const options = {
    body: `${request.type} - ${request.location}\nStatus: ${newStatus}`,
    tag: `status-${request.id}`,
    data: {
      type: 'status_update',
      requestId: request.id,
      status: newStatus,
      url: '/?tab=requests'
    }
  };

  return showLocalNotification(title, options);
};

// Send push notification via backend (for offline users)
export const sendPushNotification = async (userId, notification) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping push notification');
    return;
  }

  try {
    // In production, this would call a Supabase Edge Function or backend API
    // that sends the push notification using web-push library

    // For now, we'll store it in a notifications table
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        read: false,
        created_at: new Date().toISOString()
      });

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

// Get unread notifications for user
export const getUnreadNotifications = async (userId) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  return { data, error };
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return { error };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
