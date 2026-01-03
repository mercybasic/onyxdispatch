import React from 'react';
import Modal from '../common/Modal';
import CrewCard from '../common/CrewCard';

const AssignCrewModal = ({ request, crews, users, onClose, onAssign }) => {
  const availableCrews = crews.filter(c => 
    c.status === 'available' && 
    c.capabilities.includes(request.type)
  );

  return (
    <Modal 
      title="Assign Crew"
      onClose={onClose}
    >
      <div className="detail-section">
        <div className="detail-section-title">Request Details</div>
        <div className="detail-value">{request.type} - {request.location}</div>
      </div>
      
      <div className="detail-section-title">Available Crews</div>
      {availableCrews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚫</div>
          <div className="empty-state-text">No crews available with required capabilities</div>
        </div>
      ) : (
        <div className="crew-select-list">
          {availableCrews.map(crew => (
            <CrewCard 
              key={crew.id}
              crew={crew}
              users={users}
              selectable
              onClick={() => {
                onAssign(request.id, crew.id);
                onClose();
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AssignCrewModal;
