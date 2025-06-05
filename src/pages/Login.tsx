import React, { useState, useEffect } from 'react';
import '../styles/Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validation';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Validate form as user types
  useEffect(() => {
    if (email || password) {
      const validationResult = validateLoginForm({ email, password });
      setValidationError(validationResult);
    } else {
      setValidationError(null);
    }
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    const validationResult = validateLoginForm({ email, password });
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      console.log('Login attempt with:', { email });
      const success = await login({ email, password });
      
      if (success) {
        console.log('Login successful, redirecting to appropriate dashboard');
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          
          // Direct navigation based on user role
          if (user.role === 'ADMIN') {
            navigate('/dashboard/admin', { replace: true });
          } else if (user.role === 'PROJECT_MANAGER') {
            navigate('/dashboard/project-manager', { replace: true });
          } else if (user.role === 'DEVELOPER') {
            navigate('/dashboard/developer', { replace: true });
          } else {
            // Default fallback
            navigate('/project_manager/dashboard', { replace: true });
          }
        } else {
          // If user data is not available, use default dashboard
          navigate('/project_manager/dashboard', { replace: true });
        }
      } else {
        setError('Login failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="login-container">
        <div className="loading-container">
          Signing in, please wait...
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Sign in to your account</h1>
        
        {error && <div className="error-message">{error}</div>}
        {validationError && <div className="validation-error">{validationError}</div>}
        
        <form onSubmit={handleLogin} style={{ textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">(*)</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="abc@xyz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">(*)</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="forgot-password">
            <Link to="/project_manager/forgot-password">Forgot your password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || authLoading || !!validationError}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        <div className="register-prompt">
          Don't have an account yet? <Link to="/project_manager/register">Register now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 