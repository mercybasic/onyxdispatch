import React, { useState } from 'react';
import { SERVICE_TYPES } from '../../config/constants';

const LandingPage = ({ onSubmitRequest, onShowLogin, discordInviteLink }) => {
  const [formData, setFormData] = useState({
    type: 'SAR',
    priority: 'medium',
    location: '',
    description: '',
    clientName: '',
    discordUsername: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.location.trim() || !formData.description.trim() || !formData.clientName.trim()) return;
    const id = onSubmitRequest(formData);
    setRequestId(id);
    setSubmitted(true);
  };

  const handleNewRequest = () => {
    setFormData({
      type: 'SAR',
      priority: 'medium',
      location: '',
      description: '',
      clientName: '',
      discordUsername: '',
    });
    setSubmitted(false);
    setRequestId(null);
  };

  return (
    <div className="landing-page">
      <div className="landing-header">
        <div className="logo">
          <div className="logo-icon">📡</div>
          <div>
            <div className="logo-text">STELLAR DISPATCH</div>
            <div className="logo-subtitle">Emergency Services Network</div>
          </div>
        </div>
        <div className="header-actions">
          <a 
            href={discordInviteLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-discord"
          >
            <svg className="discord-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </a>
          <button className="btn" onClick={onShowLogin}>
            🔐 Staff Login
          </button>
        </div>
      </div>

      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-badge">🛡️ 24/7 EMERGENCY RESPONSE</div>
          <h1 className="hero-title">Need Assistance in the Verse?</h1>
          <p className="hero-subtitle">
            From search & rescue to refueling, our crews are standing by to help. 
            Submit your request below and a dispatcher will coordinate assistance.
          </p>
          <a 
            href={discordInviteLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="discord-cta"
          >
            <svg className="discord-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join our Discord for faster coordination
          </a>
        </div>

        <div className="services-grid">
          {SERVICE_TYPES.map(service => (
            <div key={service.id} className="service-card" style={{ '--service-color': service.color }}>
              <div className="service-icon">{service.icon}</div>
              <div className="service-name">{service.name}</div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <div className="request-form-container">
            <div className="form-header">
              <h2 className="form-title">Submit Service Request</h2>
              <p className="form-description">Fill out the form below and our dispatch team will respond promptly.</p>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Handle / Name *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g., StarCitizen_42"
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discord Username (Optional)</label>
                  <div className="input-with-icon">
                    <svg className="input-icon discord-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <input 
                      type="text"
                      className="form-input has-icon"
                      placeholder="e.g., username"
                      value={formData.discordUsername}
                      onChange={e => setFormData({...formData, discordUsername: e.target.value})}
                    />
                  </div>
                  <div className="form-hint">
                    <a href={discordInviteLink} target="_blank" rel="noopener noreferrer" className="discord-link">
                      Join our Discord
                    </a>
                    {' '}for faster coordination with our crews
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
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
                  <label className="form-label">Priority Level *</label>
                  <select 
                    className="form-select"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">🟢 Low - Not urgent</option>
                    <option value="medium">🟡 Medium - Need help soon</option>
                    <option value="high">🟠 High - Urgent situation</option>
                    <option value="critical">🔴 Critical - Life threatening</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Location *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g., Crusader - Port Olisar, Pad 07 or Daymar - coordinates 123.45"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  required
                />
                <div className="form-hint">Be as specific as possible: planet/moon, location name, coordinates, or nearby landmarks</div>
              </div>

              <div className="form-group">
                <label className="form-label">Situation Description *</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Describe your situation: What happened? What do you need? Any hazards or threats we should know about?"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-large">
                📤 Submit Request
              </button>
            </form>
          </div>
        ) : (
          <div className="confirmation-container">
            <div className="confirmation-card">
              <div className="confirmation-icon">✓</div>
              <h2 className="confirmation-title">Request Submitted!</h2>
              <p className="confirmation-text">
                Your service request has been received and added to our queue. 
                A dispatcher will review your request and assign a crew shortly.
              </p>
              <div className="confirmation-details">
                <div className="confirmation-row">
                  <span className="confirmation-label">Request ID:</span>
                  <span className="confirmation-value">{requestId?.toUpperCase()}</span>
                </div>
                <div className="confirmation-row">
                  <span className="confirmation-label">Service Type:</span>
                  <span className="confirmation-value">
                    {SERVICE_TYPES.find(s => s.id === formData.type)?.icon}{' '}
                    {SERVICE_TYPES.find(s => s.id === formData.type)?.name}
                  </span>
                </div>
                <div className="confirmation-row">
                  <span className="confirmation-label">Location:</span>
                  <span className="confirmation-value">{formData.location}</span>
                </div>
              </div>
              <a 
                href={discordInviteLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="confirmation-notice discord-notice"
              >
                <svg className="discord-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Join our Discord for real-time updates on your request!</span>
              </a>
              <button className="btn btn-primary" onClick={handleNewRequest}>
                Submit Another Request
              </button>
            </div>
          </div>
        )}

        <div className="landing-footer">
          <div className="footer-stats">
            <div className="footer-stat">
              <div className="footer-stat-value">500+</div>
              <div className="footer-stat-label">Rescues Completed</div>
            </div>
            <div className="footer-stat">
              <div className="footer-stat-value">24/7</div>
              <div className="footer-stat-label">Active Coverage</div>
            </div>
            <div className="footer-stat">
              <div className="footer-stat-value">&lt;15min</div>
              <div className="footer-stat-label">Avg Response Time</div>
            </div>
          </div>
          <div className="footer-text">
            Stellar Dispatch — Serving the citizens of Stanton since 2951
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
