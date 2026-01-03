import React from 'react';
import { INITIAL_USERS } from '../../data/mockData';

const LoginScreen = ({ onBack, authState, onInitiateLogin, onDemoLogin, onClearError }) => {
  const { isLoading, error } = authState;

  // Demo users for testing without actual Discord OAuth
  const demoUsers = [
    { 
      id: 'demo_dispatcher_1', 
      name: 'Commander Reyes', 
      role: 'dispatcher', 
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      discriminator: '0001',
      discordId: '123456789',
    },
    { 
      id: 'demo_dispatcher_2', 
      name: 'Dispatcher Orion', 
      role: 'dispatcher', 
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      discriminator: '0002',
      discordId: '123456790',
    },
    { 
      id: 'demo_pilot_1', 
      name: 'Pilot Nova', 
      role: 'pilot', 
      avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
      discriminator: '0003',
      discordId: '123456791',
      crewId: 'c1',
    },
    { 
      id: 'demo_crew_1', 
      name: 'Engineer Kaz', 
      role: 'crew', 
      avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
      discriminator: '0004',
      discordId: '123456792',
      crewId: 'c1',
    },
  ];

  return (
    <div className="login-container">
      <div className="login-card discord-login-card">
        <div className="login-header">
          <div className="login-logo discord-logo">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <h1 className="login-title">STAFF LOGIN</h1>
          <p className="login-subtitle">Authenticate with Discord to access the dispatch system</p>
        </div>

        {error && (
          <div className="auth-error">
            <span className="auth-error-icon">⚠️</span>
            <span className="auth-error-text">{error}</span>
            <button className="auth-error-close" onClick={onClearError}>×</button>
          </div>
        )}

        {isLoading ? (
          <div className="auth-loading">
            <div className="auth-spinner"></div>
            <p>Authenticating with Discord...</p>
          </div>
        ) : (
          <>
            <button 
              className="btn btn-discord btn-discord-login"
              onClick={onInitiateLogin}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Sign in with Discord
            </button>

            <div className="auth-requirements">
              <h3 className="auth-requirements-title">Requirements</h3>
              <ul className="auth-requirements-list">
                <li>
                  <span className="requirement-icon">✓</span>
                  Must be a member of our Discord server
                </li>
                <li>
                  <span className="requirement-icon">✓</span>
                  Must have Dispatcher, Pilot, or Crew role assigned
                </li>
              </ul>
              <a 
                href={DISCORD_INVITE_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="join-server-link"
              >
                Not a member? Join our Discord server →
              </a>
            </div>

            <div className="demo-section">
              <div className="demo-divider">
                <span>Demo Mode</span>
              </div>
              <p className="demo-description">
                For testing purposes, select a demo account below:
              </p>
              <div className="demo-users-grid">
                {demoUsers.map(user => (
                  <button 
                    key={user.id}
                    className="demo-user-btn"
                    onClick={() => onDemoLogin(user)}
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="demo-user-avatar"
                    />
                    <div className="demo-user-info">
                      <span className="demo-user-name">{user.name}</span>
                      <span className={`demo-user-role role-${user.role}`}>{user.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="btn btn-back" onClick={onBack}>
          ← Back to Request Form
        </button>
      </div>
    </div>
  );
};


export default LoginScreen;
