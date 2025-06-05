import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';
import '../styles/ForgotPassword.css';

const protocol = window.location.protocol;
const domain = window.location.hostname;
const baseUrl = `${protocol}//${domain}:8080/social`;

// Email validation function
const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "Email is required.";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }
  
  const domainPart = email.split("@")[1];
  if (!domainPart || !/\.[a-z]{2,}$/.test(domainPart)) {
    return "Invalid email domain.";
  }
  
  return null;
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Use the password recovery hook
  const { sendRecoveryEmail, isLoading, error } = usePasswordRecovery();

  // Validate email as user types
  useEffect(() => {
    if (email) {
      const emailValidationResult = validateEmail(email);
      setValidationError(emailValidationResult);
    } else {
      setValidationError(null);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    const emailValidationResult = validateEmail(email);
    if (emailValidationResult) {
      setValidationError(emailValidationResult);
      return;
    }
    
    // Use the hook to send recovery email
    const success = await sendRecoveryEmail(email);
    
    if (success) {
      // Store email in session storage for use in verify OTP page
      sessionStorage.setItem('recoveryEmail', email);
      // Navigate to OTP verification page
      navigate('/project_manager/verify-otp');
    }
  };

  return (
    <div className="password-recovery-container">
      <div className="password-recovery-card">
        <h1 className="password-recovery-title">Password Recovery</h1>
        
        {error && <div className="error-message">{error}</div>}
        {validationError && <div className="validation-error">{validationError}</div>}
        
        <div className="form-content">
          <div className="form-label">Enter your email address:</div>
          <input
            type="email"
            className="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abc@xyz.com"
          />
          
          <div className="back-link">
            <Link to="/project_manager/login">Back to log in</Link>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          className="send-button"
          disabled={isLoading || !!validationError}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword; 