import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerifyOTP } from '../hooks/useVerifyOTP';
import '../styles/VerifyOTP.css';

const protocol = window.location.protocol;
const domain = window.location.hostname;
const baseUrl = `${protocol}//${domain}:8080/social`;

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
  const navigate = useNavigate();
  
  // Get email from session storage
  const email = sessionStorage.getItem('recoveryEmail') || '';
  
  // Use the verify OTP hook
  const { verifyOTP, resendOTP, isLoading, error } = useVerifyOTP();

  useEffect(() => {
    // Redirect to forgot password if no email is found
    if (!email) {
      console.log('No email found in session storage, redirecting to forgot-password');
      navigate('/project_manager/forgot-password');
    } else {
      console.log('Email found in session storage:', email);
    }
  }, [email, navigate]);

  useEffect(() => {
    // Start the countdown timer
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verify button clicked');
    
    try {
      // Use the hook to verify OTP
      const result = await verifyOTP(otp, email);
      console.log('Verification result:', result);
      
      if (result.success) {
        console.log('OTP verification successful, navigating to reset-password page');
        
        // Use direct window location change as a fallback
        setTimeout(() => {
          console.log('Using window.location for navigation');
          window.location.href = '/project_manager/reset-password';
        }, 100);
        
        // Also try the regular navigation
        navigate('/project_manager/reset-password', { replace: true });
      } else {
        console.log('OTP verification failed');
      }
    } catch (err) {
      console.error('Error in handleVerify:', err);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    // Use the hook to resend OTP
    const success = await resendOTP(email);
    
    if (success) {
      // Reset timer
      setTimeLeft(60);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <h1 className="verify-otp-title">Verify Email</h1>
        
        <p className="verify-otp-message">
          We have sent an OTP code to your email. Please check your email inbox
        </p>
        
        <div className="otp-form">
          <div className="form-group">
            <label htmlFor="otp-input">Code (*)</label>
            <input
              type="text"
              id="otp-input"
              className="otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="XXXXXX"
              maxLength={6}
            />
          </div>
          
          <div className="resend-container">
            <button 
              className="resend-button" 
              onClick={handleResend}
              disabled={timeLeft > 0 || isLoading}
            >
              Resend
            </button>
            <span className="timer">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="verify-button"
          onClick={handleVerify}
          disabled={isLoading || otp.length < 6}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP; 