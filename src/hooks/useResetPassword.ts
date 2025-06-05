import { useState } from 'react';
import authService from '../services/AuthService';

interface UseResetPasswordReturn {
  resetPassword: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    console.log('Attempting to reset password');

    try {
      // Get the reset token from localStorage or sessionStorage
      let token = localStorage.getItem('resetToken');
      
      // If not found in localStorage, try sessionStorage
      if (!token) {
        token = sessionStorage.getItem('resetToken');
        console.log('Reset token from sessionStorage:', token ? 'Found (length: ' + token.length + ')' : 'Not found');
      } else {
        console.log('Reset token from localStorage:', 'Found (length: ' + token.length + ')');
      }
      
      if (!token) {
        throw new Error('Reset token not found. Please restart the password recovery process.');
      }

      // Send the request with token and newPassword in the body
      console.log('Sending reset password request with token and newPassword');
      const response = await authService.resetPassword({
        token,
        newPassword
      });

      console.log('Reset password response status:', response.status);
      
      // Check for various success status codes
      if (response.ok || response.status === 200 || response.status === 201 || response.status === 204) {
        // Clear the reset token from both storages
        localStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetToken');
        console.log('Reset token cleared from storage');
        return true;
      }
      
      // Try to parse error response
      try {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || errorData.error || `Error: ${response.status}`);
      } catch (parseError) {
        // If we can't parse the JSON, just use the status text
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      // Check if error has response data from our updated AuthService
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to reset password');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
    error
  };
}; 