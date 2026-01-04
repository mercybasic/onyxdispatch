import { useState, useEffect, useCallback } from 'react';
import useDiscordAuth from './hooks/useDiscordAuth';
import useSupabaseData from './hooks/useSupabaseData';
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
    createRequest,
    assignCrew,
    updateRequestStatus,
    createCrew,
    updateCrewStatus
  } = useSupabaseData(currentUser);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Check environment variables on mount
  useEffect(() => {
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
    if (isAuthenticated && currentUser) {
      syncUser(currentUser);
      showToast(`Welcome back, ${currentUser.name}!`);
      setShowLogin(false);
    }
  }, [isAuthenticated, currentUser, syncUser, showToast]);

  const handleLogout = () => {
    logout();
    setShowLogin(false);
    setActiveTab('dashboard');
  };

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
