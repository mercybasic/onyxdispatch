import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AUTH_ERRORS } from '../config/discord';

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
        console.warn('Supabase not configured. Authentication disabled.');
        setAuthState({ isLoading: false, error: null, isAuthenticated: false, user: null });
        return;
      }

      try {
        // First, check if we're handling an OAuth callback
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          // Let Supabase handle the OAuth callback
          await new Promise(resolve => setTimeout(resolve, 1000)); // Give Supabase time to process
        }

        // Now get the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setAuthState({ isLoading: false, error: error.message, isAuthenticated: false, user: null });
          return;
        }

        if (session?.user) {
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
        if (event === 'SIGNED_IN' && session?.user) {
          const appUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.user_name || 'Discord User',
            avatar: session.user.user_metadata?.avatar_url,
            discordId: session.user.user_metadata?.provider_id || session.user.id,
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
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const appUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.user_name || 'Discord User',
            avatar: session.user.user_metadata?.avatar_url,
            discordId: session.user.user_metadata?.provider_id || session.user.id,
            role: 'dispatcher',
          };
          setAuthState({
            isLoading: false,
            error: null,
            isAuthenticated: true,
            user: appUser,
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
      setAuthState(prev => ({ ...prev, error: 'Authentication not configured. Please check Supabase settings.' }));
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin,
          scopes: 'identify email',
        },
      });

      if (error) {
        console.error('Discord OAuth error:', error);
        setAuthState(prev => ({ ...prev, error: `OAuth error: ${error.message}` }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, error: AUTH_ERRORS.OAUTH_FAILED }));
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
    logout,
    clearError,
  };
};

export default useDiscordAuth;
