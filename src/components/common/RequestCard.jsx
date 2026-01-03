import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../config/constants';
import { formatTime } from '../../utils/helpers';

const RequestCard = ({ request, serviceTypes, selected, onClick }) => {
  const serviceType = serviceTypes.find(s => s.id === request.type) || {};
  
  return (
    <div 
      className={`request-card ${selected ? 'selected' : ''}`}
      style={{ '--priority-color': PRIORITY_COLORS[request.priority] }}
      onClick={onClick}
    >
      <div className="request-header">
        <div className="request-type">
          <span className="request-type-icon">{serviceType.icon}</span>
          <span className="request-type-name">{serviceType.name}</span>
        </div>
        <span 
          className="priority-badge" 
          style={{ 
            background: `${PRIORITY_COLORS[request.priority]}20`,
            color: PRIORITY_COLORS[request.priority]
          }}
        >
          {request.priority}
        </span>
      </div>
      <div className="request-id">ID: {request.id.toUpperCase()}</div>
      <div className="request-location">📍 {request.location}</div>
      <div className="request-description">{request.description}</div>
      <div className="request-meta">
        <span 
          className="status-badge"
          style={{
            background: `${STATUS_COLORS[request.status]}20`,
            color: STATUS_COLORS[request.status]
          }}
        >
          <span className="status-dot"></span>
          {request.status}
        </span>
        <span className="request-time">{formatTime(request.createdAt)}</span>
      </div>
    </div>
  );
};

export default RequestCard;
