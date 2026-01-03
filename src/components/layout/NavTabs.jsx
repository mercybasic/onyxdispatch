import React from 'react';

const NavTabs = ({ activeTab, setActiveTab, pendingCount, isDispatcher }) => (
  <nav className="nav-tabs">
    <button 
      className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
      onClick={() => setActiveTab('dashboard')}
    >
      Dashboard
    </button>
    <button 
      className={`nav-tab ${activeTab === 'requests' ? 'active' : ''}`}
      onClick={() => setActiveTab('requests')}
    >
      Requests
      {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
    </button>
    <button 
      className={`nav-tab ${activeTab === 'crews' ? 'active' : ''}`}
      onClick={() => setActiveTab('crews')}
    >
      Crews
    </button>
    {isDispatcher && (
      <button 
        className={`nav-tab ${activeTab === 'personnel' ? 'active' : ''}`}
        onClick={() => setActiveTab('personnel')}
      >
        Personnel
      </button>
    )}
  </nav>
);

export default NavTabs;
