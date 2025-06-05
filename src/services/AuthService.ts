import { Endpoint } from "../utils/endPoint";

// Use current domain for localStorage (not the API domain)
const protocol = window.location.protocol;
const domain = window.location.hostname;
const baseUrl = `${protocol}//${domain}:8080`;

console.log('AuthService initialized with baseUrl:', baseUrl);
console.log('Current origin:', window.location.origin);

// Token storage keys
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";

// Get tokens from localStorage
export const getAccessToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  console.log('Getting access token:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

export const getRefreshToken = () => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  console.log('Getting refresh token:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

// Set tokens in localStorage
export const setAccessToken = (token: string) => {
  console.log('Setting access token:', token.substring(0, 20) + '...');
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = (token: string) => {
  console.log('Setting refresh token:', token.substring(0, 20) + '...');
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const setUser = (user: any) => {
  console.log('Setting user data:', user);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data
export const clearAuthData = () => {
  console.log('Clearing auth data from localStorage');
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Function to refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<{ success: boolean, accessToken?: string }> => {
  try {
    const response = await fetch(`${baseUrl}/${Endpoint.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.result && data.result.accessToken) {
        // Store the new access token
        setAccessToken(data.result.accessToken);
        console.log('Access token refreshed successfully');
        return { success: true, accessToken: data.result.accessToken };
      }
    }
    
    // If we reach here, refresh failed
    console.error('Failed to refresh token');
    return { success: false };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false };
  }
};

// Parse JWT token to extract user information
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const parsedToken = JSON.parse(jsonPayload);
    console.log('Parsed JWT token:', parsedToken);
    
    return parsedToken;
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return {};
  }
};

// Create authenticated fetch that handles token refresh
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Get the current access token
  let accessToken = getAccessToken();
  
  if (!accessToken) {
    // Check if we have a refresh token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Try to get a new access token using the refresh token
      const result = await refreshAccessToken(refreshToken);
      
      if (result.success && result.accessToken) {
        accessToken = result.accessToken;
      } else {
        // If refresh token is invalid or expired, clear auth data
        clearAuthData();
        throw new Error("Authentication required");
      }
    } else {
      throw new Error("Authentication required");
    }
  }
  
  // Set up headers with access token
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${accessToken}`,
  };
  
  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If we get a 401 Unauthorized, the token might be expired
  if (response.status === 401) {
    // Try to refresh the token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Try to refresh the access token
      const result = await refreshAccessToken(refreshToken);
      
      if (result.success && result.accessToken) {
        accessToken = result.accessToken;
        
        // Retry the original request with the new token
        const retryHeaders = {
          ...options.headers,
          "Authorization": `Bearer ${accessToken}`,
        };
        
        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } else {
        // If refresh token is invalid or expired, clear auth data
        clearAuthData();
        throw new Error("Authentication required");
      }
    } else {
      clearAuthData();
      throw new Error("Authentication required");
    }
  }
  
  // Check for error response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData && errorData.message) {
      const error = new Error(errorData.message);
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }
  }
  
  return response;
};

export const postRequest = async (endpoint: string, data: any, useAuth = false, authToken?: string) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (useAuth) {
      const token = getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    
    // If specific auth token is provided, use it
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
      console.log('Using provided token for authorization');
    }

    console.log(`Making POST request to: ${baseUrl}/${endpoint}`);
    console.log('Request data:', data);
    
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers,
      mode: "cors",
      credentials: "include", // Use include to support cookies if needed
      body: JSON.stringify(data),
    });

    // Check for error response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData && errorData.message) {
        const error = new Error(errorData.message);
        (error as any).response = { data: errorData, status: response.status };
        throw error;
      }
    }

    return response;
  } catch (error) {
    console.error(`Error in POST ${endpoint}:`, error);
    throw error;
  }
};

export const getRequest = async (endpoint: string, useAuth = false) => {
  if (useAuth) {
    return authenticatedFetch(`${baseUrl}/${endpoint}`);
  }
  
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "GET",
      headers,
      mode: "cors",
      credentials: "include", // Use include to support cookies if needed
    });

    // Check for error response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData && errorData.message) {
        const error = new Error(errorData.message);
        (error as any).response = { data: errorData, status: response.status };
        throw error;
      }
    }

    return response;
  } catch (error) {
    console.error(`Error in GET ${endpoint}:`, error);
    throw error;
  }
};

// Define types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

const authService = {
  // Auth API endpoints
  login: (credentials: LoginCredentials) => postRequest(Endpoint.LOGIN, credentials),
  refreshToken: async (token: string) => {
    try {
      const result = await refreshAccessToken(token);
      if (!result.success) {
        throw new Error("Failed to refresh token");
      }
      return true;
    } catch (error) {
      console.error('Error in refreshToken method:', error);
      throw error;
    }
  },
  resetPassword: (data: { token: string, newPassword: string }) => {
    // Just send the token and newPassword in the request body
    console.log('Reset password with token and newPassword in body only');
    return postRequest(Endpoint.RESET_PASSWORD, data);
  },
  verifyOtp: (data: any) => postRequest(Endpoint.VERIFY_OTP, data),
  sendOtp: (data: any) => postRequest(Endpoint.SEND_OTP, data), 
  
  // Logout method to clear auth data and optionally notify backend
  logout: async () => {
    try {
      // Optional: Notify backend about logout (if your API supports this)
      // await postRequest(Endpoint.LOGOUT, {}, true);
      
      // Clear all authentication data from localStorage
      clearAuthData();
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local data even if API call fails
      clearAuthData();
      return false;
    }
  },
  
  // Helper methods that don't involve token handling logic
  isAuthenticated: () => {
    const token = getAccessToken();
    if (!token) {
      // Check if we have a refresh token to get a new access token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        // We have a refresh token, but we'll return false here
        // The authenticatedFetch will handle the refresh when needed
        return false;
      }
      return false;
    }
    
    try {
      // Check if token is expired
      const decoded = parseJwt(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp && decoded.exp < currentTime) {
        // Token is expired, but we might have a refresh token
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token, clear auth data
          clearAuthData();
          return false;
        }
        
        // We have a refresh token, but we'll return false here
        // The authenticatedFetch will handle the refresh when needed
        return false;
      }
      
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  },
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  // Utility functions
  getBaseUrl: () => baseUrl,
  getAuthenticatedFetch: () => authenticatedFetch,
};

export default authService; 