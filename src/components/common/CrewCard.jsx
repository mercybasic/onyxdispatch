import React from 'react';
import { STATUS_COLORS } from '../../config/constants';

const CrewCard = ({ crew, users, selectable, onClick }) => {
  const members = users.filter(u => crew.members.includes(u.id));
  
  return (
    <div className={`crew-card ${selectable ? 'selectable' : ''}`} onClick={onClick}>
      <div className="crew-header">
        <div>
          <div className="crew-name">{crew.name}</div>
          <div className="crew-callsign">{crew.callsign}</div>
        </div>
        <span 
          className="status-badge"
          style={{
            background: `${STATUS_COLORS[crew.status]}20`,
            color: STATUS_COLORS[crew.status]
          }}
        >
          <span className="status-dot"></span>
          {crew.status.replace('-', ' ')}
        </span>
      </div>
      <div className="crew-ship">🚀 {crew.ship}</div>
      <div className="crew-location">📍 {crew.location}</div>
      <div className="capabilities-list">
        {crew.capabilities.map(cap => (
          <span key={cap} className="capability-tag">{cap}</span>
        ))}
      </div>
      <div className="crew-members">
        {members.map(member => (
          <div 
            key={member.id} 
            className={`member-avatar ${member.online ? 'online' : ''}`}
            title={member.name}
          >
            {member.avatar}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrewCard;
