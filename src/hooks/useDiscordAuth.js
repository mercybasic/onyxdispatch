import { useState, useEffect } from 'react';
import { AUTH_ERRORS } from '../config/discord';
import { getDiscordOAuthUrl, mockDiscordAuth } from '../utils/helpers';

// Custom hook for Discord OAuth
export const useDiscordAuth = () => {
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

export default useDiscordAuth;
