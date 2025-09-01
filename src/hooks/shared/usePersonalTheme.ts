import { useState, useEffect } from 'react';
import { 
  personalThemes, 
  createThemeVariables, 
  getThemeByName, 
  colorPalette,
  getThemesGroupedByType 
} from '../../styles/colors.js';

interface PersonalThemeOptions {
  userId?: string;
  scopePrefix?: string; // CSS variable prefix for scoped theming
}

// Individual member theme hook (enhanced theme access for teens)
export const usePersonalTheme = (options: PersonalThemeOptions = {}) => {
  const { userId, scopePrefix = 'personal' } = options;
  
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Check localStorage for user's personal theme
    const storageKey = userId ? `aimfm-personal-theme-${userId}` : 'aimfm-personal-theme';
    return localStorage.getItem(storageKey) || 'classic';
  });
  
  const theme = getThemeByName(currentTheme);
  
  useEffect(() => {
    // Save theme preference
    const storageKey = userId ? `aimfm-personal-theme-${userId}` : 'aimfm-personal-theme';
    localStorage.setItem(storageKey, currentTheme);
    
    // Apply theme to scoped CSS custom properties
    const themeVariables = createThemeVariables(theme);
    Object.entries(themeVariables).forEach(([key, value]) => {
      const scopedKey = key.replace('--', `--${scopePrefix}-`);
      document.documentElement.style.setProperty(scopedKey, value);
    });
  }, [currentTheme, theme, userId, scopePrefix]);
  
  const setTheme = (themeName: string) => {
    if ((personalThemes as any)[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  // Enhanced theme options for teens (50+ color combinations)
  const getAllColorCombinations = () => {
    const combinations: any[] = [];
    
    // Add existing personal themes
    Object.entries(personalThemes).forEach(([key, themeData]) => {
      combinations.push({
        id: key,
        isPersonalTheme: true,
        ...themeData
      });
    });
    
    // Generate additional combinations from color palette
    const colorFamilies = Object.keys(colorPalette);
    colorFamilies.forEach(family => {
      const colors = colorPalette[family as keyof typeof colorPalette];
      if (typeof colors === 'object') {
        // Create theme variations for each color family
        const baseColor = colors.dark || colors.medium;
        const lightColor = colors.light;
        const accentColor = (colors as any).deepest || (colors as any).darker || colors.dark;
        
        combinations.push({
          id: `${family}-bold`,
          name: `Bold ${family.charAt(0).toUpperCase() + family.slice(1)}`,
          description: `Rich ${family} tones with high contrast`,
          primary: baseColor,
          secondary: lightColor,
          accent: accentColor,
          background: lightColor,
          text: '#2d3748',
          preview: [baseColor, lightColor, accentColor],
          isGenerated: true,
          family
        });
      }
    });
    
    return combinations;
  };
  
  // Get themes organized by type (standard, seasonal, holiday)
  const getOrganizedThemes = () => {
    return getThemesGroupedByType();
  };
  
  // Create custom theme from colors
  const createCustomTheme = (colors: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    text?: string;
  }) => {
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background || '#ffffff',
      text: colors.text || '#2d3748',
      preview: [colors.primary, colors.secondary, colors.accent]
    };
  };
  
  // Apply theme with animation
  const setThemeWithTransition = (themeName: string) => {
    if (!(personalThemes as any)[themeName]) return;
    
    // Add transition class
    document.body.classList.add('theme-transition');
    
    // Set theme
    setTheme(themeName);
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  };
  
  return {
    theme,
    currentTheme,
    setTheme,
    setThemeWithTransition,
    availableThemes: personalThemes,
    getAllColorCombinations,
    getOrganizedThemes,
    createCustomTheme,
    // Teen-specific features
    hasEnhancedAccess: true, // Can be controlled by user type
    totalThemeOptions: getAllColorCombinations().length
  };
};