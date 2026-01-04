import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AUTH_ERRORS } from '../config/discord';
import { mockDiscordAuth } from '../utils/helpers';

// Custom hook for Discord OAuth via Supabase Auth
export const useDiscordAuth = () => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    error: null,
    isAuthenticated: false,
    user: null,
  });

  // Check for existing Supabase session on mount
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      if (!supabase) {
        // Fallback to session storage for demo mode
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
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Initial session check:', { hasSession: !!session, error });

        if (error) {
          console.error('Error getting session:', error);
          setAuthState({ isLoading: false, error: error.message, isAuthenticated: false, user: null });
          return;
        }

        if (session?.user) {
          console.log('User session found:', session.user.user_metadata);
          // Map Supabase user to our app user format
          const appUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Discord User',
            avatar: session.user.user_metadata?.avatar_url,
            discordId: session.user.user_metadata?.provider_id,
            role: 'dispatcher', // Default role, can be determined from Discord roles later
          };

          setAuthState({
            isLoading: false,
            error: null,
            isAuthenticated: true,
            user: appUser,
          });
        } else {
          console.log('No session found');
          setAuthState({ isLoading: false, error: null, isAuthenticated: false, user: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({ isLoading: false, error: error.message, isAuthenticated: false, user: null });
      }
    };

    initAuth();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const appUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Discord User',
            avatar: session.user.user_metadata?.avatar_url,
            discordId: session.user.user_metadata?.provider_id,
            role: 'dispatcher',
          };

          setAuthState({
            isLoading: false,
            error: null,
            isAuthenticated: true,
            user: appUser,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            isLoading: false,
            error: null,
            isAuthenticated: false,
            user: null,
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const initiateLogin = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Login functionality disabled.');
      setAuthState(prev => ({ ...prev, error: 'Authentication not configured' }));
      return;
    }

    console.log('Initiating Discord OAuth login via Supabase...');
    console.log('Redirect URL will be:', window.location.origin);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin,
          // Only request user identity scope - don't request guild/bot permissions
          scopes: 'identify email',
        },
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        console.error('Discord OAuth error:', error);
        setAuthState(prev => ({ ...prev, error: `OAuth error: ${error.message}` }));
      } else {
        console.log('Redirecting to Discord... URL:', data?.url);
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, error: AUTH_ERRORS.OAUTH_FAILED }));
    }
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

  const logout = async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Also clear session storage for demo mode
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

export default useDiscordAuth;
