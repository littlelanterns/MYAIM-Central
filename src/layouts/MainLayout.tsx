// src/layouts/MainLayout.tsx - FIXED Default Theme
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import GlobalHeader from '../components/global/GlobalHeader';
import SmartNotepad from '../components/ui/SmartNotepad.jsx';
import LiLaPanel from '../components/global/LiLaPanel';
import { useModalContext } from '../contexts/ModalContext.tsx';
import DraggableModal from '../components/ui/DraggableModal.tsx';
import { personalThemes, createThemeVariables } from '../styles/colors';
import './MainLayout.css';

const MainLayout = () => {
  // FIXED: Default to 'classic' instead of 'rosegold'
  const [currentTheme, setCurrentTheme] = useState('classic');
  const { modals } = useModalContext();

  useEffect(() => {
    // TODO: Load user's saved theme preference from Supabase
    // const loadUserTheme = async () => {
    //   const { data } = await supabase
    //     .from('family_members')
    //     .select('theme_preference')
    //     .eq('wordpress_user_id', currentUserId)
    //     .single();
    //   if (data?.theme_preference) {
    //     setCurrentTheme(data.theme_preference);
    //   }
    // };
    // loadUserTheme();
  }, []);

  useEffect(() => {
    const theme = personalThemes[currentTheme] || personalThemes.classic;
    const variables = createThemeVariables(theme);
    const root = document.documentElement;
    
    // Apply base theme variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Add specific header gradients using brand-approved colors
    const headerGradients = {
      classic: 'linear-gradient(135deg, #68a395 0%, #2c5d60 100%)',
      forest: 'linear-gradient(135deg, #4b7c66 0%, #355f50 100%)',
      ocean: 'linear-gradient(135deg, #2c5d60 0%, #355f50 100%)',
      sunset: 'linear-gradient(135deg, #b99c34 0%, #b86432 100%)',
      lavender: 'linear-gradient(135deg, #805a82 0%, #5d3e60 100%)',
      earthy: 'linear-gradient(135deg, #6f4f3a 0%, #4e3426 100%)',
      rosegold: 'linear-gradient(135deg, #d69a84 0%, #f4dcb7 100%)',
      spring: 'linear-gradient(135deg, #4b7c66 0%, #68a395 100%)',
      summer: 'linear-gradient(135deg, #fae49b 0%, #b99c34 100%)',
      autumn: 'linear-gradient(135deg, #b86432 0%, #8a4a25 100%)',
      fall: 'linear-gradient(135deg, #b86432 0%, #805a82 100%)',
      winter: 'linear-gradient(135deg, #68a395 0%, #355f50 100%)',
      christmas: 'linear-gradient(135deg, #4b7c66 0%, #b25a58 100%)',
      storm: 'linear-gradient(135deg, #1a365d 0%, #4a5568 100%)',
      woodland: 'linear-gradient(135deg, #2f4f2f 0%, #8b8680 100%)'
    };
    
    const headerGradient = headerGradients[currentTheme] || headerGradients.classic;
    root.style.setProperty('--theme-header-gradient', headerGradient);
    
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