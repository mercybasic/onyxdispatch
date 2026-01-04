// Environment variable validation
// This helps debug configuration issues in production

export const validateEnvVars = () => {
  const required = {
    VITE_DISCORD_CLIENT_ID: import.meta.env.VITE_DISCORD_CLIENT_ID,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const optional = {
    VITE_DISCORD_SERVER_ID: import.meta.env.VITE_DISCORD_SERVER_ID,
    VITE_DISPATCHER_ROLE_ID: import.meta.env.VITE_DISPATCHER_ROLE_ID,
    VITE_PILOT_ROLE_ID: import.meta.env.VITE_PILOT_ROLE_ID,
    VITE_CREW_ROLE_ID: import.meta.env.VITE_CREW_ROLE_ID,
    VITE_DISCORD_INVITE: import.meta.env.VITE_DISCORD_INVITE,
  };

  const missing = [];
  const placeholder = [];

  // Check required variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    } else if (value.startsWith('your') || value.startsWith('YOUR')) {
      placeholder.push({ key, value });
    }
  });

  // Check optional variables for placeholders
  Object.entries(optional).forEach(([key, value]) => {
    if (value && (value.startsWith('your') || value.startsWith('YOUR'))) {
      placeholder.push({ key, value });
    }
  });

  return {
    isValid: missing.length === 0 && placeholder.length === 0,
    missing,
    placeholder,
    config: { ...required, ...optional },
  };
};

// Log configuration status in development
if (import.meta.env.DEV) {
  const validation = validateEnvVars();
  console.log('🔧 Environment Configuration:', validation);

  if (!validation.isValid) {
    if (validation.missing.length > 0) {
      console.error('❌ Missing required environment variables:', validation.missing);
    }
    if (validation.placeholder.length > 0) {
      console.warn('⚠️  Placeholder values detected:', validation.placeholder);
    }
  } else {
    console.log('✅ All environment variables configured');
  }
}
