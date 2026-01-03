import React, { useState, useEffect, useCallback } from 'react';

// Mock data for initial state
const INITIAL_USERS = [
  { id: 'u1', name: 'Commander Reyes', role: 'dispatcher', avatar: '👤', online: true },
  { id: 'u2', name: 'Pilot Nova', role: 'pilot', avatar: '🧑‍✈️', online: true, crewId: 'c1' },
  { id: 'u3', name: 'Engineer Kaz', role: 'crew', avatar: '🔧', online: true, crewId: 'c1' },
  { id: 'u4', name: 'Medic Chen', role: 'crew', avatar: '⚕️', online: true, crewId: 'c1' },
  { id: 'u5', name: 'Pilot Vance', role: 'pilot', avatar: '🧑‍✈️', online: true, crewId: 'c2' },
  { id: 'u6', name: 'Gunner Thorne', role: 'crew', avatar: '🎯', online: false, crewId: 'c2' },
  { id: 'u7', name: 'Dispatcher Orion', role: 'dispatcher', avatar: '📡', online: true },
];

const INITIAL_CREWS = [
  { 
    id: 'c1', 
    name: 'Phoenix Squadron', 
    callsign: 'PHOENIX-1',
    ship: 'Cutlass Red',
    status: 'available',
    capabilities: ['SAR', 'Medical', 'CSAR'],
    location: 'Crusader - Port Olisar',
    members: ['u2', 'u3', 'u4']
  },
  { 
    id: 'c2', 
    name: 'Starrunner Team', 
    callsign: 'STARRUN-7',
    ship: 'Starfarer',
    status: 'on-mission',
    capabilities: ['Refueling', 'Cargo'],
    location: 'Stanton - ARC-L1',
    members: ['u5', 'u6']
  },
];

const INITIAL_REQUESTS = [
  {
    id: 'r1',
    type: 'SAR',
    priority: 'high',
    status: 'pending',
    location: 'Daymar - Shubin Mining SMO-18',
    description: 'Pilot stranded after ship malfunction. Low oxygen reported.',
    requesterId: 'client1',
    requesterName: 'Citizen_Jake',
    createdAt: Date.now() - 1200000,
    assignedCrew: null,
    dispatcherId: null,
  },
  {
    id: 'r2',
    type: 'Refueling',
    priority: 'medium',
    status: 'assigned',
    location: 'CRU-L4 - Deep Space',
    description: 'Hull C requires emergency refuel. Quantum fuel depleted.',
    requesterId: 'client2',
    requesterName: 'HaulerMax',
    createdAt: Date.now() - 3600000,
    assignedCrew: 'c2',
    dispatcherId: 'u1',
  },
];

const SERVICE_TYPES = [
  { id: 'SAR', name: 'Search & Rescue', icon: '🔍', color: '#f59e0b' },
  { id: 'CSAR', name: 'Combat SAR', icon: '⚔️', color: '#ef4444' },
  { id: 'Refueling', name: 'Refueling', icon: '⛽', color: '#3b82f6' },
  { id: 'Medical', name: 'Medical Evac', icon: '🏥', color: '#10b981' },
  { id: 'Escort', name: 'Escort', icon: '🛡️', color: '#8b5cf6' },
  { id: 'Cargo', name: 'Cargo Assist', icon: '📦', color: '#6366f1' },
];

const STATUS_COLORS = {
  'available': '#10b981',
  'on-mission': '#f59e0b',
  'standby': '#6366f1',
  'offline': '#6b7280',
  'pending': '#f59e0b',
  'assigned': '#3b82f6',
  'in-progress': '#8b5cf6',
  'completed': '#10b981',
  'cancelled': '#ef4444',
};

const PRIORITY_COLORS = {
  'critical': '#ef4444',
  'high': '#f97316',
  'medium': '#f59e0b',
  'low': '#10b981',
};

// Discord invite link - update this with your actual Discord server invite
const DISCORD_INVITE_LINK = 'https://discord.gg/your-invite-code';

// Discord OAuth Configuration
// To set up Discord OAuth:
// 1. Go to https://discord.com/developers/applications
// 2. Create a new application or select existing one
// 3. Go to OAuth2 settings
// 4. Add your redirect URI (e.g., http://localhost:3000/auth/callback or your production URL)
// 5. Copy the Client ID and Client Secret
const DISCORD_OAUTH_CONFIG = {
  clientId: 'YOUR_DISCORD_CLIENT_ID',
  // Client Secret should be stored securely on your backend, never expose in frontend
  // This is here for reference only - actual OAuth should use a backend server
  redirectUri: window.location.origin + '/auth/callback',
  scope: 'identify guilds guilds.members.read',
};

