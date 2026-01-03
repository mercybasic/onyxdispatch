import React, { useState } from 'react';
import Modal from '../common/Modal';
import { SERVICE_TYPES } from '../../config/constants';

const ManageCrewModal = ({ crew, users, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: crew?.status || 'available',
    location: crew?.location || '',
    capabilities: crew?.capabilities || [],
  });

  const handleCapabilityToggle = (cap) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  const handleSubmit = () => {
    onUpdate(crew.id, formData);
    onClose();
  };

  if (!crew) return null;

  return (
    <Modal 
      title="Manage Crew"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save Changes</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Crew Name</label>
        <div className="detail-value">{crew.name} ({crew.callsign})</div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select 
          className="form-select"
          value={formData.status}
          onChange={e => setFormData({...formData, status: e.target.value})}
        >
          <option value="available">Available</option>
          <option value="standby">Standby</option>
          <option value="on-mission">On Mission</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Current Location</label>
        <input 
          type="text"
          className="form-input"
          value={formData.location}
          onChange={e => setFormData({...formData, location: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Capabilities</label>
        <div className="checkbox-group">
          {SERVICE_TYPES.map(type => (
            <label 
              key={type.id}
              className={`checkbox-item ${formData.capabilities.includes(type.id) ? 'checked' : ''}`}
            >
              <input 
                type="checkbox"
                checked={formData.capabilities.includes(type.id)}
                onChange={() => handleCapabilityToggle(type.id)}
              />
              <span>{type.icon} {type.id}</span>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ManageCrewModal;
