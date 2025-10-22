/**
 * IndependentModeLayout Component
 * Layout manager for Independent Mode dashboard (teens)
 *
 * Features:
 * - Responsive grid system
 * - Widget positioning and sizing
 * - Drag-and-drop support (future)
 * - Theme-aware via CSS variables
 */

import React, { ReactNode } from 'react';
import './IndependentMode.css';

interface IndependentModeLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  layoutMode?: 'default' | 'focus' | 'minimal';
}

export const IndependentModeLayout: React.FC<IndependentModeLayoutProps> = ({
  children,
  header,
  sidebar,
  layoutMode = 'default'
}) => {
  return (
    <div className={`independent-dashboard-container layout-${layoutMode}`}>
      {header && (
        <div className="independent-dashboard-header">
          {header}
        </div>
      )}

      <div className="independent-dashboard-content">
        {sidebar ? (
          <div className="independent-two-column">
            <main className="independent-main-content">
              {children}
            </main>
            <aside className="independent-sidebar">
              {sidebar}
            </aside>
          </div>
        ) : (
          <main className="independent-main-content">
            {children}
          </main>
        )}
      </div>
    </div>
  );
};

interface IndependentWidgetContainerProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  highlight?: boolean;
}

export const IndependentWidgetContainer: React.FC<IndependentWidgetContainerProps> = ({
  children,
  title,
  icon,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  highlight = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={`independent-card ${highlight ? 'independent-card-highlight' : ''} ${className}`}>
      {(title || actions) && (
        <div className="independent-card-header">
          <h3 className="independent-card-title">
            {icon && <span className="independent-card-icon">{icon}</span>}
            {title}
          </h3>
          <div className="independent-card-actions">
            {actions}
            {collapsible && (
              <button
                className="independent-icon-button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
            )}
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="independent-card-body">
          {children}
        </div>
      )}
    </div>
  );
};

interface IndependentGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

export const IndependentGrid: React.FC<IndependentGridProps> = ({
  children,
  columns = 3,
  gap = 'medium'
}) => {
  const gapSizes = {
    small: '0.75rem',
    medium: '1.5rem',
    large: '2rem'
  };

  return (
    <div
      className="independent-widget-grid"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${350 / columns}px, 1fr))`,
        gap: gapSizes[gap]
      }}
    >
      {children}
    </div>
  );
};

interface IndependentHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  actions?: ReactNode;
  themeSelector?: ReactNode;
}

export const IndependentHeader: React.FC<IndependentHeaderProps> = ({
  title,
  subtitle,
  avatar,
  actions,
  themeSelector
}) => {
  return (
    <>
      <div className="independent-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {avatar && (
          <img
            src={avatar}
            alt="Profile"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid var(--primary-color)'
            }}
          />
        )}
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-color)'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--text-color)',
              opacity: 0.7
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="independent-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {themeSelector}
        {actions}
      </div>
    </>
  );
};

export default IndependentModeLayout;
