import React from 'react';

const BottomNavigation: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <div className="nav-item nav-item-active">
        <div className="nav-icon nav-icon-home"></div>
        <div className="nav-label">Home</div>
      </div>
      <div className="nav-item">
        <div className="nav-icon nav-icon-tasks"></div>
        <div className="nav-label">Tasks</div>
      </div>
      <div className="nav-item">
        <div className="nav-icon nav-icon-analysis"></div>
        <div className="nav-label">Analysis</div>
      </div>
      <div className="nav-item">
        <div className="nav-icon nav-icon-settings"></div>
        <div className="nav-label">Settings</div>
      </div>
    </nav>
  );
};

export default BottomNavigation; 