// Server and Role Configuration
// Add your Discord server IDs and the role IDs that grant access
const DISCORD_AUTH_CONFIG = {
  // List of server IDs where membership is required (user must be in at least one)
  requiredServers: [
    'YOUR_SERVER_ID_1',
    // 'YOUR_SERVER_ID_2', // Add more if needed
  ],
  // Role IDs that grant dispatcher access
  dispatcherRoles: [
    'DISPATCHER_ROLE_ID_1',
    // 'DISPATCHER_ROLE_ID_2',
  ],
  // Role IDs that grant pilot access
  pilotRoles: [
    'PILOT_ROLE_ID_1',
    // 'PILOT_ROLE_ID_2',
  ],
  // Role IDs that grant crew access
  crewRoles: [
    'CREW_ROLE_ID_1',
    // 'CREW_ROLE_ID_2',
  ],
};

// Auth error messages
const AUTH_ERRORS = {
  NOT_IN_SERVER: 'You must be a member of our Discord server to access the dispatch system.',
  NO_ROLE: 'You do not have the required role to access the dispatch system. Please contact an administrator.',
  OAUTH_FAILED: 'Discord authentication failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
};

// Styles
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --bg-primary: #0a0e17;
    --bg-secondary: #111827;
    --bg-tertiary: #1f2937;
    --bg-card: rgba(17, 24, 39, 0.8);
    --border-color: rgba(59, 130, 246, 0.3);
    --border-glow: rgba(59, 130, 246, 0.5);
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --text-accent: #60a5fa;
    --accent-blue: #3b82f6;
    --accent-cyan: #06b6d4;
    --accent-purple: #8b5cf6;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
  }

  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Rajdhani', sans-serif;
    min-height: 100vh;
  }

  .dispatch-app {
    min-height: 100vh;
    background: 
      radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 70%),
      var(--bg-primary);
  }

  .grid-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  .scanline {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(59, 130, 246, 0.02) 50%,
      transparent 100%
    );
    animation: scanline 8s linear infinite;
    pointer-events: none;
    z-index: 1;
  }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  .header {
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.8) 100%);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  }

  .logo-text {
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    background: linear-gradient(90deg, var(--text-primary), var(--accent-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
  }

  .logo-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    letter-spacing: 4px;
    text-transform: uppercase;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-badge {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .user-avatar-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .user-role {
    font-size: 0.7rem;
    color: var(--accent-cyan);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .online-indicator {
    width: 8px;
    height: 8px;
    background: var(--success);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--success);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .nav-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: rgba(17, 24, 39, 0.5);
    border-bottom: 1px solid var(--border-color);
  }

  .nav-tab {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
  }

  .nav-tab::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .nav-tab:hover {
    color: var(--text-primary);
    background: rgba(59, 130, 246, 0.1);
  }

  .nav-tab.active {
    color: var(--accent-cyan);
    border-color: var(--border-color);
    background: rgba(59, 130, 246, 0.1);
  }

  .nav-tab.active::before {
    transform: scaleX(1);
  }

  .tab-badge {
    background: var(--danger);
    color: white;
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    border-radius: 10px;
    margin-left: 0.5rem;
  }

  .main-content {
    padding: 2rem;
    position: relative;
    z-index: 10;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 350px;
    gap: 1.5rem;
    max-width: 1800px;
    margin: 0 auto;
  }

  @media (max-width: 1400px) {
    .dashboard-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 900px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .panel:hover {
    border-color: var(--border-glow);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.1);
  }

  .panel-header {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-family: 'Orbitron', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--accent-cyan);
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .panel-title-icon {
    font-size: 1.1rem;
  }

  .panel-body {
    padding: 1rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .panel-body::-webkit-scrollbar {
    width: 6px;
  }

  .panel-body::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  .panel-body::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .request-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .request-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--priority-color, var(--accent-blue));
  }

  .request-card:hover {
    border-color: var(--border-glow);
    transform: translateX(4px);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
  }

  .request-card.selected {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
  }

  .request-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .request-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .request-type-icon {
    font-size: 1.25rem;
  }

  .request-type-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .request-id {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .priority-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .request-location {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.85rem;
    color: var(--accent-cyan);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .request-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin-bottom: 0.75rem;
  }

  .request-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .request-time {
    font-family: 'Share Tech Mono', monospace;
  }

  .crew-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    transition: all 0.3s ease;
  }

  .crew-card:hover {
    border-color: var(--border-glow);
  }

  .crew-card.selectable {
    cursor: pointer;
  }

  .crew-card.selectable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  }

  .crew-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .crew-name {
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }

  .crew-callsign {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    color: var(--accent-cyan);
  }

  .crew-ship {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .crew-location {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  .capabilities-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }

  .capability-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 4px;
    color: var(--accent-cyan);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .crew-members {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
  }

  .member-avatar {
    width: 28px;
    height: 28px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    position: relative;
  }

  .member-avatar.online::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background: var(--success);
    border: 2px solid var(--bg-tertiary);
    border-radius: 50%;
  }

  .btn {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.6rem 1.25rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn:hover {
    border-color: var(--accent-blue);
    background: rgba(59, 130, 246, 0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
    border-color: var(--accent-cyan);
    color: white;
  }

  .btn-primary:hover {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
    transform: translateY(-1px);
  }

  .btn-danger {
    border-color: var(--danger);
    color: var(--danger);
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .btn-success {
    border-color: var(--success);
    color: var(--success);
  }

  .btn-success:hover {
    background: rgba(16, 185, 129, 0.1);
  }

  .btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.95rem;
    transition: all 0.3s ease;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
  }

  .form-select {
    cursor: pointer;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-header {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-title {
    font-family: 'Orbitron', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    color: var(--accent-cyan);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    transition: color 0.3s ease;
  }

  .modal-close:hover {
    color: var(--text-primary);
  }

  .modal-body {
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .modal-footer {
    border-top: 1px solid var(--border-color);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--stat-color, var(--accent-blue));
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--stat-color, var(--text-primary));
  }

  .stat-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    opacity: 0.3;
  }

  .activity-feed {
    max-height: 300px;
    overflow-y: auto;
  }

  .activity-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .activity-icon {
    width: 32px;
    height: 32px;
    background: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .activity-content {
    flex: 1;
  }

  .activity-text {
    font-size: 0.85rem;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .activity-time {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }

  .empty-state-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state-text {
    font-size: 0.9rem;
  }

  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .login-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
    backdrop-filter: blur(20px);
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-logo {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1rem;
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  }

  .login-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, var(--text-primary), var(--accent-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .login-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .user-select-grid {
    display: grid;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .user-select-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .user-select-btn:hover {
    border-color: var(--accent-cyan);
    transform: translateX(4px);
  }

  .user-select-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .user-select-info {
    flex: 1;
  }

  .user-select-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .user-select-role {
    font-size: 0.75rem;
    color: var(--accent-cyan);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .detail-panel {
    position: sticky;
    top: 100px;
  }

  .detail-section {
    margin-bottom: 1.25rem;
  }

  .detail-section-title {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  .detail-value {
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .crew-select-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 2000;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .toast-success {
    border-color: var(--success);
  }

  .toast-error {
    border-color: var(--danger);
  }

  .toast-icon {
    font-size: 1.25rem;
  }

  .toast-message {
    font-size: 0.9rem;
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .checkbox-item:hover {
    border-color: var(--accent-blue);
  }

  .checkbox-item.checked {
    border-color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.1);
  }

  .checkbox-item input {
    display: none;
  }

  .checkbox-item span {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Landing Page Styles */
  .landing-page {
    min-height: 100vh;
    position: relative;
    z-index: 10;
  }

  .landing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 3rem;
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.7) 100%);
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(20px);
  }

  .landing-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 3rem 2rem;
  }

  .landing-hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .hero-badge {
    display: inline-block;
    background: linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: var(--success);
    padding: 0.5rem 1.25rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 2px;
    margin-bottom: 1.5rem;
  }

  .hero-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-cyan) 50%, var(--accent-blue) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.15rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 800px) {
    .services-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .hero-title {
      font-size: 2rem;
    }
  }

  @media (max-width: 500px) {
    .services-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .service-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem 0.75rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: default;
  }

  .service-card:hover {
    border-color: var(--service-color, var(--accent-blue));
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px color-mix(in srgb, var(--service-color, var(--accent-blue)) 20%, transparent);
  }

  .service-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .service-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .request-form-container {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    margin-bottom: 3rem;
  }

  .form-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .form-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-cyan);
    margin-bottom: 0.5rem;
  }

  .form-description {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .request-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .form-hint {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.4rem;
    font-style: italic;
  }

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1rem;
    margin-top: 0.5rem;
  }

  .btn-back {
    width: 100%;
    margin-top: 1.5rem;
    justify-content: center;
  }

  .confirmation-container {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
  }

  .confirmation-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 3rem;
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  .confirmation-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--success), var(--accent-cyan));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: white;
    margin: 0 auto 1.5rem;
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
  }

  .confirmation-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .confirmation-text {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .confirmation-details {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .confirmation-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .confirmation-row:last-child {
    border-bottom: none;
  }

  .confirmation-label {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .confirmation-value {
    color: var(--text-primary);
    font-weight: 600;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.85rem;
  }

  .confirmation-notice {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    text-align: left;
    font-size: 0.9rem;
    color: var(--accent-cyan);
  }

  .notice-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .landing-footer {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }

  .footer-stats {
    display: flex;
    justify-content: center;
    gap: 4rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 600px) {
    .footer-stats {
      gap: 2rem;
    }
  }

  .footer-stat {
    text-align: center;
  }

  .footer-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-cyan);
    margin-bottom: 0.25rem;
  }

  .footer-stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .footer-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  /* Discord Styles */
  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .btn-discord {
    background: #5865F2;
    border-color: #5865F2;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-discord:hover {
    background: #4752C4;
    border-color: #4752C4;
    box-shadow: 0 0 20px rgba(88, 101, 242, 0.4);
  }

  .discord-icon {
    flex-shrink: 0;
  }

  .discord-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(88, 101, 242, 0.15);
    border: 1px solid rgba(88, 101, 242, 0.4);
    border-radius: 8px;
    color: #5865F2;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .discord-cta:hover {
    background: rgba(88, 101, 242, 0.25);
    border-color: #5865F2;
    transform: translateY(-2px);
  }

  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 1rem;
    color: #5865F2;
    pointer-events: none;
    z-index: 1;
  }

  .form-input.has-icon {
    padding-left: 2.75rem;
  }

  .discord-link {
    color: #5865F2;
    text-decoration: none;
    font-weight: 600;
  }

  .discord-link:hover {
    text-decoration: underline;
  }

  .discord-notice {
    background: rgba(88, 101, 242, 0.15);
    border-color: rgba(88, 101, 242, 0.4);
    color: #a8b1ff;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .discord-notice:hover {
    background: rgba(88, 101, 242, 0.25);
    border-color: #5865F2;
  }

  .discord-notice .discord-icon {
    color: #5865F2;
  }

  /* Discord OAuth Login Styles */
  .discord-login-card {
    max-width: 450px;
  }

  .discord-logo {
    background: #5865F2 !important;
  }

  .btn-discord-login {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .auth-error-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .auth-error-text {
    flex: 1;
    font-size: 0.9rem;
    color: #fca5a5;
  }

  .auth-error-close {
    background: none;
    border: none;
    color: #fca5a5;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .auth-error-close:hover {
    color: white;
  }

  .auth-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
  }

  .auth-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--border-color);
    border-top-color: #5865F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-requirements {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .auth-requirements-title {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
  }

  .auth-requirements-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .auth-requirements-list li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .requirement-icon {
    color: var(--success);
    font-weight: bold;
  }

  .join-server-link {
    display: block;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    color: #5865F2;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .join-server-link:hover {
    color: #7289da;
  }

  .demo-section {
    margin-top: 1.5rem;
  }

  .demo-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin-bottom: 1rem;
  }

  .demo-divider::before,
  .demo-divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border-color);
  }

  .demo-divider span {
    padding: 0 1rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .demo-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 1rem;
  }

  .demo-users-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 400px) {
    .demo-users-grid {
      grid-template-columns: 1fr;
    }
  }

  .demo-user-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .demo-user-btn:hover {
    border-color: #5865F2;
    background: rgba(88, 101, 242, 0.1);
  }

  .demo-user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-tertiary);
  }

  .demo-user-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .demo-user-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .demo-user-role {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    width: fit-content;
  }

  .demo-user-role.role-dispatcher {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  .demo-user-role.role-pilot {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
  }

  .demo-user-role.role-crew {
    background: rgba(16, 185, 129, 0.2);
    color: #6ee7b7;
  }
`;

// Helper functions
const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Discord OAuth Helper Functions
const generateOAuthState = () => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('discord_oauth_state', state);
  return state;
};

const getDiscordOAuthUrl = () => {
  const state = generateOAuthState();
  const params = new URLSearchParams({
    client_id: DISCORD_OAUTH_CONFIG.clientId,
    redirect_uri: DISCORD_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: DISCORD_OAUTH_CONFIG.scope,
    state: state,
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
};

// Simulated Discord API calls - In production, these should go through your backend
// Your backend should:
// 1. Exchange the OAuth code for tokens
// 2. Fetch user info and guild membership
// 3. Validate roles and return user data
// 4. Never expose tokens to the frontend

const mockDiscordAuth = async (simulatedUser) => {
  // This simulates what your backend would return after OAuth validation
  // In production, replace this with actual API calls to your backend
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  return {
    success: true,
    user: simulatedUser,
  };
};

// Check if user has required roles
const determineUserRole = (memberRoles) => {
  // Check roles in order of priority (dispatcher > pilot > crew)
  for (const roleId of DISCORD_AUTH_CONFIG.dispatcherRoles) {
    if (memberRoles.includes(roleId)) return 'dispatcher';
  }
  for (const roleId of DISCORD_AUTH_CONFIG.pilotRoles) {
    if (memberRoles.includes(roleId)) return 'pilot';
  }
  for (const roleId of DISCORD_AUTH_CONFIG.crewRoles) {
    if (memberRoles.includes(roleId)) return 'crew';
  }
  return null;
};

// Custom hook for Discord OAuth
const useDiscordAuth = () => {
  const [authState, setAuthState] = useState({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('discord_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          isLoading: false,
          error: null,
          isAuthenticated: true,
          user,
        });
      } catch (e) {
        sessionStorage.removeItem('discord_user');
      }
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      setAuthState(prev => ({ ...prev, error: AUTH_ERRORS.OAUTH_FAILED }));
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state) {
      const savedState = sessionStorage.getItem('discord_oauth_state');
      
      if (state !== savedState) {
        setAuthState(prev => ({ ...prev, error: 'Invalid OAuth state. Please try again.' }));
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('discord_oauth_state');

      // In production, send this code to your backend to exchange for tokens
      // For demo purposes, we'll show the OAuth flow UI
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    }
  }, []);

  const initiateLogin = () => {
    window.location.href = getDiscordOAuthUrl();
  };

  const handleDemoLogin = async (demoUser) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await mockDiscordAuth(demoUser);
      
      if (result.success) {
        sessionStorage.setItem('discord_user', JSON.stringify(result.user));
        setAuthState({
          isLoading: false,
          error: null,
          isAuthenticated: true,
          user: result.user,
        });
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: AUTH_ERRORS.OAUTH_FAILED,
      }));
    }
  };

  const logout = () => {
    sessionStorage.removeItem('discord_user');
    setAuthState({
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    initiateLogin,
    handleDemoLogin,
    logout,
    clearError,
  };
};

// Components
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{type === 'success' ? '✓' : '✕'}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

const Modal = ({ title, children, onClose, footer }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

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

const Header = ({ currentUser, onLogout }) => (
  <header className="header">
    <div className="logo">
      <div className="logo-icon">📡</div>
      <div>
        <div className="logo-text">STELLAR DISPATCH</div>
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

const NavTabs = ({ activeTab, setActiveTab, pendingCount, isDispatcher }) => (
  <nav className="nav-tabs">
    <button 
      className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
      onClick={() => setActiveTab('dashboard')}
    >
      Dashboard
    </button>
    <button 
      className={`nav-tab ${activeTab === 'requests' ? 'active' : ''}`}
      onClick={() => setActiveTab('requests')}
    >
      Requests
      {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
    </button>
    <button 
      className={`nav-tab ${activeTab === 'crews' ? 'active' : ''}`}
      onClick={() => setActiveTab('crews')}
    >
      Crews
    </button>
    {isDispatcher && (
      <button 
        className={`nav-tab ${activeTab === 'personnel' ? 'active' : ''}`}
        onClick={() => setActiveTab('personnel')}
      >
        Personnel
      </button>
    )}
  </nav>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-icon">{icon}</div>
  </div>
);

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

const Dashboard = ({ requests, crews, users, currentUser, onNewRequest, onSelectRequest }) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => ['assigned', 'in-progress'].includes(r.status));
  const availableCrews = crews.filter(c => c.status === 'available');
  const onlinePersonnel = users.filter(u => u.online);

  const recentActivity = [
    { icon: '📡', text: 'New SAR request received from Citizen_Jake', time: Date.now() - 120000 },
    { icon: '🚀', text: 'Phoenix Squadron dispatched to Daymar', time: Date.now() - 900000 },
    { icon: '✅', text: 'Refueling mission completed by Starrunner Team', time: Date.now() - 3600000 },
    { icon: '👤', text: 'Pilot Nova came online', time: Date.now() - 5400000 },
  ];

  return (
    <div className="main-content">
      <div className="stats-grid">
        <StatCard 
          label="Pending Requests" 
          value={pendingRequests.length} 
          icon="📋"
          color={pendingRequests.length > 0 ? '#f59e0b' : '#10b981'}
        />
        <StatCard 
          label="Active Missions" 
          value={activeRequests.length} 
          icon="🎯"
          color="#3b82f6"
        />
        <StatCard 
          label="Available Crews" 
          value={availableCrews.length} 
          icon="🚀"
          color="#10b981"
        />
        <StatCard 
          label="Online Personnel" 
          value={onlinePersonnel.length} 
          icon="👥"
          color="#8b5cf6"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">⚡</span>
              Pending Requests
            </h2>
            <button className="btn btn-sm btn-primary" onClick={onNewRequest}>
              + New Request
            </button>
          </div>
          <div className="panel-body">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <div className="empty-state-text">No pending requests</div>
              </div>
            ) : (
              pendingRequests.map(request => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  serviceTypes={SERVICE_TYPES}
                  onClick={() => onSelectRequest(request)}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">🎯</span>
              Active Missions
            </h2>
          </div>
          <div className="panel-body">
            {activeRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌙</div>
                <div className="empty-state-text">No active missions</div>
              </div>
            ) : (
              activeRequests.map(request => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  serviceTypes={SERVICE_TYPES}
                  onClick={() => onSelectRequest(request)}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📜</span>
              Activity Feed
            </h2>
          </div>
          <div className="panel-body activity-feed">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-text">{activity.text}</div>
                  <div className="activity-time">{formatTime(activity.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestsView = ({ 
  requests, 
  crews, 
  users, 
  currentUser, 
  onNewRequest,
  onAssignCrew,
  onUpdateStatus 
}) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const isDispatcher = currentUser.role === 'dispatcher';
  
  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'active') return ['assigned', 'in-progress'].includes(r.status);
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  const assignedCrew = selectedRequest?.assignedCrew 
    ? crews.find(c => c.id === selectedRequest.assignedCrew)
    : null;

  return (
    <div className="main-content">
      <div className="dashboard-grid">
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📋</span>
              Service Requests
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-select" 
                style={{ width: 'auto' }}
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <button className="btn btn-primary" onClick={onNewRequest}>
                + New Request
              </button>
            </div>
          </div>
          <div className="panel-body" style={{ maxHeight: '600px' }}>
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">No requests found</div>
              </div>
            ) : (
              filteredRequests.map(request => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  serviceTypes={SERVICE_TYPES}
                  selected={selectedRequest?.id === request.id}
                  onClick={() => setSelectedRequest(request)}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📄</span>
              Request Details
            </h2>
          </div>
          <div className="panel-body">
            {!selectedRequest ? (
              <div className="empty-state">
                <div className="empty-state-icon">👆</div>
                <div className="empty-state-text">Select a request to view details</div>
              </div>
            ) : (
              <>
                <div className="detail-section">
                  <div className="detail-section-title">Service Type</div>
                  <div className="detail-value">
                    {SERVICE_TYPES.find(s => s.id === selectedRequest.type)?.icon}{' '}
                    {SERVICE_TYPES.find(s => s.id === selectedRequest.type)?.name}
                  </div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Priority</div>
                  <span 
                    className="priority-badge"
                    style={{ 
                      background: `${PRIORITY_COLORS[selectedRequest.priority]}20`,
                      color: PRIORITY_COLORS[selectedRequest.priority]
                    }}
                  >
                    {selectedRequest.priority}
                  </span>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Status</div>
                  <span 
                    className="status-badge"
                    style={{
                      background: `${STATUS_COLORS[selectedRequest.status]}20`,
                      color: STATUS_COLORS[selectedRequest.status]
                    }}
                  >
                    <span className="status-dot"></span>
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Location</div>
                  <div className="detail-value">📍 {selectedRequest.location}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Description</div>
                  <div className="detail-value">{selectedRequest.description}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Requested By</div>
                  <div className="detail-value">{selectedRequest.requesterName}</div>
                </div>
                {selectedRequest.discordUsername && (
                  <div className="detail-section">
                    <div className="detail-section-title">Discord</div>
                    <div className="detail-value discord-value">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#5865F2" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      {selectedRequest.discordUsername}
                    </div>
                  </div>
                )}
                <div className="detail-section">
                  <div className="detail-section-title">Created</div>
                  <div className="detail-value">{formatTime(selectedRequest.createdAt)}</div>
                </div>
                {assignedCrew && (
                  <div className="detail-section">
                    <div className="detail-section-title">Assigned Crew</div>
                    <div className="detail-value">
                      {assignedCrew.name} ({assignedCrew.callsign})
                    </div>
                  </div>
                )}

                {isDispatcher && (
                  <div className="action-buttons">
                    {selectedRequest.status === 'pending' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowAssignModal(true)}
                      >
                        🚀 Assign Crew
                      </button>
                    )}
                    {selectedRequest.status === 'assigned' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => onUpdateStatus(selectedRequest.id, 'in-progress')}
                      >
                        ▶ Mark In Progress
                      </button>
                    )}
                    {selectedRequest.status === 'in-progress' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => onUpdateStatus(selectedRequest.id, 'completed')}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    {['pending', 'assigned'].includes(selectedRequest.status) && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => onUpdateStatus(selectedRequest.id, 'cancelled')}
                      >
                        ✕ Cancel Request
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && selectedRequest && (
        <AssignCrewModal
          request={selectedRequest}
          crews={crews}
          users={users}
          onClose={() => setShowAssignModal(false)}
          onAssign={(requestId, crewId) => {
            onAssignCrew(requestId, crewId);
            setSelectedRequest(prev => ({...prev, assignedCrew: crewId, status: 'assigned'}));
          }}
        />
      )}
    </div>
  );
};

const CrewsView = ({ crews, users, currentUser, onUpdateCrew }) => {
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const isDispatcher = currentUser.role === 'dispatcher';
  const userCrew = crews.find(c => c.members.includes(currentUser.id));

  const filteredCrews = crews.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const selectedCrewMembers = selectedCrew 
    ? users.filter(u => selectedCrew.members.includes(u.id))
    : [];

  return (
    <div className="main-content">
      {userCrew && !isDispatcher && (
        <div className="panel" style={{ marginBottom: '1.5rem' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">🏠</span>
              My Crew
            </h2>
            <button 
              className="btn btn-sm"
              onClick={() => {
                setSelectedCrew(userCrew);
                setShowManageModal(true);
              }}
            >
              Manage Status
            </button>
          </div>
          <div className="panel-body">
            <CrewCard crew={userCrew} users={users} />
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">🚀</span>
              All Crews
            </h2>
            <select 
              className="form-select" 
              style={{ width: 'auto' }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on-mission">On Mission</option>
              <option value="standby">Standby</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="panel-body" style={{ maxHeight: '600px' }}>
            {filteredCrews.map(crew => (
              <CrewCard 
                key={crew.id}
                crew={crew}
                users={users}
                selectable
                onClick={() => setSelectedCrew(crew)}
              />
            ))}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-title-icon">📄</span>
              Crew Details
            </h2>
          </div>
          <div className="panel-body">
            {!selectedCrew ? (
              <div className="empty-state">
                <div className="empty-state-icon">👆</div>
                <div className="empty-state-text">Select a crew to view details</div>
              </div>
            ) : (
              <>
                <div className="detail-section">
                  <div className="detail-section-title">Crew Name</div>
                  <div className="detail-value">{selectedCrew.name}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Callsign</div>
                  <div className="detail-value">{selectedCrew.callsign}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Ship</div>
                  <div className="detail-value">🚀 {selectedCrew.ship}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Status</div>
                  <span 
                    className="status-badge"
                    style={{
                      background: `${STATUS_COLORS[selectedCrew.status]}20`,
                      color: STATUS_COLORS[selectedCrew.status]
                    }}
                  >
                    <span className="status-dot"></span>
                    {selectedCrew.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Location</div>
                  <div className="detail-value">📍 {selectedCrew.location}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Capabilities</div>
                  <div className="capabilities-list">
                    {selectedCrew.capabilities.map(cap => (
                      <span key={cap} className="capability-tag">{cap}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-section">
                  <div className="detail-section-title">Members ({selectedCrewMembers.length})</div>
                  {selectedCrewMembers.map(member => (
                    <div key={member.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <div className={`member-avatar ${member.online ? 'online' : ''}`}>
                        {member.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(isDispatcher || userCrew?.id === selectedCrew.id) && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowManageModal(true)}
                    >
                      ⚙ Manage Crew
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showManageModal && selectedCrew && (
        <ManageCrewModal
          crew={selectedCrew}
          users={users}
          onClose={() => setShowManageModal(false)}
          onUpdate={(crewId, data) => {
            onUpdateCrew(crewId, data);
            setSelectedCrew(prev => ({...prev, ...data}));
          }}
        />
      )}
    </div>
  );
};

const PersonnelView = ({ users, crews }) => {
  const [filter, setFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'online') return u.online;
    if (filter === 'offline') return !u.online;
    return u.role === filter;
  });

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
export default function DispatchSystem() {
  const [showLogin, setShowLogin] = useState(false);
  const [crews, setCrews] = useState(INITIAL_CREWS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Discord OAuth authentication
  const { 
    isLoading: authLoading, 
    error: authError, 
    isAuthenticated, 
    user: currentUser,
    initiateLogin,
    handleDemoLogin,
    logout,
    clearError: clearAuthError,
  } = useDiscordAuth();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Show toast on successful login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      showToast(`Welcome back, ${currentUser.name}!`);
      setShowLogin(false);
    }
  }, [isAuthenticated, currentUser, showToast]);

  const handleLogout = () => {
    logout();
    setShowLogin(false);
    setActiveTab('dashboard');
  };

  const handleClientRequest = (formData) => {
    const id = generateId();
    const newRequest = {
      id,
      type: formData.type,
      priority: formData.priority,
      location: formData.location,
      description: formData.description,
      status: 'pending',
      requesterId: null,
      requesterName: formData.clientName,
      discordUsername: formData.discordUsername,
      createdAt: Date.now(),
      assignedCrew: null,
      dispatcherId: null,
    };
    setRequests(prev => [newRequest, ...prev]);
    return id;
  };

  const handleNewRequest = (formData) => {
    const newRequest = {
      id: generateId(),
      ...formData,
      status: 'pending',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      createdAt: Date.now(),
      assignedCrew: null,
      dispatcherId: null,
    };
    setRequests(prev => [newRequest, ...prev]);
    showToast('Service request submitted successfully!');
  };

  const handleAssignCrew = (requestId, crewId) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, assignedCrew: crewId, status: 'assigned', dispatcherId: currentUser.id }
        : r
    ));
    setCrews(prev => prev.map(c =>
      c.id === crewId ? { ...c, status: 'on-mission' } : c
    ));
    const crew = crews.find(c => c.id === crewId);
    showToast(`${crew?.name} has been dispatched!`);
  };

  const handleUpdateStatus = (requestId, status) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status } : r
    ));
    
    if (status === 'completed' || status === 'cancelled') {
      const request = requests.find(r => r.id === requestId);
      if (request?.assignedCrew) {
        setCrews(prev => prev.map(c =>
          c.id === request.assignedCrew ? { ...c, status: 'available' } : c
        ));
      }
    }
    
    showToast(`Request status updated to ${status}`);
  };

  const handleUpdateCrew = (crewId, data) => {
    setCrews(prev => prev.map(c =>
      c.id === crewId ? { ...c, ...data } : c
    ));
    showToast('Crew updated successfully!');
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const isDispatcher = currentUser?.role === 'dispatcher';

  // In production, users would come from your backend based on Discord guild members
  // For now, we use mock data for crew member display
  const users = INITIAL_USERS;

  // Show landing page for unauthenticated users
  if (!isAuthenticated && !showLogin) {
    return (
      <>
        <style>{styles}</style>
        <div className="dispatch-app">
          <div className="grid-overlay"></div>
          <div className="scanline"></div>
          <LandingPage 
            onSubmitRequest={handleClientRequest}
            onShowLogin={() => setShowLogin(true)}
            discordInviteLink={DISCORD_INVITE_LINK}
          />
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </>
    );
  }

  // Show login screen
  if (!isAuthenticated && showLogin) {
    return (
      <>
        <style>{styles}</style>
        <div className="dispatch-app">
          <div className="grid-overlay"></div>
          <div className="scanline"></div>
          <LoginScreen 
            onBack={() => setShowLogin(false)}
            authState={{ isLoading: authLoading, error: authError }}
            onInitiateLogin={initiateLogin}
            onDemoLogin={handleDemoLogin}
            onClearError={clearAuthError}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dispatch-app">
        <div className="grid-overlay"></div>
        <div className="scanline"></div>
        
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <NavTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
          isDispatcher={isDispatcher}
        />

        {activeTab === 'dashboard' && (
          <Dashboard 
            requests={requests}
            crews={crews}
            users={users}
            currentUser={currentUser}
            onNewRequest={() => setShowNewRequestModal(true)}
            onSelectRequest={(request) => {
              setSelectedRequest(request);
              setActiveTab('requests');
            }}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsView
            requests={requests}
            crews={crews}
            users={users}
            currentUser={currentUser}
            onNewRequest={() => setShowNewRequestModal(true)}
            onAssignCrew={handleAssignCrew}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'crews' && (
          <CrewsView
            crews={crews}
            users={users}
            currentUser={currentUser}
            onUpdateCrew={handleUpdateCrew}
          />
        )}

        {activeTab === 'personnel' && isDispatcher && (
          <PersonnelView users={users} crews={crews} />
        )}

        {showNewRequestModal && (
          <NewRequestModal
            onClose={() => setShowNewRequestModal(false)}
            onSubmit={handleNewRequest}
          />
        )}

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </>
  );
}
