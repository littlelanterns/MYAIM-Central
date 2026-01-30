// src/components/global/GlobalHeader.js - Clean header with theme selector and user menu
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Palette, User, Settings, Users, LogOut, ChevronDown } from 'lucide-react';
import QuickActions from './QuickActions';
import { personalThemes } from '../../styles/colors';
import { supabase } from '../../lib/supabase';
import './GlobalHeader.css';

const GlobalHeader = ({
  contextType = 'dashboard'
}) => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button and the portal dropdown
      const isOutsideButton = userButtonRef.current && !userButtonRef.current.contains(event.target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);

      if (isOutsideButton && (isOutsideDropdown || !dropdownRef.current)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when menu opens
  useEffect(() => {
    if (showUserMenu && userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [showUserMenu]);

  // Load user's theme preference and name on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('family_members')
          .select('name, display_title, theme_preference')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.log('No user data found, using defaults');
          return;
        }

        if (data?.theme_preference) {
          setCurrentTheme(data.theme_preference);
        }

        // Set user name and initials
        const displayName = data?.display_title || data?.name || 'User';
        setUserName(displayName);

        // Generate initials (up to 2 characters)
        const initials = displayName
          .split(' ')
          .map(word => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        setUserInitials(initials || 'U');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('aimfm_session');
      localStorage.removeItem('last_login_type');
      localStorage.removeItem('remember_me');

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect even if there's an error
      navigate('/login');
    }
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

          {/* User Menu */}
          <div className="user-menu-section">
            <button
              ref={userButtonRef}
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {userInitials || <User size={16} />}
              </div>
              <ChevronDown size={14} className={`chevron ${showUserMenu ? 'open' : ''}`} />
            </button>

            {/* Portal dropdown - renders at document body level */}
            {showUserMenu && createPortal(
              <div
                ref={dropdownRef}
                className="user-menu-dropdown-portal"
                style={{
                  position: 'fixed',
                  top: dropdownPosition.top,
                  right: dropdownPosition.right,
                  zIndex: 99999
                }}
              >
                <div className="user-menu-header">
                  <div className="user-menu-avatar">{userInitials || <User size={20} />}</div>
                  <div className="user-menu-name">{userName || 'User'}</div>
                </div>

                <div className="user-menu-divider" />

                <button
                  className="user-menu-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/family-settings');
                  }}
                >
                  <Users size={16} />
                  <span>Family Settings</span>
                </button>

                <button
                  className="user-menu-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/account-settings');
                  }}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>

                <div className="user-menu-divider" />

                <button
                  className="user-menu-item sign-out"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalHeader;