import { useState, useEffect } from 'react';
import { useDashboardContext } from '../../components/dashboard/shared/DashboardProvider';

// Widget configuration interface
interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, any>;
  permissions: string[];
}

// Custom hook for widget management with drag-drop and context integration
export const useWidgets = () => {
  const { 
    state, 
    addWidget, 
    removeWidget, 
    updateWidget, 
    updateLayout,
    setDraggedWidget 
  } = useDashboardContext();

  // Widget operations
  const addWidgetToPosition = (widgetConfig: WidgetConfig) => {
    addWidget({
      ...widgetConfig,
      id: widgetConfig.id || `widget-${Date.now()}`,
      addedAt: new Date().toISOString()
    });
  };

  const moveWidget = (widgetId: string, newPosition: { x: number; y: number }) => {
    updateWidget(widgetId, { position: newPosition });
  };

  const resizeWidget = (widgetId: string, newSize: { width: number; height: number }) => {
    updateWidget(widgetId, { size: newSize });
  };

  const updateWidgetProps = (widgetId: string, newProps: Record<string, any>) => {
    updateWidget(widgetId, { props: newProps });
  };

  // Drag and drop handlers
  const handleDragStart = (widget: any) => {
    setDraggedWidget(widget);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleDrop = (position: { x: number; y: number }) => {
    if (state.draggedWidget) {
      moveWidget(state.draggedWidget.id, position);
      handleDragEnd();
    }
  };

  // Widget filtering by type
  const getWidgetsByType = (type: string) => {
    return state.widgets.filter(widget => widget.type === type);
  };

  // Dashboard-specific widgets
  const getMomWidgets = () => {
    return state.widgets.filter(widget => 
      ['family-overview', 'task-management', 'child-progress', 'schedule'].includes(widget.type)
    );
  };

  const getTeenWidgets = () => {
    return state.widgets.filter(widget => 
      ['task-overview', 'achievements', 'calendar', 'rewards'].includes(widget.type)
    );
  };

  const getChildWidgets = () => {
    return state.widgets.filter(widget => 
      ['my-tasks', 'task-images', 'success-animation', 'reward-stars'].includes(widget.type)
    );
  };

  return {
    // State
    widgets: state.widgets,
    layout: state.layout,
    draggedWidget: state.draggedWidget,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addWidget: addWidgetToPosition,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    updateWidgetProps,
    updateLayout,
    
    // Drag and Drop
    handleDragStart,
    handleDragEnd,
    handleDrop,
    
    // Filtering
    getWidgetsByType,
    getMomWidgets,
    getTeenWidgets,
    getChildWidgets,
    
    // Stats
    totalWidgets: state.widgets.length,
    widgetTypes: Array.from(new Set(state.widgets.map(w => w.type)))
  };
};
