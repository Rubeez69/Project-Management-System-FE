import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Sidebar.css';

const DeveloperSidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
        <h3>Developer</h3>
      </div>
      <div className="sidebar-menu">
        <Link to="/dashboard/developer" className="sidebar-item">
          <i className="sidebar-icon home-icon"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/projects" className="sidebar-item">
          <i className="sidebar-icon projects-icon"></i>
          <span>My Projects</span>
        </Link>
        <Link to="/dev/tasks" className="sidebar-item">
          <i className="sidebar-icon tasks-icon"></i>
          <span>My Tasks (Kanban)</span>
        </Link>
        <Link to="/team" className="sidebar-item">
          <i className="sidebar-icon team-icon"></i>
          <span>My Team</span>
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

export default DeveloperSidebar; 