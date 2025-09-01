import React, { createContext, useContext, useReducer } from 'react';

// Dashboard state interface
interface DashboardState {
  widgets: any[];
  layout: any;
  preferences: Record<string, any>;
  loading: boolean;
  error: string | null;
  // Widget management
  availableWidgets: any[];
  draggedWidget: any | null;
}

// Action types
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WIDGETS'; payload: any[] }
  | { type: 'ADD_WIDGET'; payload: any }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: any } }
  | { type: 'SET_LAYOUT'; payload: any }
  | { type: 'UPDATE_PREFERENCES'; payload: Record<string, any> }
  | { type: 'SET_DRAGGED_WIDGET'; payload: any | null };

// Initial state
const initialState: DashboardState = {
  widgets: [],
  layout: null,
  preferences: {},
  loading: false,
  error: null,
  availableWidgets: [],
  draggedWidget: null
};

// Reducer
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload, loading: false };
    
    case 'ADD_WIDGET':
      return { 
        ...state, 
        widgets: [...state.widgets, action.payload] 
      };
    
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(widget => widget.id !== action.payload)
      };
    
    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id
            ? { ...widget, ...action.payload.updates }
            : widget
        )
      };
    
    case 'SET_LAYOUT':
      return { ...state, layout: action.payload };
    
    case 'UPDATE_PREFERENCES':
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload } 
      };
    
    case 'SET_DRAGGED_WIDGET':
      return { ...state, draggedWidget: action.payload };
    
    default:
      return state;
  }
};

// Context interface
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  // Helper functions
  addWidget: (widget: any) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (id: string, updates: any) => void;
  updateLayout: (layout: any) => void;
  updatePreferences: (preferences: Record<string, any>) => void;
  // Drag and drop
  setDraggedWidget: (widget: any | null) => void;
}

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Custom hook to use dashboard context
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

// Dashboard Provider component
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Helper functions
  const addWidget = (widget: any) => {
    dispatch({ type: 'ADD_WIDGET', payload: widget });
  };

  const removeWidget = (widgetId: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const updateWidget = (id: string, updates: any) => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id, updates } });
  };

  const updateLayout = (layout: any) => {
    dispatch({ type: 'SET_LAYOUT', payload: layout });
  };

  const updatePreferences = (preferences: Record<string, any>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const setDraggedWidget = (widget: any | null) => {
    dispatch({ type: 'SET_DRAGGED_WIDGET', payload: widget });
  };

  const value: DashboardContextType = {
    state,
    dispatch,
    addWidget,
    removeWidget,
    updateWidget,
    updateLayout,
    updatePreferences,
    setDraggedWidget
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export default DashboardProvider;
