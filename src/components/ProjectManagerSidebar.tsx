import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaProjectDiagram, FaUsers, FaTasks } from 'react-icons/fa';
import '../styles/Sidebar.css';

const ProjectManagerSidebar: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Project Manager</h3>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive('/dashboard')}>
          <Link to="/dashboard">
            {FaTachometerAlt({ className: "sidebar-icon" })}
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/project-management')}>
          <Link to="/project-management">
            {FaProjectDiagram({ className: "sidebar-icon" })}
            <span>Projects</span>
          </Link>
        </li>
        <li className={isActive('/team-management')}>
          <Link to="/team-management">
            {FaUsers({ className: "sidebar-icon" })}
            <span>Team Management</span>
          </Link>
        </li>
        <li className={isActive('/task-management')}>
          <Link to="/task-management">
            {FaTasks({ className: "sidebar-icon" })}
            <span>Task Management</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ProjectManagerSidebar; 