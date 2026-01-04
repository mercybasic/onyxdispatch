// Discord invite link - update this with your actual Discord server invite
export const DISCORD_INVITE_LINK = import.meta.env.VITE_DISCORD_INVITE || 'https://discord.gg/your-invite-code';

// Discord OAuth Configuration
// To set up Discord OAuth:
// 1. Go to https://discord.com/developers/applications
// 2. Create a new application or select existing one
// 3. Go to OAuth2 settings
// 4. Add your redirect URI (e.g., http://localhost:3000/auth/callback or your production URL)
// 5. Copy the Client ID and Client Secret
export const DISCORD_OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID',
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
    import.meta.env.VITE_DISCORD_SERVER_ID || 'YOUR_SERVER_ID_1',
    // Add more server IDs if needed
  ].filter(id => id && !id.startsWith('YOUR_')),
  // Role IDs that grant dispatcher access
  dispatcherRoles: [
    import.meta.env.VITE_DISPATCHER_ROLE_ID || 'DISPATCHER_ROLE_ID_1',
    // Add more dispatcher role IDs if needed
  ].filter(id => id && !id.startsWith('DISPATCHER_ROLE_ID')),
  // Role IDs that grant pilot access
  pilotRoles: [
    import.meta.env.VITE_PILOT_ROLE_ID || 'PILOT_ROLE_ID_1',
    // Add more pilot role IDs if needed
  ].filter(id => id && !id.startsWith('PILOT_ROLE_ID')),
  // Role IDs that grant crew access
  crewRoles: [
    import.meta.env.VITE_CREW_ROLE_ID || 'CREW_ROLE_ID_1',
    // Add more crew role IDs if needed
  ].filter(id => id && !id.startsWith('CREW_ROLE_ID')),
};

// Auth error messages
export const AUTH_ERRORS = {
  NOT_IN_SERVER: 'You must be a member of our Discord server to access the dispatch system.',
  NO_ROLE: 'You do not have the required role to access the dispatch system. Please contact an administrator.',
  OAUTH_FAILED: 'Discord authentication failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
};
