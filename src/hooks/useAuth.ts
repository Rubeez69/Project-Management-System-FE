import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, {
  LoginCredentials,
  parseJwt,
  setAccessToken,
  setRefreshToken,
  setUser,
  clearAuthData,
  getAccessToken,
  getRefreshToken
} from '../services/AuthService';

interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface UseAuthReturn {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (module: string, action: 'view' | 'create' | 'update' | 'delete') => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUserState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Handle token refresh
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        return false;
      }

      // authService.refreshToken returns a boolean, not a Response object
      const success = await authService.refreshToken(refreshTokenValue);
      
      if (!success) {
        clearAuthData();
        return false;
      }
      
      // The token has been refreshed successfully in the authService.refreshToken method
      // We don't need to parse response or set access token as it's done in the service
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearAuthData();
      return false;
    }
  };

  // Check authentication status
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        // Try to refresh token if we have a refresh token
        const refreshed = await refreshToken();
        if (!refreshed) {
          setIsAuthenticated(false);
          setUserState(null);
          setIsLoading(false);
          return false;
        }
      }
      
      const userData = authService.getUser();
      setUserState(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function with token handling
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await authService.login(credentials);
      
      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        setIsLoading(false);
        return false;
      }
      
      const result = await response.json();
      console.log('Login API response:', result);
      
      // Handle the specific response format:
      // { code: 200, message: null, result: { accessToken, refreshToken } }
      if (result.result && result.result.accessToken) {
        // Clear any existing tokens first
        clearAuthData();
        
        // Set new tokens
        setAccessToken(result.result.accessToken);
        setRefreshToken(result.result.refreshToken);
        
        // Extract user info from JWT token
        const userInfo = parseJwt(result.result.accessToken);
        
        // Create a user object from token claims
        const user = {
          id: userInfo.id || userInfo.sub,
          name: userInfo.name || userInfo.email.split('@')[0],
          email: userInfo.email,
          role: userInfo.role,
          permissions: userInfo.permissions || []
        };
        
        console.log('Created user object with permissions:', user);
        
        // Store user data
        setUser(user);
        
        // Update state after successful login
        setUserState(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        console.error('Unexpected response format:', result);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    setUserState(null);
    setIsAuthenticated(false);
    navigate('/project_manager/login');
  }, [navigate]);

  // Check if user has a specific permission
  const hasPermission = (module: string, action: 'view' | 'create' | 'update' | 'delete'): boolean => {
    if (!user || !user.permissions) {
      console.log('No user or permissions found');
      return false;
    }
    
    // Log the permissions to help with debugging
    console.log('Checking permission for module:', module, 'action:', action);
    console.log('Available permissions:', user.permissions);
    
    // Make the check case insensitive
    const normalizedModule = module.toUpperCase();
    
    try {
      // Try to find the permission with case-insensitive check
      const permission = user.permissions.find(
        (p: any) => (typeof p.module === 'string' && p.module.toUpperCase() === normalizedModule)
      );
      
      console.log('Found permission:', permission);
      
      if (!permission) return false;
      
      // Check the specific action permission
      const actionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
      console.log('Checking action key:', actionKey, 'value:', permission[actionKey]);
      
      return permission[actionKey] === true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    refreshToken,
    hasPermission
  };
}; 