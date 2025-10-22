/**
 * GuidedModeLayout Component
 * Card-based grid layout manager for Guided Mode
 * CRITICAL: Uses CSS variables ONLY - works with all themes
 * NO hard-coded colors
 */

import React from 'react';
import './GuidedModeLayout.css';

interface WidgetCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  gridColumn?: string;
  gridRow?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  children,
  className = '',
  gridColumn,
  gridRow
}) => {
  return (
    <div
      className={`guided-widget-card ${className}`}
      style={{
        gridColumn,
        gridRow
      }}
    >
      <div className="guided-widget-header">
        {icon && <span className="guided-widget-icon">{icon}</span>}
        <h3 className="guided-widget-title">{title}</h3>
      </div>
      <div className="guided-widget-content">
        {children}
      </div>
    </div>
  );
};

interface TemplateLayoutProps {
  template: 'standard' | 'full';
  widgets: {
    task?: React.ReactNode;
    reward?: React.ReactNode;
    calendar?: React.ReactNode;
    bestIntentions?: React.ReactNode;
    victory?: React.ReactNode;
  };
}

export const TemplateLayout: React.FC<TemplateLayoutProps> = ({
  template,
  widgets
}) => {
  if (template === 'standard') {
    return (
      <div className="guided-layout-grid standard-layout">
        {/* Tasks - Left column, spans 2 rows */}
        {widgets.task && (
          <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}>
            {widgets.task}
          </div>
        )}

        {/* Calendar - Top right */}
        {widgets.calendar && (
          <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
            {widgets.calendar}
          </div>
        )}

        {/* Reward - Middle right */}
        {widgets.reward && (
          <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
            {widgets.reward}
          </div>
        )}

        {/* Best Intentions - Bottom left */}
        {widgets.bestIntentions && (
          <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }}>
            {widgets.bestIntentions}
          </div>
        )}

        {/* Victory - Bottom right */}
        {widgets.victory && (
          <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}>
            {widgets.victory}
          </div>
        )}
      </div>
    );
  }

  // Full layout - more flexible grid
  return (
    <div className="guided-layout-grid full-layout">
      {widgets.task}
      {widgets.reward}
      {widgets.calendar}
      {widgets.bestIntentions}
      {widgets.victory}
    </div>
  );
};

export default TemplateLayout;
