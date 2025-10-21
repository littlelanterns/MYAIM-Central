// src/layouts/MainLayout.tsx - FIXED Default Theme with Database Persistence
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
        <div className="grid-cell lila-panel-area">
          <LiLaPanel />
        </div>

        <div className="grid-cell main-content-area">
          <Outlet />
        </div>

        <div className="grid-cell smart-notepad-area">
          <SmartNotepad />
        </div>

      </div>

      {/* Render all draggable modals on top of everything */}
      {modals.map(modal => (
        <DraggableModal key={modal.id} modal={modal} />
      ))}
    </div>
  );
};

export default MainLayout;