// src/components/global/GlobalHeader.js - Clean header with QuickActions spanning full width
import React from 'react';
import QuickActions from './QuickActions';
import './GlobalHeader.css';

const GlobalHeader = ({
  contextType = 'dashboard'
}) => {

  return (
    <>
      {/* Logo Area - Grid Cell 1 */}
      <div className="grid-cell logo-area">
        <img
          src="/aimfm-logo.png"
          alt="AIMfM"
          className="app-logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Quick Actions Area - Grid Cell 2 - Now spans full width */}
      <div className="grid-cell quick-actions-area">
        <QuickActions contextType={contextType} />
      </div>
    </>
  );
};

export default GlobalHeader;