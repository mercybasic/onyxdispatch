import React, { useState } from 'react';
import RequestCard from '../common/RequestCard';
import AssignCrewModal from '../modals/AssignCrewModal';
import { SERVICE_TYPES, STATUS_COLORS, PRIORITY_COLORS } from '../../config/constants';
import { formatTime } from '../../utils/helpers';

const RequestsView = ({ 
  requests, 
  crews, 
  users, 
  currentUser, 
  onNewRequest,
  onAssignCrew,
  onUpdateStatus 
}) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const isDispatcher = currentUser.role === 'dispatcher';
  
  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'active') return ['assigned', 'in-progress'].includes(r.status);
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  const assignedCrew = selectedRequest?.assignedCrew 
    ? crews.find(c => c.id === selectedRequest.assignedCrew)
    : null;

  return (
    <div className="main-content">
      <div className="dashboard-grid">
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📋</span>
              Service Requests
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-select" 
                style={{ width: 'auto' }}
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <button className="btn btn-primary" onClick={onNewRequest}>
                + New Request
              </button>
            </div>
          </div>
          <div className="panel-body" style={{ maxHeight: '600px' }}>
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">No requests found</div>
              </div>
            ) : (
              filteredRequests.map(request => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  serviceTypes={SERVICE_TYPES}
                  selected={selectedRequest?.id === request.id}
                  onClick={() => setSelectedRequest(request)}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📄</span>
              Request Details
            </h2>
          </div>
          <div className="panel-body">
            {!selectedRequest ? (
              <div className="empty-state">
                <div className="empty-state-icon">👆</div>
                <div className="empty-state-text">Select a request to view details</div>
              </div>
            ) : (
              <>
                <div className="detail-section">
                  <div className="detail-section-title">Service Type</div>
                  <div className="detail-value">
                    {SERVICE_TYPES.find(s => s.id === selectedRequest.type)?.icon}{' '}
                    {SERVICE_TYPES.find(s => s.id === selectedRequest.type)?.name}
                  </div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Priority</div>
                  <span 
                    className="priority-badge"
                    style={{ 
                      background: `${PRIORITY_COLORS[selectedRequest.priority]}20`,
                      color: PRIORITY_COLORS[selectedRequest.priority]
                    }}
                  >
                    {selectedRequest.priority}
                  </span>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Status</div>
                  <span 
                    className="status-badge"
                    style={{
                      background: `${STATUS_COLORS[selectedRequest.status]}20`,
                      color: STATUS_COLORS[selectedRequest.status]
                    }}
                  >
                    <span className="status-dot"></span>
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Location</div>
                  <div className="detail-value">📍 {selectedRequest.location}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Description</div>
                  <div className="detail-value">{selectedRequest.description}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Requested By</div>
                  <div className="detail-value">{selectedRequest.requesterName}</div>
                </div>
                {selectedRequest.discordUsername && (
                  <div className="detail-section">
                    <div className="detail-section-title">Discord</div>
                    <div className="detail-value discord-value">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#5865F2" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      {selectedRequest.discordUsername}
                    </div>
                  </div>
                )}
                <div className="detail-section">
                  <div className="detail-section-title">Created</div>
                  <div className="detail-value">{formatTime(selectedRequest.createdAt)}</div>
                </div>
                {assignedCrew && (
                  <div className="detail-section">
                    <div className="detail-section-title">Assigned Crew</div>
                    <div className="detail-value">
                      {assignedCrew.name} ({assignedCrew.callsign})
                    </div>
                  </div>
                )}

                {isDispatcher && (
                  <div className="action-buttons">
                    {selectedRequest.status === 'pending' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowAssignModal(true)}
                      >
                        🚀 Assign Crew
                      </button>
                    )}
                    {selectedRequest.status === 'assigned' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => onUpdateStatus(selectedRequest.id, 'in-progress')}
                      >
                        ▶ Mark In Progress
                      </button>
                    )}
                    {selectedRequest.status === 'in-progress' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => onUpdateStatus(selectedRequest.id, 'completed')}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    {['pending', 'assigned'].includes(selectedRequest.status) && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => onUpdateStatus(selectedRequest.id, 'cancelled')}
                      >
                        ✕ Cancel Request
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && selectedRequest && (
        <AssignCrewModal
          request={selectedRequest}
          crews={crews}
          users={users}
          onClose={() => setShowAssignModal(false)}
          onAssign={(requestId, crewId) => {
            onAssignCrew(requestId, crewId);
            setSelectedRequest(prev => ({...prev, assignedCrew: crewId, status: 'assigned'}));
          }}
        />
      )}
    </div>
  );
};


export default RequestsView;
