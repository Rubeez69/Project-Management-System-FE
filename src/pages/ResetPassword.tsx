import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResetPassword } from '../hooks/useResetPassword';
import '../styles/ResetPassword.css';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Use the reset password hook
  const { resetPassword, isLoading, error } = useResetPassword();

  useEffect(() => {
    // Check if reset token exists
    const resetToken = sessionStorage.getItem('resetToken');
    console.log('Reset token in session storage:', resetToken ? 'Yes (length: ' + resetToken.length + ')' : 'No');
    
    if (!resetToken) {
      console.log('No reset token found, redirecting to forgot-password');
      navigate('/project_manager/forgot-password');
    } else {
      console.log('Reset token found, staying on reset-password page');
    }
  }, [navigate]);

  // Validate passwords
  useEffect(() => {
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
      } else if (password.length < 8) {
        setValidationError('Password must be at least 8 characters');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked');
    
    // Final validation before submission
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    
    // Use the hook to reset password
    console.log('Attempting to reset password');
    const success = await resetPassword(password);
    
    if (success) {
      console.log('Password reset successful, navigating to login page');
      // Navigate to login page after successful password reset
      navigate('/project_manager/login');
    } else {
      console.log('Password reset failed');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1 className="reset-password-title">New Password</h1>
        
        {error && <div className="error-message">{error}</div>}
        {validationError && <div className="validation-error">{validationError}</div>}
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">Enter new password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Atleast 8 characters, with numbers and special characters"
              className="password-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm new password:</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="password-input"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !!validationError}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 