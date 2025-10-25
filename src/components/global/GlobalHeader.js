// src/components/global/GlobalHeader.js - Clean header with theme selector on desktop
import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import QuickActions from './QuickActions';
import { personalThemes } from '../../styles/colors';
import { supabase } from '../../lib/supabase';
import './GlobalHeader.css';

const GlobalHeader = ({
  contextType = 'dashboard'
}) => {
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  // Load user's theme preference on mount
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('family_members')
          .select('theme_preference')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.log('No theme preference found, using default');
          return;
        }

        if (data?.theme_preference) {
          setCurrentTheme(data.theme_preference);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadUserTheme();
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    const theme = personalThemes[currentTheme] || personalThemes.classic;
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--gradient-background', `linear-gradient(135deg, ${theme.background}, ${theme.accent}20)`);
    root.style.setProperty('--theme-header-gradient', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--scrollbar-thumb', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--scrollbar-thumb-hover', `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`);
  }, [currentTheme]);

  const handleThemeChange = async (newTheme) => {
    setCurrentTheme(newTheme);
    setShowMobileDropdown(false);

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
    const general = [];
    const seasonal = [];
    const fun = [];

    Object.entries(personalThemes).forEach(([key, theme]) => {
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

      {/* Global Controls Area - Grid Cell 3 - Desktop Theme Selector */}
      <div className="grid-cell global-controls-area">
        <div className="header-controls">
          <div className="theme-section">
            {/* Desktop Theme Selector - Hidden on mobile */}
            <select
              className="theme-selector desktop-only"
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <optgroup label="General Themes">
                {Object.entries(personalThemes)
                  .filter(([_, theme]) => !theme.seasonal && !theme.holiday && !theme.childFriendly)
                  .map(([key, theme]) => (
                    <option key={key} value={key}>{theme.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Seasonal Themes">
                {Object.entries(personalThemes)
                  .filter(([_, theme]) => theme.seasonal || theme.holiday)
                  .map(([key, theme]) => (
                    <option key={key} value={key}>{theme.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Fun Themes">
                {Object.entries(personalThemes)
                  .filter(([_, theme]) => theme.childFriendly)
                  .map(([key, theme]) => (
                    <option key={key} value={key}>{theme.name}</option>
                  ))}
              </optgroup>
            </select>

            {/* Mobile Theme Button - Hidden on desktop */}
            <button
              className="theme-palette-button"
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
              aria-label="Change theme"
            >
              <Palette size={20} />
            </button>

            {/* Mobile Theme Dropdown */}
            {showMobileDropdown && (
              <div className="theme-dropdown-mobile">
                {(() => {
                  const { general, seasonal, fun } = getThemeGroups();
                  return (
                    <>
                      <div className="theme-dropdown-section">
                        <div className="theme-dropdown-label">General</div>
                        {general.map(({ key, theme }) => (
                          <button
                            key={key}
                            className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                            onClick={() => handleThemeChange(key)}
                          >
                            {theme.name}
                          </button>
                        ))}
                      </div>

                      <div className="theme-dropdown-section">
                        <div className="theme-dropdown-label">Seasonal</div>
                        {seasonal.map(({ key, theme }) => (
                          <button
                            key={key}
                            className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                            onClick={() => handleThemeChange(key)}
                          >
                            {theme.name}
                          </button>
                        ))}
                      </div>

                      <div className="theme-dropdown-section">
                        <div className="theme-dropdown-label">Fun</div>
                        {fun.map(({ key, theme }) => (
                          <button
                            key={key}
                            className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                            onClick={() => handleThemeChange(key)}
                          >
                            {theme.name}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalHeader;