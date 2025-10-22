/**
 * PlayModeLayout Component
 * Grid layout manager for Play Mode dashboard
 * Features: Responsive grid, large touch-friendly widgets
 */

import React from 'react';
import './PlayModeLayout.css';

export interface WidgetConfig {
  id: string;
  component: React.ReactNode;
  gridArea?: string;
  visible?: boolean;
}

interface PlayModeLayoutProps {
  widgets: WidgetConfig[];
  className?: string;
}

export const PlayModeLayout: React.FC<PlayModeLayoutProps> = ({
  widgets,
  className = ''
}) => {
  const visibleWidgets = widgets.filter(w => w.visible !== false);

  return (
    <div className={`play-mode-layout ${className}`}>
      {visibleWidgets.map(widget => (
        <div
          key={widget.id}
          className="play-mode-widget-slot"
          style={{
            gridArea: widget.gridArea
          }}
        >
          {widget.component}
        </div>
      ))}
    </div>
  );
};

// Pre-defined layout templates for different configurations
interface LayoutTemplate {
  name: string;
  gridTemplate: string;
  areas: { [key: string]: string };
}

export const layoutTemplates: { [key: string]: LayoutTemplate } = {
  simple: {
    name: 'Simple (2 widgets)',
    gridTemplate: `
      "task task"
      "victory victory"
    `,
    areas: {
      task: 'task',
      victory: 'victory'
    }
  },

  standard: {
    name: 'Standard (3 widgets)',
    gridTemplate: `
      "task task"
      "reward victory"
    `,
    areas: {
      task: 'task',
      reward: 'reward',
      victory: 'victory'
    }
  },

  full: {
    name: 'Full (4 widgets)',
    gridTemplate: `
      "task task"
      "reward calendar"
      "victory victory"
    `,
    areas: {
      task: 'task',
      reward: 'reward',
      calendar: 'calendar',
      victory: 'victory'
    }
  }
};

interface TemplateLayoutProps {
  template: keyof typeof layoutTemplates;
  widgets: { [key: string]: React.ReactNode };
  className?: string;
}

export const TemplateLayout: React.FC<TemplateLayoutProps> = ({
  template,
  widgets,
  className = ''
}) => {
  const selectedTemplate = layoutTemplates[template] || layoutTemplates.standard;

  return (
    <div
      className={`play-mode-layout template-${template} ${className}`}
      style={{
        gridTemplateAreas: selectedTemplate.gridTemplate
      }}
    >
      {Object.entries(selectedTemplate.areas).map(([key, area]) => (
        widgets[key] ? (
          <div
            key={key}
            className="play-mode-widget-slot"
            style={{ gridArea: area }}
          >
            {widgets[key]}
          </div>
        ) : null
      ))}
    </div>
  );
};

// Widget container wrapper for consistent styling
interface WidgetCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  className?: string;
  onClick?: () => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  children,
  title,
  icon,
  className = '',
  onClick
}) => {
  return (
    <div
      className={`play-widget-card ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {title && (
        <div className="play-widget-header">
          {icon && <span className="play-widget-icon">{icon}</span>}
          <h2 className="play-widget-title">{title}</h2>
        </div>
      )}
      <div className="play-widget-content">
        {children}
      </div>
    </div>
  );
};
