import { useState } from 'react';
import authService from '../services/AuthService';

interface UsePasswordRecoveryReturn {
  sendRecoveryEmail: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const usePasswordRecovery = (): UsePasswordRecoveryReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRecoveryEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the sendOtp function from AuthService
      const response = await authService.sendOtp({ email});

      if (!response.ok) {
        // Try to extract error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      // Return true on success
      return true;
    } catch (err: any) {
      // Check if error has response data from our updated AuthService
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to send recovery email');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendRecoveryEmail,
    isLoading,
    error
  };
}; 