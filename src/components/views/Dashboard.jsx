import React from 'react';
import StatCard from '../common/StatCard';
import RequestCard from '../common/RequestCard';
import { SERVICE_TYPES } from '../../config/constants';
import { formatTime } from '../../utils/helpers';

const Dashboard = ({ requests, crews, users, currentUser, onNewRequest, onSelectRequest }) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => ['assigned', 'in-progress'].includes(r.status));
  const availableCrews = crews.filter(c => c.status === 'available');
  const onlinePersonnel = users.filter(u => u.online);

  const recentActivity = [
    { icon: '📡', text: 'New SAR request received from Citizen_Jake', time: Date.now() - 120000 },
    { icon: '🚀', text: 'Phoenix Squadron dispatched to Daymar', time: Date.now() - 900000 },
    { icon: '✅', text: 'Refueling mission completed by Starrunner Team', time: Date.now() - 3600000 },
    { icon: '👤', text: 'Pilot Nova came online', time: Date.now() - 5400000 },
  ];

  return (
    <div className="main-content">
      <div className="stats-grid">
        <StatCard 
          label="Pending Requests" 
          value={pendingRequests.length} 
          icon="📋"
          color={pendingRequests.length > 0 ? '#f59e0b' : '#10b981'}
        />
        <StatCard 
          label="Active Missions" 
          value={activeRequests.length} 
          icon="🎯"
          color="#3b82f6"
        />
        <StatCard 
          label="Available Crews" 
          value={availableCrews.length} 
          icon="🚀"
          color="#10b981"
        />
        <StatCard 
          label="Online Personnel" 
          value={onlinePersonnel.length} 
          icon="👥"
          color="#8b5cf6"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">⚡</span>
              Pending Requests
            </h2>
            <button className="btn btn-sm btn-primary" onClick={onNewRequest}>
              + New Request
            </button>
          </div>
          <div className="panel-body">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <div className="empty-state-text">No pending requests</div>
              </div>
            ) : (
              pendingRequests.map(request => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  serviceTypes={SERVICE_TYPES}
                  onClick={() => onSelectRequest(request)}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">🎯</span>
              Active Missions
            </h2>
          </div>
          <div className="panel-body">
            {activeRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌙</div>
                <div className="empty-state-text">No active missions</div>
              </div>
            ) : (
              activeRequests.map(request => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  serviceTypes={SERVICE_TYPES}
                  onClick={() => onSelectRequest(request)}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📜</span>
              Activity Feed
            </h2>
          </div>
          <div className="panel-body activity-feed">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-text">{activity.text}</div>
                  <div className="activity-time">{formatTime(activity.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
