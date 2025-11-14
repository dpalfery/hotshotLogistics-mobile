import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';
import { userProfileService } from '../services/userProfileService';
import { UserProfile } from '../types/api';

/**
 * Authentication Context
 * Manages authentication state and user profile across the app
 */

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication from stored token
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const authenticated = await apiClient.isAuthenticated();
      setIsAuthenticated(authenticated);

      // If authenticated, load user profile
      if (authenticated) {
        await loadUserProfile();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user profile from API
   */
  const loadUserProfile = async () => {
    try {
      const response = await userProfileService.getProfile();

      if (response.ok && response.data) {
        setUser(response.data);
      } else {
        console.error('Failed to load user profile:', response.error);
        // If profile load fails, user might not have access
        setIsAuthenticated(false);
        setUser(null);
        await apiClient.clearToken();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  /**
   * Login with token
   */
  const login = async (newToken: string) => {
    try {
      setIsLoading(true);

      // Set token in API client
      await apiClient.setToken(newToken);
      setToken(newToken);
      setIsAuthenticated(true);

      // Load user profile
      await loadUserProfile();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout and clear authentication state
   */
  const logout = async () => {
    try {
      setIsLoading(true);

      // Clear token from API client
      await apiClient.clearToken();

      // Reset state
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user profile from API
   */
  const refreshProfile = async () => {
    if (!isAuthenticated) {
      return;
    }

    await loadUserProfile();
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
