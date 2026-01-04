import { useState } from 'react';
import CrewCard from '../common/CrewCard';
import ManageCrewModal from '../modals/ManageCrewModal';
import CreateCrewModal from '../modals/CreateCrewModal';
import { STATUS_COLORS } from '../../config/constants';

const CrewsView = ({ crews, users, currentUser, onUpdateCrew, onCreateCrew }) => {
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const isDispatcher = currentUser.role === 'dispatcher';
  const userCrew = crews.find(c => c.members.includes(currentUser.id));

  const filteredCrews = crews.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const selectedCrewMembers = selectedCrew 
    ? users.filter(u => selectedCrew.members.includes(u.id))
    : [];

  return (
    <div className="main-content">
      {userCrew && !isDispatcher && (
        <div className="panel" style={{ marginBottom: '1.5rem' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">🏠</span>
              My Crew
            </h2>
            <button 
              className="btn btn-sm"
              onClick={() => {
                setSelectedCrew(userCrew);
                setShowManageModal(true);
              }}
            >
              Manage Status
            </button>
          </div>
          <div className="panel-body">
            <CrewCard crew={userCrew} users={users} />
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">🚀</span>
              All Crews
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {isDispatcher && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Crew
                </button>
              )}
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="on-mission">On Mission</option>
                <option value="standby">Standby</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          <div className="panel-body" style={{ maxHeight: '600px' }}>
            {filteredCrews.map(crew => (
              <CrewCard 
                key={crew.id}
                crew={crew}
                users={users}
                selectable
                onClick={() => setSelectedCrew(crew)}
              />
            ))}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📄</span>
              Crew Details
            </h2>
          </div>
          <div className="panel-body">
            {!selectedCrew ? (
              <div className="empty-state">
                <div className="empty-state-icon">👆</div>
                <div className="empty-state-text">Select a crew to view details</div>
              </div>
            ) : (
              <>
                <div className="detail-section">
                  <div className="detail-section-title">Crew Name</div>
                  <div className="detail-value">{selectedCrew.name}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Callsign</div>
                  <div className="detail-value">{selectedCrew.callsign}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Ship</div>
                  <div className="detail-value">🚀 {selectedCrew.ship}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Status</div>
                  <span 
                    className="status-badge"
                    style={{
                      background: `${STATUS_COLORS[selectedCrew.status]}20`,
                      color: STATUS_COLORS[selectedCrew.status]
                    }}
                  >
                    <span className="status-dot"></span>
                    {selectedCrew.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Location</div>
                  <div className="detail-value">📍 {selectedCrew.location}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Capabilities</div>
                  <div className="capabilities-list">
                    {selectedCrew.capabilities.map(cap => (
                      <span key={cap} className="capability-tag">{cap}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Members ({selectedCrewMembers.length})</div>
                  {selectedCrewMembers.map(member => (
                    <div key={member.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <div className={`member-avatar ${member.online ? 'online' : ''}`}>
                        {member.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(isDispatcher || userCrew?.id === selectedCrew.id) && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowManageModal(true)}
                    >
                      ⚙ Manage Crew
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showManageModal && selectedCrew && (
        <ManageCrewModal
          crew={selectedCrew}
          users={users}
          onClose={() => setShowManageModal(false)}
          onUpdate={(crewId, data) => {
            onUpdateCrew(crewId, data);
            setSelectedCrew(prev => ({...prev, ...data}));
          }}
        />
      )}

      {showCreateModal && (
        <CreateCrewModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateCrew}
        />
      )}
    </div>
  );
};


export default CrewsView;
