import React from 'react';
import '../styles/Header.css';

interface HeaderProps {
  pageTitle?: string;
  username?: string;
  avatarUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  pageTitle = 'My Projects', 
  username = 'Dio Brando',
  avatarUrl
}) => {
  return (
    <header className="app-header">
      <div className="header-title">
        {pageTitle}
      </div>
      <div className="header-user">
        <span className="header-welcome">Welcome, <span className="header-username">{username}</span></span>
        <div className="user-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${username}'s avatar`} />
          ) : (
            <div className="avatar-icon"></div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 