import { DISCORD_OAUTH_CONFIG, DISCORD_AUTH_CONFIG, AUTH_ERRORS } from '../config/discord';

// Helper functions
export const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Discord OAuth Helper Functions
export const generateOAuthState = () => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('discord_oauth_state', state);
  return state;
};

export const getDiscordOAuthUrl = () => {
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

export const mockDiscordAuth = async (simulatedUser) => {
  // This simulates what your backend would return after OAuth validation
  // In production, replace this with actual API calls to your backend
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  return {
    success: true,
    user: simulatedUser,
  };
};

// Check if user has required roles
export const determineUserRole = (memberRoles) => {
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
