// src/components/global/GlobalHeader.js - Clean header with theme persistence
import React from 'react';
import QuickActions from './QuickActions';
import { personalThemes } from '../../styles/colors';
import { supabase } from '../../lib/supabase';
import './GlobalHeader.css';

const GlobalHeader = ({ 
  currentTheme = 'classic',
  onThemeChange,
  contextType = 'dashboard',
  onSettingsClick,
  className = ''
}) => {
  const handleThemeChange = async (e) => {
    const newTheme = e.target.value;

    // Update local state immediately for responsive UI
    if (onThemeChange) {
      onThemeChange(newTheme);
    }

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('family_members')
          .update({ theme_preference: newTheme })
          .eq('auth_user_id', user.id);

        if (error) {
          console.error('Error saving theme preference:', error);
        }
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const getThemeGroups = () => {
    const general = [];    // Standard adult/professional themes
    const seasonal = [];   // Seasonal and holiday themes combined
    const fun = [];        // Child-friendly themes

    Object.entries(personalThemes).forEach(([key, theme]) => {
      // Prioritize seasonal/holiday categorization over childFriendly
      // This way seasonal themes can be child-friendly but still show in Seasonal category
      if (theme.seasonal || theme.holiday) {
        seasonal.push({ key, theme });
      } else if (theme.childFriendly) {
        fun.push({ key, theme });
      } else {
        general.push({ key, theme });
      }
    });

    return { general, seasonal, fun };
  };

  const { general, seasonal, fun } = getThemeGroups();

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
              <optgroup label="General">
                {general.map(({ key, theme }) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Seasonal">
                {seasonal.map(({ key, theme }) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Fun">
                {fun.map(({ key, theme }) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalHeader;