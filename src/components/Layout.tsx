import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { AdminSidebar, ProjectManagerSidebar, DeveloperSidebar } from './sidebar';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  userRole?: 'admin' | 'project-manager' | 'developer';
  username?: string;
  avatarUrl?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  pageTitle = 'Dashboard', 
  userRole = 'developer',
  username,
  avatarUrl
}) => {
  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    switch (userRole) {
      case 'admin':
        return <AdminSidebar />;
      case 'project-manager':
        return <ProjectManagerSidebar />;
      case 'developer':
      default:
        return <DeveloperSidebar />;
    }
  };

  return (
    <div className="app-layout">
      {renderSidebar()}
      <div className="app-main">
        <Header pageTitle={pageTitle} username={username} avatarUrl={avatarUrl} />
        <div className="app-content">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout; 