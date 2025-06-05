import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Sidebar.css';

const ProjectManagerSidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
        <h3>Project Manager</h3>
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard/project-manager" className="sidebar-item">
          <i className="sidebar-icon home-icon"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/project-management" className="sidebar-item">
          <i className="sidebar-icon projects-icon"></i>
          <span>Project Management</span>
        </Link>
        <Link to="/team-management" className="sidebar-item">
          <i className="sidebar-icon team-icon"></i>
          <span>Team Management</span>
        </Link>
        <Link to="/task-management" className="sidebar-item">
          <i className="sidebar-icon tasks-icon"></i>
          <span>Task Management</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-item">
          <i className="sidebar-icon profile-icon"></i>
          <span>Profile</span>
        </Link>
        <Link to="/logout" className="sidebar-item logout">
          <i className="sidebar-icon logout-icon"></i>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default ProjectManagerSidebar; 