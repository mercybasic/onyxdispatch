import { useState, useEffect, useCallback } from 'react';
import useDiscordAuth from './hooks/useDiscordAuth';
import { INITIAL_USERS, INITIAL_CREWS, INITIAL_REQUESTS } from './data/mockData';
import { DISCORD_INVITE_LINK } from './config/discord';
import { generateId } from './utils/helpers';
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
  const [crews, setCrews] = useState(INITIAL_CREWS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
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

  // Show toast on successful login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      showToast(`Welcome back, ${currentUser.name}!`);
      setShowLogin(false);
    }
  }, [isAuthenticated, currentUser, showToast]);

  const handleLogout = () => {
    logout();
    setShowLogin(false);
    setActiveTab('dashboard');
  };

  const handleClientRequest = (formData) => {
    const id = generateId();
    const newRequest = {
      id,
      type: formData.type,
      priority: formData.priority,
      location: formData.location,
      description: formData.description,
      status: 'pending',
      requesterId: null,
      requesterName: formData.clientName,
      discordUsername: formData.discordUsername,
      createdAt: Date.now(),
      assignedCrew: null,
      dispatcherId: null,
    };
    setRequests(prev => [newRequest, ...prev]);
    return id;
  };

  const handleNewRequest = (formData) => {
    const newRequest = {
      id: generateId(),
      ...formData,
      status: 'pending',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      createdAt: Date.now(),
      assignedCrew: null,
      dispatcherId: null,
    };
    setRequests(prev => [newRequest, ...prev]);
    showToast('Service request submitted successfully!');
  };

  const handleAssignCrew = (requestId, crewId) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, assignedCrew: crewId, status: 'assigned', dispatcherId: currentUser.id }
        : r
    ));
    setCrews(prev => prev.map(c =>
      c.id === crewId ? { ...c, status: 'on-mission' } : c
    ));
    const crew = crews.find(c => c.id === crewId);
    showToast(`${crew?.name} has been dispatched!`);
  };

  const handleUpdateStatus = (requestId, status) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status } : r
    ));
    
    if (status === 'completed' || status === 'cancelled') {
      const request = requests.find(r => r.id === requestId);
      if (request?.assignedCrew) {
        setCrews(prev => prev.map(c =>
          c.id === request.assignedCrew ? { ...c, status: 'available' } : c
        ));
      }
    }
    
    showToast(`Request status updated to ${status}`);
  };

  const handleUpdateCrew = (crewId, data) => {
    setCrews(prev => prev.map(c =>
      c.id === crewId ? { ...c, ...data } : c
    ));
    showToast('Crew updated successfully!');
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const isDispatcher = currentUser?.role === 'dispatcher';

  // In production, users would come from your backend based on Discord guild members
  // For now, we use mock data for crew member display
  const users = INITIAL_USERS;

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
            currentUser={currentUser}
            onNewRequest={() => setShowNewRequestModal(true)}
            onSelectRequest={(request) => {
              setSelectedRequest(request);
              setActiveTab('requests');
            }}
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
