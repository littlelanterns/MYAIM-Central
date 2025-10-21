/**
 * PersonalWidgetContainer Component
 * Container for personal widgets with special styling to indicate privacy
 * NO EMOJIS - uses Lucide React icons only
 * ONLY CSS VARIABLES for colors
 */

import React from 'react';
import { Lock, GripVertical, X } from 'lucide-react';
import { WidgetConfig, WidgetPosition } from '../../../types/dashboard.types';
import './PersonalWidgetContainer.css';

interface PersonalWidgetContainerProps {
  widget: WidgetConfig;
  onRemove: () => void;
  onMove: (newPosition: WidgetPosition) => void;
  children?: React.ReactNode;
}

const PersonalWidgetContainer: React.FC<PersonalWidgetContainerProps> = ({
  widget,
  onRemove,
  children
}) => {
  const getWidgetPlaceholder = () => {
    switch (widget.widget_type) {
      case 'best_intentions':
        return (
          <div className="widget-placeholder">
            <h3>My Best Intentions</h3>
            <p>Personal goals only you can see</p>
          </div>
        );
      case 'tasks':
        return (
          <div className="widget-placeholder">
            <h3>My Tasks</h3>
            <p>Private task management</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="widget-placeholder">
            <h3>My Calendar</h3>
            <p>Personal schedule hidden from family</p>
          </div>
        );
      case 'archives':
        return (
          <div className="widget-placeholder">
            <h3>My Notes</h3>
            <p>Personal reflections and context</p>
          </div>
        );
      case 'victory_recorder':
        return (
          <div className="widget-placeholder">
            <h3>My Victories</h3>
            <p>Private accomplishment tracking</p>
          </div>
        );
      default:
        return (
          <div className="widget-placeholder">
            <h3>{widget.widget_type.replace('_', ' ')}</h3>
            <p>Private widget</p>
          </div>
        );
    }
  };

  return (
    <div className="personal-widget-container">
      <div className="privacy-indicator">
        <Lock className="lock-icon" size={12} />
        <span className="privacy-text">Private</span>
      </div>

      <div className="widget-controls">
        <button className="control-btn move" title="Move widget" aria-label="Move widget">
          <GripVertical size={16} />
        </button>
        <button className="control-btn remove" onClick={onRemove} title="Remove widget" aria-label="Remove widget">
          <X size={16} />
        </button>
      </div>

      <div className="widget-content">
        {children || getWidgetPlaceholder()}
      </div>
    </div>
  );
};

export default PersonalWidgetContainer;
