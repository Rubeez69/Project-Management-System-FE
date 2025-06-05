import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import RecentActivities from '../components/RecentActivities';
import '../styles/Dashboard.css';

const ProjectManagerDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has permission to view task history
  const hasTaskHistoryViewPermission = hasPermission('TASK_HISTORY', 'view');

  // Navigation handlers
  const handleNavigateToTeam = () => {
    navigate('/team-management');
  };

  const handleNavigateToProjects = () => {
    navigate('/project-management');
  };

  const handleNavigateToTasks = () => {
    navigate('/task-management');
  };

  return (
    <Layout 
      pageTitle="Project Manager Dashboard" 
      userRole="project-manager"
      username={user?.name || 'Project Manager'}
    >
      <div className="dashboard-container">
        <div className="dashboard-window">
          {/* Window Header */}
          <div className="window-header">
            <div className="tab-container">
              <div className="window-tab active">
                <i className="tab-icon home-icon"></i>
                Home
              </div>
            </div>
          </div>
          
          {/* Window Content */}
          <div className="window-content">
            <div className="dashboard-content">
              <div className="dashboard-cards-container">
                {/* My Projects Card */}
                <div className="dashboard-card">
                  <h3>My Projects</h3>
                  <p>Manage your projects.</p>
                  <button className="view-button" onClick={handleNavigateToProjects}>Manage Projects</button>
                </div>
                
                {/* Team Members Card */}
                <div className="dashboard-card">
                  <h3>Team Members</h3>
                  <p>Manage your project team members.</p>
                  <button className="view-button" onClick={handleNavigateToTeam}>Manage Team</button>
                </div>
                
                {/* Task Overview Card */}
                <div className="dashboard-card">
                  <h3>Task Overview</h3>
                  <p>View and manage tasks across all projects.</p>
                  <button className="view-button" onClick={handleNavigateToTasks}>Manage Tasks</button>
                </div>
              </div>
              
              {/* Recent Activities Section */}
              {hasTaskHistoryViewPermission && (
                <div className="recent-activities-section">
                  <RecentActivities />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectManagerDashboard; 