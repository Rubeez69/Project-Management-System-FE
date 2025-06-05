import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Layout 
      pageTitle="Admin Dashboard" 
      userRole="admin"
      username={user?.name || user?.email || 'Admin'}
    >
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Welcome, {user?.name || user?.email || 'Admin'}!</h2>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>System Overview</h3>
            <p>Welcome to the admin dashboard. You have full access to the system.</p>
          </div>
          
          <div className="dashboard-card">
            <h3>User Management</h3>
            <p>Manage users and their roles.</p>
            <button className="primary-button">Manage Users</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Project Overview</h3>
            <p>View all projects in the system.</p>
            <button className="primary-button">View Projects</button>
          </div>
          
          <div className="dashboard-card">
            <h3>System Logs</h3>
            <p>Review system activity and logs.</p>
            <button className="primary-button">View Logs</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard; 