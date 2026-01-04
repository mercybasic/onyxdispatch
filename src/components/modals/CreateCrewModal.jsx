import { useState } from 'react';
import Modal from '../common/Modal';
import { SERVICE_TYPES } from '../../config/constants';

const CreateCrewModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    callsign: '',
    ship: '',
    location: '',
    capabilities: [],
  });

  const [errors, setErrors] = useState({});

  const handleCapabilityToggle = (cap) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Crew name is required';
    }

    if (!formData.callsign.trim()) {
      newErrors.callsign = 'Callsign is required';
    }

    if (!formData.ship.trim()) {
      newErrors.ship = 'Ship name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.capabilities.length === 0) {
      newErrors.capabilities = 'Select at least one capability';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Modal
      title="Create New Crew"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Crew</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Crew Name *</label>
        <input
          type="text"
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="e.g., Phoenix Squadron"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Callsign *</label>
        <input
          type="text"
          className={`form-input ${errors.callsign ? 'error' : ''}`}
          placeholder="e.g., Phoenix-1"
          value={formData.callsign}
          onChange={e => setFormData({...formData, callsign: e.target.value})}
        />
        {errors.callsign && <div className="form-error">{errors.callsign}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Ship *</label>
        <input
          type="text"
          className={`form-input ${errors.ship ? 'error' : ''}`}
          placeholder="e.g., Cutlass Red"
          value={formData.ship}
          onChange={e => setFormData({...formData, ship: e.target.value})}
        />
        {errors.ship && <div className="form-error">{errors.ship}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Current Location *</label>
        <input
          type="text"
          className={`form-input ${errors.location ? 'error' : ''}`}
          placeholder="e.g., Port Olisar"
          value={formData.location}
          onChange={e => setFormData({...formData, location: e.target.value})}
        />
        {errors.location && <div className="form-error">{errors.location}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Capabilities *</label>
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
        {errors.capabilities && <div className="form-error">{errors.capabilities}</div>}
      </div>
    </Modal>
  );
};

export default CreateCrewModal;
