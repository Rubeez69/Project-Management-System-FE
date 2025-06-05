import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyOTP from '../pages/VerifyOTP';
import ResetPassword from '../pages/ResetPassword';
import AdminDashboard from '../pages/AdminDashboard';
import ProjectManagerDashboard from '../pages/ProjectManagerDashboard';
import DeveloperDashboard from '../pages/DeveloperDashboard';
import MyProjects from '../pages/MyProjects';
import MyTasks from '../pages/MyTasks';
import MyTeam from '../pages/MyTeam';
import ProjectManagement from '../pages/ProjectManagement';
import ProjectDetail from '../pages/ProjectDetail';
import MemberTasks from '../pages/MemberTasks';
import TeamManagement from '../pages/TeamManagement';
import TaskManagement from '../pages/TaskManagement';
import authService from '../services/AuthService';

// Logout component that handles the logout process
const Logout: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout method from authService
        await authService.logout();
        // Redirect to login page
        navigate('/project_manager/login', { replace: true });
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to login page even if there's an error
        navigate('/project_manager/login', { replace: true });
      }
    };
    
    performLogout();
  }, [navigate]);
  
  // Show a loading message while logging out
  return <div className="loading-container">Logging out...</div>;
};

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        // Get user data including role
        const userData = authService.getUser();
        if (userData) {
          setUserRole(userData.role);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuth) {
    return <Navigate to="/project_manager/login" replace />;
  }
  
  // If roles are specified and user's role is not in the allowed list
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on role
    if (userRole === 'ADMIN') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (userRole === 'PROJECT_MANAGER') {
      return <Navigate to="/dashboard/project-manager" replace />;
    } else {
      return <Navigate to="/dashboard/developer" replace />;
    }
  }
  
  return <>{element}</>;
};

// Public route that redirects authenticated users
interface PublicRouteProps {
  element: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        // Get user data including role
        const userData = authService.getUser();
        if (userData) {
          setUserRole(userData.role);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!isAuth) {
    return <>{element}</>;
  }
  
  // Redirect to the appropriate dashboard based on role
  if (userRole === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  } else if (userRole === 'PROJECT_MANAGER') {
    return <Navigate to="/dashboard/project-manager" replace />;
  } else if (userRole === 'DEVELOPER') {
    return <Navigate to="/dashboard/developer" replace />;
  } else {
    // Default fallback if role is unknown
    return <Navigate to="/project_manager/login" replace />;
  }
};

// NotFound placeholder component
const NotFound: React.FC = () => {
  return <div>404 - Page Not Found</div>;
};

// Main routes component
const AppRoutes: React.FC = () => {
  // Always redirect to login page on initial load
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/project_manager/login" 
          element={<PublicRoute element={<Login />} />} 
        />
      
        <Route 
          path="/project_manager/forgot-password" 
          element={<PublicRoute element={<ForgotPassword />} />} 
        />

        <Route 
          path="/project_manager/verify-otp" 
          element={<PublicRoute element={<VerifyOTP />} />} 
        />

        <Route 
          path="/project_manager/reset-password" 
          element={<PublicRoute element={<ResetPassword />} />} 
        />
        
        {/* Logout route */}
        <Route 
          path="/logout" 
          element={<Logout />} 
        />
        
        {/* Role-based dashboard routes */}
        <Route 
          path="/dashboard/admin" 
          element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['ADMIN']} />} 
        />
        
        <Route 
          path="/dashboard/project-manager" 
          element={<ProtectedRoute element={<ProjectManagerDashboard />} allowedRoles={['PROJECT_MANAGER']} />} 
        />
        
        <Route 
          path="/dashboard/developer" 
          element={<ProtectedRoute element={<DeveloperDashboard />} allowedRoles={['DEVELOPER']} />} 
        />
        
        {/* Project routes */}
        <Route 
          path="/projects" 
          element={<ProtectedRoute element={<MyProjects />} allowedRoles={['DEVELOPER']} />} 
        />
        
        <Route 
          path="/project-management" 
          element={<ProtectedRoute element={<ProjectManagement />} allowedRoles={['PROJECT_MANAGER']} />} 
        />
        
        {/* Tasks routes */}
        <Route 
          path="/dev/tasks" 
          element={<ProtectedRoute element={<MyTasks />} allowedRoles={['DEVELOPER']} />} 
        />
        
        <Route 
          path="/task-management" 
          element={<ProtectedRoute element={<TaskManagement />} allowedRoles={['PROJECT_MANAGER']} />} 
        />
        
        {/* Team routes */}
        <Route 
          path="/team" 
          element={<ProtectedRoute element={<MyTeam />} allowedRoles={['DEVELOPER', 'PROJECT_MANAGER']} />} 
        />
        
        <Route 
          path="/team-management" 
          element={<ProtectedRoute element={<TeamManagement />} allowedRoles={['PROJECT_MANAGER']} />} 
        />
        
        {/* ProjectDetail route */}
        <Route 
          path="/project-detail/:projectId" 
          element={<ProtectedRoute element={<ProjectDetail />} allowedRoles={['DEVELOPER', 'PROJECT_MANAGER']} />} 
        />
        
        {/* MemberTasks route */}
        <Route 
          path="/project/:projectId/member/:userId/tasks/:memberName?" 
          element={<ProtectedRoute element={<MemberTasks />} allowedRoles={['PROJECT_MANAGER']} />} 
        />
        
        {/* Redirect root to login page */}
        <Route 
          path="/" 
          element={<Navigate to="/project_manager/login" replace />} 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;