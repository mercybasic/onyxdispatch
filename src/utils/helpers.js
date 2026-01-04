import { DISCORD_AUTH_CONFIG } from '../config/discord';

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

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

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
