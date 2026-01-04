import React from 'react';

const Header = ({ currentUser, onLogout }) => (
  <header className="header">
    <div className="logo">
      <div className="logo-icon">📡</div>
      <div>
        <div className="logo-text"> ONYX SERVICES</div>
        <div className="logo-subtitle">Emergency Services Network</div>
      </div>
    </div>
    <div className="user-info">
      <div className="user-badge">
        {currentUser.avatar ? (
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="user-avatar-img"
          />
        ) : (
          <div className="user-avatar">👤</div>
        )}
        <div>
          <div className="user-name">{currentUser.name}</div>
          <div className="user-role">{currentUser.role}</div>
        </div>
        <div className="online-indicator"></div>
      </div>
      <button className="btn btn-sm" onClick={onLogout}>Logout</button>
    </div>
  </header>
);

export default Header;
