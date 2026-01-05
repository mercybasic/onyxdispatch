import { useState } from 'react';

const PersonnelView = ({ users, crews }) => {
  const [filter, setFilter] = useState('all');

  console.log('PersonnelView - All users:', users);
  console.log('PersonnelView - Online users:', users.filter(u => u.online));

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'online') return u.online;
    if (filter === 'offline') return !u.online;
    return u.role === filter;
  });

  console.log('PersonnelView - Filtered users:', filteredUsers);

  const getUserCrew = (userId) => crews.find(c => c.members.includes(userId));

  return (
    <div className="main-content">
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="panel-title-icon">👥</span>
            Personnel Roster
          </h2>
          <select 
            className="form-select" 
            style={{ width: 'auto' }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Personnel</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="dispatcher">Dispatchers</option>
            <option value="pilot">Pilots</option>
            <option value="crew">Crew</option>
          </select>
        </div>
        <div className="panel-body" style={{ maxHeight: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredUsers.map(user => {
              const userCrew = getUserCrew(user.id);
              return (
                <div key={user.id} className="crew-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={`member-avatar ${user.online ? 'online' : ''}`} style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
                      {user.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.name}</div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--accent-cyan)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {user.role}
                      </div>
                    </div>
                    <span 
                      className="status-badge"
                      style={{
                        background: user.online ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                        color: user.online ? '#10b981' : '#6b7280'
                      }}
                    >
                      <span className="status-dot"></span>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {userCrew && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Assigned to: <span style={{ color: 'var(--text-primary)' }}>{userCrew.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component

export default PersonnelView;
