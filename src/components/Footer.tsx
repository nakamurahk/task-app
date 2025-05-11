import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type TabType = 'home' | 'tasks' | 'analysis' | 'settings';

interface FooterProps {
  activeTab?: TabType;
}

const Footer: React.FC<FooterProps> = ({ activeTab = 'home' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/' },
    { id: 'tasks', icon: '📋', label: 'Tasks', path: '/tasks' },
    { id: 'analysis', icon: '📊', label: 'Analysis', path: '/analyze' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' }
  ] as const;

  return (
    <footer className="footer">
      <nav className="bottom-nav">
        {navItems.map(({ id, icon, label, path }) => (
          <Link
            key={id}
            to={path}
            className={`nav-item ${currentPath === path ? 'nav-item-active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer; 