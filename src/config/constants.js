// Mock data for initial state
export const INITIAL_USERS = [
  { id: 'u1', name: 'Commander Reyes', role: 'dispatcher', avatar: '👤', online: true },
  { id: 'u2', name: 'Pilot Nova', role: 'pilot', avatar: '🧑‍✈️', online: true, crewId: 'c1' },
  { id: 'u3', name: 'Engineer Kaz', role: 'crew', avatar: '🔧', online: true, crewId: 'c1' },
  { id: 'u4', name: 'Medic Chen', role: 'crew', avatar: '⚕️', online: true, crewId: 'c1' },
  { id: 'u5', name: 'Pilot Vance', role: 'pilot', avatar: '🧑‍✈️', online: true, crewId: 'c2' },
  { id: 'u6', name: 'Gunner Thorne', role: 'crew', avatar: '🎯', online: false, crewId: 'c2' },
  { id: 'u7', name: 'Dispatcher Orion', role: 'dispatcher', avatar: '📡', online: true },
];

export const INITIAL_CREWS = [
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

export const INITIAL_REQUESTS = [
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

export const SERVICE_TYPES = [
  { id: 'SAR', name: 'Search & Rescue', icon: '🔍', color: '#f59e0b' },
  { id: 'CSAR', name: 'Combat SAR', icon: '⚔️', color: '#ef4444' },
  { id: 'Refueling', name: 'Refueling', icon: '⛽', color: '#3b82f6' },
  { id: 'Medical', name: 'Medical Evac', icon: '🏥', color: '#10b981' },
  { id: 'Escort', name: 'Escort', icon: '🛡️', color: '#8b5cf6' },
  { id: 'Cargo', name: 'Cargo Assist', icon: '📦', color: '#6366f1' },
];

export const STATUS_COLORS = {
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

export const PRIORITY_COLORS = {
  'critical': '#ef4444',
  'high': '#f97316',
  'medium': '#f59e0b',
  'low': '#10b981',
};

// Discord invite link - update this with your actual Discord server invite
export const DISCORD_INVITE_LINK = 'https://discord.gg/your-invite-code';

// Discord OAuth Configuration
// To set up Discord OAuth:
// 1. Go to https://discord.com/developers/applications
// 2. Create a new application or select existing one
// 3. Go to OAuth2 settings
// 4. Add your redirect URI (e.g., http://localhost:3000/auth/callback or your production URL)
// 5. Copy the Client ID and Client Secret
export const DISCORD_OAUTH_CONFIG = {
  clientId: 'YOUR_DISCORD_CLIENT_ID',
  // Client Secret should be stored securely on your backend, never expose in frontend
  // This is here for reference only - actual OAuth should use a backend server
  redirectUri: window.location.origin + '/auth/callback',
  scope: 'identify guilds guilds.members.read',
};

// Server and Role Configuration
// Add your Discord server IDs and the role IDs that grant access
export const DISCORD_AUTH_CONFIG = {
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
export const AUTH_ERRORS = {
  NOT_IN_SERVER: 'You must be a member of our Discord server to access the dispatch system.',
  NO_ROLE: 'You do not have the required role to access the dispatch system. Please contact an administrator.',
  OAUTH_FAILED: 'Discord authentication failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
};
