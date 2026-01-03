import React, { useState } from 'react';
import Modal from '../common/Modal';
import { SERVICE_TYPES } from '../../config/constants';

const NewRequestModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'SAR',
    priority: 'medium',
    location: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.location.trim() || !formData.description.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal 
      title="New Service Request"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Service Type</label>
        <select 
          className="form-select"
          value={formData.type}
          onChange={e => setFormData({...formData, type: e.target.value})}
        >
          {SERVICE_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select 
          className="form-select"
          value={formData.priority}
          onChange={e => setFormData({...formData, priority: e.target.value})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Location</label>
        <input 
          type="text"
          className="form-input"
          placeholder="e.g., Crusader - Port Olisar"
          value={formData.location}
          onChange={e => setFormData({...formData, location: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea 
          className="form-textarea"
          placeholder="Describe the situation and any relevant details..."
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>
    </Modal>
  );
};

export default NewRequestModal;
