import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

const RoleBasedRouter: React.FC<RoleBasedRouterProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if authenticated and user data is available
    if (!isLoading && isAuthenticated && user) {
      // Determine the correct dashboard based on user role
      let path = '/dashboard/developer'; // Default
      
      if (user.role === 'ADMIN') {
        path = '/dashboard/admin';
      } else if (user.role === 'PROJECT_MANAGER') {
        path = '/dashboard/project-manager';
      } else if (user.role === 'DEVELOPER') {
        path = '/dashboard/developer';
      }
      
      // Navigate immediately instead of setting state
      navigate(path, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // If not authenticated, show the children (login form)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If we're still here, show a loading indicator while redirecting
  return <div className="loading-container">Redirecting to dashboard...</div>;
};

export default RoleBasedRouter; 