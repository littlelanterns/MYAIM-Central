/**
 * GuidedModeDashboard Component
 * Dashboard for elementary-age children (ages 8-12)
 * Features: Balanced fun and function, structured tasks, gamification, progress tracking
 * Theme-compatible: Uses CSS variables ONLY - works with all 26+ themes
 * NO HARD-CODED COLORS - EVER
 */

import React, { useState, useEffect } from 'react';
import { personalThemes } from '../../../../styles/colors';
import { GuidedModeTaskWidget } from './GuidedModeTaskWidget';
import { GuidedModeRewardWidget } from './GuidedModeRewardWidget';
import { GuidedModeCalendarWidget } from './GuidedModeCalendarWidget';
import { GuidedModeVictoryRecorder } from './GuidedModeVictoryRecorder';
import './GuidedMode.css';

interface GuidedModeDashboardProps {
  familyMemberId: string;
}

const GuidedModeDashboard: React.FC<GuidedModeDashboardProps> = ({ familyMemberId }) => {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof personalThemes>('brightSunshine');

  // Apply theme to root and restore on unmount (prevents theme bleeding when used in modal)
  useEffect(() => {
    const theme = personalThemes[currentTheme] || personalThemes.brightSunshine;
    const root = document.documentElement;

    // Save original theme values before applying new theme
    const originalTheme = {
      primary: root.style.getPropertyValue('--primary-color') || getComputedStyle(root).getPropertyValue('--primary-color'),
      secondary: root.style.getPropertyValue('--secondary-color') || getComputedStyle(root).getPropertyValue('--secondary-color'),
      accent: root.style.getPropertyValue('--accent-color') || getComputedStyle(root).getPropertyValue('--accent-color'),
      background: root.style.getPropertyValue('--background-color') || getComputedStyle(root).getPropertyValue('--background-color'),
      text: root.style.getPropertyValue('--text-color') || getComputedStyle(root).getPropertyValue('--text-color'),
      gradientPrimary: root.style.getPropertyValue('--gradient-primary') || getComputedStyle(root).getPropertyValue('--gradient-primary'),
      gradientBackground: root.style.getPropertyValue('--gradient-background') || getComputedStyle(root).getPropertyValue('--gradient-background'),
    };

    // Apply new theme
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--gradient-background', `linear-gradient(135deg, ${theme.background}, ${theme.accent}20)`);

    // Restore original theme on unmount
    return () => {
      root.style.setProperty('--primary-color', originalTheme.primary);
      root.style.setProperty('--secondary-color', originalTheme.secondary);
      root.style.setProperty('--accent-color', originalTheme.accent);
      root.style.setProperty('--background-color', originalTheme.background);
      root.style.setProperty('--text-color', originalTheme.text);
      root.style.setProperty('--gradient-primary', originalTheme.gradientPrimary);
      root.style.setProperty('--gradient-background', originalTheme.gradientBackground);
    };
  }, [currentTheme]);

  // Get fun and seasonal themes only
  const getChildFriendlyThemes = () => {
    const seasonal: Array<{ key: string; theme: any }> = [];
    const fun: Array<{ key: string; theme: any }> = [];

    Object.entries(personalThemes).forEach(([key, theme]) => {
      if ((theme as any).seasonal || (theme as any).holiday) {
        seasonal.push({ key, theme });
      } else if ((theme as any).childFriendly) {
        fun.push({ key, theme });
      }
    });

    return { seasonal, fun };
  };

  const { seasonal, fun } = getChildFriendlyThemes();

  return (
    <div className="guided-mode-dashboard">
      {/* Header */}
      <header className="guided-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="guided-title">My Dashboard</h1>
            <p className="guided-subtitle">Learning to organize step by step</p>
          </div>

          {/* Theme Selector - Fun and Seasonal Only */}
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value as keyof typeof personalThemes)}
            className="guided-theme-select"
          >
            <optgroup label="Seasonal Themes">
              {seasonal.map(({ key, theme }) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </optgroup>
            <optgroup label="Fun Themes">
              {fun.map(({ key, theme }) => (
                <option key={key} value={key}>{theme.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </header>

      {/* Main Widget Grid */}
      <div className="guided-widgets-container">
        {/* Row 1: Tasks (left) + Rewards (right) */}
        <div className="guided-row">
          <div className="guided-widget guided-widget-large">
            <GuidedModeTaskWidget familyMemberId={familyMemberId} />
          </div>
          <div className="guided-widget guided-widget-medium">
            <GuidedModeRewardWidget familyMemberId={familyMemberId} />
          </div>
        </div>

        {/* Row 2: Calendar (left) + Victory Recorder (right) */}
        <div className="guided-row">
          <div className="guided-widget guided-widget-medium">
            <GuidedModeCalendarWidget familyMemberId={familyMemberId} />
          </div>
          <div className="guided-widget guided-widget-large">
            <GuidedModeVictoryRecorder familyMemberId={familyMemberId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedModeDashboard;
