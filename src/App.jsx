import { useState, useEffect, useCallback, useRef } from 'react';
import useDiscordAuth from './hooks/useDiscordAuth';
import useSupabaseData from './hooks/useSupabaseData';
import useNotifications from './hooks/useNotifications';
import { DISCORD_INVITE_LINK } from './config/discord';
import { validateEnvVars } from './config/env-check';
import Header from './components/layout/Header';
import NavTabs from './components/layout/NavTabs';
import LandingPage from './components/views/LandingPage';
import LoginScreen from './components/views/LoginScreen';
import Dashboard from './components/views/Dashboard';
import RequestsView from './components/views/RequestsView';
import CrewsView from './components/views/CrewsView';
import PersonnelView from './components/views/PersonnelView';
import NewRequestModal from './components/modals/NewRequestModal';
import Toast from './components/common/Toast';
import './styles/main.css';

export default function DispatchSystem() {
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Discord OAuth authentication
  const {
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
    user: currentUser,
    initiateLogin,
    logout,
    clearError: clearAuthError,
  } = useDiscordAuth();

  // Supabase data management
  const {
    crews,
    requests,
    users,
    activityLog,
    loading: dataLoading,
    syncUser,
    updatePresence,
    setUserOffline,
    createRequest,
    assignCrew,
    updateRequestStatus,
    createCrew,
    updateCrewStatus
  } = useSupabaseData(currentUser);

  // Notification management
  const {
    isSupported: notificationsSupported,
    permission: notificationPermission,
    requestPermission,
    showNotification
  } = useNotifications();

  // Track previous requests count to detect new requests
  const prevRequestsCount = useRef(0);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Check environment variables on mount and reset logout flag
  useEffect(() => {
    // Reset logout flag on mount
    window._isLoggingOut = false;

    const envValidation = validateEnvVars();
    if (!envValidation.isValid && !import.meta.env.DEV) {
      console.error('Environment configuration error:', envValidation);
      if (envValidation.placeholder.length > 0) {
        const placeholderVars = envValidation.placeholder.map(p => p.key).join(', ');
        showToast(`Configuration Error: ${placeholderVars} not set in deployment`, 'error');
      }
    }
  }, [showToast]);

  // Sync user to database on login
  useEffect(() => {
    // Don't sync during logout
    if (window._isLoggingOut) return;

    if (isAuthenticated && currentUser) {
      syncUser(currentUser);
      showToast(`Welcome back, ${currentUser.name}!`);
      setShowLogin(false);

      // Request notification permission for dispatchers
      if (currentUser.role === 'dispatcher' && notificationsSupported && notificationPermission === 'default') {
        setTimeout(() => {
          requestPermission();
        }, 2000); // Wait 2 seconds after login to request permission
      }
    }
  }, [isAuthenticated, currentUser, syncUser, showToast, notificationsSupported, notificationPermission, requestPermission]);

  // Detect new requests and send notifications
  useEffect(() => {
    // Don't process notifications during logout
    if (window._isLoggingOut) return;

    if (!isAuthenticated || !currentUser || currentUser.role !== 'dispatcher') {
      return;
    }

    const currentRequestsCount = requests.filter(r => r.status === 'pending').length;

    // Only notify if there are more pending requests than before
    if (prevRequestsCount.current > 0 && currentRequestsCount > prevRequestsCount.current) {
      const newRequestsCount = currentRequestsCount - prevRequestsCount.current;
      const newRequests = requests
        .filter(r => r.status === 'pending')
        .slice(0, newRequestsCount);

      // Show notification for new requests
      newRequests.forEach(request => {
        showNotification('🚨 New Service Request', {
          body: `${request.type} - ${request.location}\nPriority: ${request.priority}`,
          tag: `request-${request.id}`,
          requireInteraction: request.priority === 'critical',
          data: { requestId: request.id, type: 'new-request' }
        });
      });

      // Also show toast notification
      if (newRequestsCount === 1) {
        showToast(`New service request received!`, 'info');
      } else {
        showToast(`${newRequestsCount} new service requests received!`, 'info');
      }
    }

    prevRequestsCount.current = currentRequestsCount;
  }, [requests, isAuthenticated, currentUser, showNotification, showToast]);

  // Presence heartbeat - update last_seen every 60 seconds
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.discordId || window._isLoggingOut) {
      return;
    }

    // Initial presence update
    updatePresence(currentUser.discordId);

    // Set up heartbeat interval (every 60 seconds)
    const heartbeatInterval = setInterval(() => {
      if (!window._isLoggingOut) {
        updatePresence(currentUser.discordId);
      }
    }, 60000); // 60 seconds

    // Clean up on unmount or user change
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isAuthenticated, currentUser, updatePresence]);

  // Handle page unload/close - set user offline
  useEffect(() => {
    if (!currentUser?.discordId || window._isLoggingOut) return;

    const handleBeforeUnload = () => {
      if (!window._isLoggingOut) {
        // Set user offline when page is closing
        setUserOffline(currentUser.discordId);
      }
    };

    const handleVisibilityChange = () => {
      if (window._isLoggingOut) return;

      if (document.hidden) {
        setUserOffline(currentUser.discordId);
      } else {
        updatePresence(currentUser.discordId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, setUserOffline, updatePresence]);

  const handleLogout = useCallback(async () => {
    console.log('=== LOGOUT STARTED ===');

    // Prevent multiple simultaneous logout attempts
    if (window._isLoggingOut) {
      console.log('Logout already in progress, ignoring duplicate call');
      return;
    }
    window._isLoggingOut = true;

    try {
      console.log('Setting user offline...');
      // Try to set user offline (non-blocking, don't wait)
      if (currentUser?.discordId) {
        setUserOffline(currentUser.discordId).catch(err => {
          console.warn('Could not set user offline:', err);
        });
      }

      console.log('Calling Supabase signOut...');
      await logout();

      console.log('Logout successful, clearing local storage...');
      // Clear all Supabase-related items from localStorage to ensure clean logout
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log('Redirecting to home...');
      // Use replace to avoid back button issues
      window.location.replace('/');

    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error, clear storage first
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.error('Could not clear localStorage:', e);
      }
      window.location.replace('/');
    }
  }, [currentUser, logout, setUserOffline]);

  const handleClientRequest = async (formData) => {
    try {
      const requestData = {
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        description: formData.description,
        requesterName: formData.clientName,
        discordUsername: formData.discordUsername,
      };

      const newRequest = await createRequest(requestData);
      if (newRequest) {
        showToast('Request submitted successfully!');
        return newRequest.id;
      }
    } catch (error) {
      showToast('Failed to submit request', 'error');
      console.error('Error creating request:', error);
    }
  };

  const handleNewRequest = async (formData) => {
    try {
      const requestData = {
        ...formData,
        requesterName: currentUser.name,
        discordUsername: currentUser.name,
      };

      await createRequest(requestData);
      showToast('Service request submitted successfully!');
    } catch (error) {
      showToast('Failed to submit request', 'error');
      console.error('Error creating request:', error);
    }
  };

  const handleAssignCrew = async (requestId, crewId) => {
    try {
      await assignCrew(requestId, crewId);
      await updateCrewStatus(crewId, 'on-mission');
      const crew = crews.find(c => c.id === crewId);
      showToast(`${crew?.name} has been dispatched!`);
    } catch (error) {
      showToast('Failed to assign crew', 'error');
      console.error('Error assigning crew:', error);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);

      if (status === 'completed' || status === 'cancelled') {
        const request = requests.find(r => r.id === requestId);
        if (request?.assignedCrew) {
          await updateCrewStatus(request.assignedCrew, 'available');
        }
      }

      showToast(`Request status updated to ${status}`);
    } catch (error) {
      showToast('Failed to update status', 'error');
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateCrew = async (crewId, data) => {
    try {
      if (data.status) {
        await updateCrewStatus(crewId, data.status);
      }
      showToast('Crew updated successfully!');
    } catch (error) {
      showToast('Failed to update crew', 'error');
      console.error('Error updating crew:', error);
    }
  };

  const handleCreateCrew = async (crewData) => {
    try {
      await createCrew(crewData);
      showToast('Crew created successfully!');
    } catch (error) {
      showToast('Failed to create crew', 'error');
      console.error('Error creating crew:', error);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const isDispatcher = currentUser?.role === 'dispatcher';

  // Show landing page for unauthenticated users
  if (!isAuthenticated && !showLogin) {
    return (
      <div className="dispatch-app">
        <div className="grid-overlay"></div>
        <div className="scanline"></div>
        <LandingPage
          onSubmitRequest={handleClientRequest}
          onShowLogin={() => setShowLogin(true)}
          discordInviteLink={DISCORD_INVITE_LINK}
        />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // Show login screen
  if (!isAuthenticated && showLogin) {
    return (
      <div className="dispatch-app">
        <div className="grid-overlay"></div>
        <div className="scanline"></div>
        <LoginScreen
          onBack={() => setShowLogin(false)}
          authState={{ isLoading: authLoading, error: authError }}
          onInitiateLogin={initiateLogin}
          onClearError={clearAuthError}
        />
      </div>
    );
  }

  return (
    <div className="dispatch-app">
        <div className="grid-overlay"></div>
        <div className="scanline"></div>
        
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <NavTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
          isDispatcher={isDispatcher}
        />

        {activeTab === 'dashboard' && (
          <Dashboard
            requests={requests}
            crews={crews}
            users={users}
            activityLog={activityLog}
            currentUser={currentUser}
            onNewRequest={() => setShowNewRequestModal(true)}
            onSelectRequest={() => setActiveTab('requests')}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsView
            requests={requests}
            crews={crews}
            users={users}
            currentUser={currentUser}
            onNewRequest={() => setShowNewRequestModal(true)}
            onAssignCrew={handleAssignCrew}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'crews' && (
          <CrewsView
            crews={crews}
            users={users}
            currentUser={currentUser}
            onUpdateCrew={handleUpdateCrew}
            onCreateCrew={handleCreateCrew}
          />
        )}

        {activeTab === 'personnel' && isDispatcher && (
          <PersonnelView users={users} crews={crews} />
        )}

        {showNewRequestModal && (
          <NewRequestModal
            onClose={() => setShowNewRequestModal(false)}
            onSubmit={handleNewRequest}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
  );
}
