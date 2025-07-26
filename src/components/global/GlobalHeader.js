// src/components/global/GlobalHeader.js - Clean header with theme-appropriate icons
import React, { useState } from 'react';
import QuickActions from './QuickActions';
import { personalThemes } from '../../styles/colors';
import './GlobalHeader.css';

const GlobalHeader = ({ 
  currentTheme = 'classic',
  onThemeChange,
  contextType = 'dashboard',
  onSettingsClick,
  className = ''
}) => {
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const getThemeGroups = () => {
    const standard = [];
    const seasonal = [];
    const holiday = [];
    
    Object.entries(personalThemes).forEach(([key, theme]) => {
      if (theme.holiday) {
        holiday.push({ key, theme });
      } else if (theme.seasonal) {
        seasonal.push({ key, theme });
      } else {
        standard.push({ key, theme });
      }
    });
    
    return { standard, seasonal, holiday };
  };

  const { standard, seasonal, holiday } = getThemeGroups();

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

      {/* Quick Actions Area - Grid Cell 2 */}
      <div className="grid-cell quick-actions-area">
        <QuickActions contextType={contextType} />
      </div>

      {/* Global Controls Area - Grid Cell 3 - Theme Only */}
      <div className="grid-cell global-controls-area">
        <div className="header-controls">
          {/* Theme Selector - Clean and prominent */}
          <div className="theme-section">
            <select 
              className="theme-selector" 
              value={currentTheme} 
              onChange={handleThemeChange}
              title="Choose your theme"
            >
              <optgroup label="Standard Themes">
                {standard.map(({ key, theme }) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </optgroup>
              
              {seasonal.length > 0 && (
                <optgroup label="Seasonal">
                  {seasonal.map(({ key, theme }) => (
                    <option key={key} value={key}>
                      {theme.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {holiday.length > 0 && (
                <optgroup label="Holiday">
                  {holiday.map(({ key, theme }) => (
                    <option key={key} value={key}>
                      {theme.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalHeader;