import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import UpcomingTasks from '../components/UpcomingTasks';
import '../styles/Dashboard.css';

const DeveloperDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Always show tasks for now (for testing)
  const [hasTaskViewPermission] = useState<boolean>(true);

  // Navigation handlers
  const handleNavigateToTasks = () => {
    navigate('/dev/tasks');
  };

  const handleNavigateToProjects = () => {
    navigate('/projects');
  };

  const handleNavigateToTeam = () => {
    navigate('/team');
  };

  return (
    <Layout 
      pageTitle="Developer Dashboard" 
      userRole="developer"
      username={user?.name || 'Developer'}
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
                {/* My Tasks Card */}
                <div className="dashboard-card">
                  <h3>My Tasks</h3>
                  <p>You have no active tasks.</p>
                  <button className="view-button" onClick={handleNavigateToTasks}>View All Tasks</button>
                </div>
                
                {/* My Projects Card */}
                <div className="dashboard-card">
                  <h3>My Projects</h3>
                  <p>Projects you are assigned to.</p>
                  <button className="view-button" onClick={handleNavigateToProjects}>View Projects</button>
                </div>
                
                {/* My Team Card */}
                <div className="dashboard-card">
                  <h3>My Team</h3>
                  <p>View your team members.</p>
                  <button className="view-button" onClick={handleNavigateToTeam}>View Team</button>
                </div>
                
                {/* Recent Activity Card */}
                <div className="dashboard-card">
                  <h3>Recent Activity</h3>
                  <p>No recent activity to display.</p>
                </div>
              </div>
              
              {/* Upcoming Tasks Section with Heading */}
              {hasTaskViewPermission && (
                <div className="upcoming-tasks-section">
                  <h3 className="section-heading">Upcoming Deadlines</h3>
                  <UpcomingTasks />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperDashboard; 