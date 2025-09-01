import { useState, useEffect, useContext, createContext } from 'react';
import { personalThemes, createThemeVariables, getThemeByName } from '../../styles/colors.js';

// Theme Context
interface ThemeContextType {
  currentTheme: string;
  theme: any;
  setTheme: (themeName: string) => void;
  availableThemes: typeof personalThemes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Family-wide theme hook (for general app theming)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // Fallback when used outside provider
    const [currentTheme, setCurrentTheme] = useState('classic');
    const theme = getThemeByName(currentTheme);
    
    useEffect(() => {
      // Apply theme to CSS custom properties
      const themeVariables = createThemeVariables(theme);
      Object.entries(themeVariables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }, [theme]);
    
    return {
      theme,
      currentTheme,
      setTheme: setCurrentTheme,
      availableThemes: personalThemes
    };
  }
  
  return context;
};

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Check localStorage for saved theme
    return localStorage.getItem('aimfm-family-theme') || 'classic';
  });
  
  const theme = getThemeByName(currentTheme);
  
  useEffect(() => {
    // Save theme preference
    localStorage.setItem('aimfm-family-theme', currentTheme);
    
    // Apply theme to CSS custom properties
    const themeVariables = createThemeVariables(theme);
    Object.entries(themeVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [currentTheme, theme]);
  
  const setTheme = (themeName: string) => {
    if ((personalThemes as any)[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  const value: ThemeContextType = {
    currentTheme,
    theme,
    setTheme,
    availableThemes: personalThemes
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};