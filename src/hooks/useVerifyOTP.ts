import { useState } from 'react';
import authService from '../services/AuthService';

interface UseVerifyOTPReturn {
  verifyOTP: (otp: string, email: string) => Promise<{ success: boolean; token?: string }>;
  resendOTP: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useVerifyOTP = (): UseVerifyOTPReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOTP = async (otp: string, email: string): Promise<{ success: boolean; token?: string }> => {
    setIsLoading(true);
    setError(null);
    console.log('Verifying OTP for email:', email, 'OTP:', otp);

    try {
      // Use the verifyOtp function from AuthService
      const response = await authService.verifyOtp({ email, otp });
      console.log('Verify OTP response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      // Get the response text first
      const responseText = await response.text();
      console.log('Response as text:', responseText);
      
      let token = '';
      
      // Try to parse as JSON if it's not empty
      if (responseText && responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
          
          // Check for successful response code
          if (data.code === 200) {
            // Extract token from the result field as shown in the response
            if (data.result) {
              token = data.result;
              console.log('Token extracted from result field:', token ? 'Yes (length: ' + token.length + ')' : 'No');
            }
          }
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
        }
      }

      // Store the token in localStorage
      if (token) {
        localStorage.setItem('resetToken', token);
        console.log('Token stored in localStorage:', token.substring(0, 10) + '...');
        return { success: true, token };
      } else {
        console.error('No token found in response');
        setError('No token received from server. Please try again.');
        return { success: false };
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Failed to verify OTP');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    console.log('Resending OTP for email:', email);

    try {
      // Reuse the sendOtp function from AuthService to resend OTP
      const response = await authService.sendOtp({ email });
      console.log('Resend OTP response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      console.log('OTP resent successfully');
      return true;
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyOTP,
    resendOTP,
    isLoading,
    error
  };
}; 