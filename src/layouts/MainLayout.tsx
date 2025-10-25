// src/layouts/MainLayout.tsx - FIXED Default Theme with Database Persistence
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Palette } from 'lucide-react';
import GlobalHeader from '../components/global/GlobalHeader';
import SmartNotepad from '../components/ui/SmartNotepad.jsx';
import LiLaPanel from '../components/global/LiLaPanel';
import { useModalContext } from '../contexts/ModalContext';
import DraggableModal from '../components/ui/DraggableModal';
import { personalThemes, createThemeVariables } from '../styles/colors';
import { supabase } from '../lib/supabase';
import './MainLayout.css';

const MainLayout = () => {
  // FIXED: Default to 'classic' instead of 'rosegold'
  const [currentTheme, setCurrentTheme] = useState('classic');
  const { modals } = useModalContext();
  const [lilaOpen, setLilaOpen] = useState(false);
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    // Load user's saved theme preference from Supabase
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

  useEffect(() => {
    const theme = (personalThemes as any)[currentTheme] || personalThemes.classic;
    const variables = createThemeVariables(theme);
    const root = document.documentElement;
    
    // Apply base theme variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Header gradient now uses the same --gradient-primary as the rest of the theme
    // This ensures the header always matches the selected theme
    root.style.setProperty('--theme-header-gradient', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    
    // Add scrollbar styling variables
    root.style.setProperty('--scrollbar-thumb', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--scrollbar-thumb-hover', `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`);
  }, [currentTheme]);

  const handleThemeChange = async (newTheme: string) => {
    setCurrentTheme(newTheme);
    setShowThemeModal(false);

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
    const general: any[] = [];
    const seasonal: any[] = [];
    const fun: any[] = [];

    Object.entries(personalThemes).forEach(([key, theme]: [string, any]) => {
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
    <div className="main-layout-container">
      {/* Beautiful header bar behind top row */}
      <div className="header-background"></div>
      
      {/* 6-Cell Grid Layout */}
      <div className="layout-grid">

        {/* Top Row: Logo | Quick Actions | Controls - All part of GlobalHeader */}
        <GlobalHeader 
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          onSettingsClick={() => console.log('Settings clicked!')}
        />
        
        {/* Bottom Row: LiLa Panel | Main Content | Smart Notepad */}
        <div className={`grid-cell lila-panel-area ${lilaOpen ? 'drawer-open' : ''}`}>
          <LiLaPanel />
        </div>

        <div className="grid-cell main-content-area">
          <Outlet />
        </div>

        <div className={`grid-cell smart-notepad-area ${notepadOpen ? 'drawer-open' : ''}`}>
          <SmartNotepad />
        </div>

      </div>

      {/* Mobile Drawer Toggle Buttons */}
      <button
        className="mobile-drawer-toggle lila-toggle"
        onClick={() => setLilaOpen(!lilaOpen)}
        aria-label="Toggle AI Helpers"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </button>

      <button
        className="mobile-drawer-toggle notepad-toggle"
        onClick={() => setNotepadOpen(!notepadOpen)}
        aria-label="Toggle Smart Notepad"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </button>

      {/* Mobile Theme Selector FAB */}
      <button
        className="mobile-drawer-toggle theme-toggle"
        onClick={() => setShowThemeModal(!showThemeModal)}
        aria-label="Change theme"
      >
        <Palette size={24} />
      </button>

      {/* Mobile overlay backdrop */}
      {(lilaOpen || notepadOpen || showThemeModal) && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => {
            setLilaOpen(false);
            setNotepadOpen(false);
            setShowThemeModal(false);
          }}
        />
      )}

      {/* Mobile Theme Selection Modal */}
      {showThemeModal && (
        <div className="mobile-theme-modal">
          <div className="mobile-theme-modal-header">
            <h3>Choose Theme</h3>
            <button onClick={() => setShowThemeModal(false)} className="mobile-theme-modal-close">×</button>
          </div>
          <div className="mobile-theme-modal-content">
            {(() => {
              const { general, seasonal, fun } = getThemeGroups();
              return (
                <>
                  <div className="mobile-theme-section">
                    <div className="mobile-theme-section-label">General</div>
                    {general.map(({ key, theme }) => (
                      <button
                        key={key}
                        className={`mobile-theme-option ${currentTheme === key ? 'active' : ''}`}
                        onClick={() => handleThemeChange(key)}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>

                  <div className="mobile-theme-section">
                    <div className="mobile-theme-section-label">Seasonal</div>
                    {seasonal.map(({ key, theme }) => (
                      <button
                        key={key}
                        className={`mobile-theme-option ${currentTheme === key ? 'active' : ''}`}
                        onClick={() => handleThemeChange(key)}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>

                  <div className="mobile-theme-section">
                    <div className="mobile-theme-section-label">Fun</div>
                    {fun.map(({ key, theme }) => (
                      <button
                        key={key}
                        className={`mobile-theme-option ${currentTheme === key ? 'active' : ''}`}
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
        </div>
      )}

      {/* Render all draggable modals on top of everything */}
      {modals.map(modal => (
        <DraggableModal key={modal.id} modal={modal} />
      ))}
    </div>
  );
};

export default MainLayout;