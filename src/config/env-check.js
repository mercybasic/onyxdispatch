// Environment variable validation
// This helps debug configuration issues in production

export const validateEnvVars = () => {
  // Only Supabase credentials are required now
  // Discord OAuth is configured in Supabase, not via environment variables
  const required = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  // Discord-related vars are optional and only used for advanced features
  const optional = {
    VITE_DISCORD_SERVER_ID: import.meta.env.VITE_DISCORD_SERVER_ID,
    VITE_DISPATCHER_ROLE_ID: import.meta.env.VITE_DISPATCHER_ROLE_ID,
    VITE_PILOT_ROLE_ID: import.meta.env.VITE_PILOT_ROLE_ID,
    VITE_CREW_ROLE_ID: import.meta.env.VITE_CREW_ROLE_ID,
    VITE_DISCORD_INVITE: import.meta.env.VITE_DISCORD_INVITE,
  };

  const missing = [];
  const placeholder = [];

  // Check required variables (only Supabase now)
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    } else if (value.startsWith('your') || value.startsWith('YOUR') || value.startsWith('https://your')) {
      placeholder.push({ key, value });
    }
  });

  // Optional variables don't cause validation to fail
  const optionalWarnings = [];
  Object.entries(optional).forEach(([key, value]) => {
    if (value && (value.startsWith('your') || value.startsWith('YOUR'))) {
      optionalWarnings.push({ key, value });
    }
  });

  return {
    isValid: missing.length === 0 && placeholder.length === 0,
    missing,
    placeholder,
    optionalWarnings,
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
