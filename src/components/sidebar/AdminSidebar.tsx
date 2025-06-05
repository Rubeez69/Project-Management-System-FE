import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Sidebar.css';

const AdminSidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
        <h3>Admin</h3>
      </div>
      <div className="sidebar-menu">
        <Link to="/admin/dashboard" className="sidebar-item">
          <i className="sidebar-icon home-icon"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/roles" className="sidebar-item">
          <i className="sidebar-icon roles-icon"></i>
          <span>Manage Roles</span>
        </Link>
        <Link to="/admin/users" className="sidebar-item">
          <i className="sidebar-icon users-icon"></i>
          <span>Manage Users</span>
        </Link>
        <Link to="/admin/projects" className="sidebar-item">
          <i className="sidebar-icon projects-icon"></i>
          <span>Manage Projects</span>
        </Link>
        <Link to="/admin/tasks" className="sidebar-item">
          <i className="sidebar-icon tasks-icon"></i>
          <span>Task Management</span>
        </Link>
        <Link to="/admin/reports" className="sidebar-item">
          <i className="sidebar-icon reports-icon"></i>
          <span>Reports/Logs</span>
        </Link>
      </div>
      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-item">
          <i className="sidebar-icon profile-icon"></i>
          <span>Profile</span>
        </Link>
        <Link to="/settings" className="sidebar-item">
          <i className="sidebar-icon settings-icon"></i>
          <span>Setting</span>
        </Link>
        <Link to="/logout" className="sidebar-item logout">
          <i className="sidebar-icon logout-icon"></i>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar; 