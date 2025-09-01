import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getTasks, 
  saveTask, 
  deleteTask, 
  completeTask as apiCompleteTask 
} from '../../../lib/api';

// Task interfaces
interface Task {
  id: string | number;
  title: string;
  description?: string;
  assigned_to?: string | number;
  assigned_by?: string | number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  due_date?: string;
  created_at: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  subtasks?: Task[];
  context_data?: Record<string, any>; // Context Archive Ready
}

// Task state interface
interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: {
    status?: string;
    assignedTo?: string | number;
    category?: string;
    priority?: string;
  };
  loading: boolean;
  error: string | null;
  // Context Archive Integration
  taskContextData: Record<string, any>;
  assignmentIntelligence: Record<string, any>;
  // LiLa Integration
  optimizationSuggestions: any[];
}

// Action types
type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string | number; updates: Partial<Task> } }
  | { type: 'REMOVE_TASK'; payload: string | number }
  | { type: 'SELECT_TASK'; payload: Task | null }
  | { type: 'SET_FILTERS'; payload: Partial<TaskState['filters']> }
  | { type: 'COMPLETE_TASK'; payload: { id: string | number; completedBy: string | number } }
  | { type: 'ASSIGN_TASK'; payload: { id: string | number; assignedTo: string | number; assignedBy: string | number } }
  | { type: 'SET_TASK_CONTEXT'; payload: Record<string, any> }
  | { type: 'UPDATE_ASSIGNMENT_INTELLIGENCE'; payload: Record<string, any> }
  | { type: 'SET_OPTIMIZATION_SUGGESTIONS'; payload: any[] };

// Initial state
const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  filters: {},
  loading: false,
  error: null,
  taskContextData: {},
  assignmentIntelligence: {},
  optimizationSuggestions: []
};

// Reducer
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    
    case 'ADD_TASK':
      return { 
        ...state, 
        tasks: [...state.tasks, action.payload],
        loading: false 
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        )
      };
    
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTask: state.selectedTask?.id === action.payload ? null : state.selectedTask
      };
    
    case 'SELECT_TASK':
      return { ...state, selectedTask: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { 
                ...task, 
                status: 'completed' as const,
                completed_at: new Date().toISOString()
              }
            : task
        )
      };
    
    case 'ASSIGN_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { 
                ...task, 
                assigned_to: action.payload.assignedTo,
                assigned_by: action.payload.assignedBy
              }
            : task
        )
      };
    
    case 'SET_TASK_CONTEXT':
      return { ...state, taskContextData: action.payload };
    
    case 'UPDATE_ASSIGNMENT_INTELLIGENCE':
      return { 
        ...state, 
        assignmentIntelligence: { ...state.assignmentIntelligence, ...action.payload } 
      };
    
    case 'SET_OPTIMIZATION_SUGGESTIONS':
      return { ...state, optimizationSuggestions: action.payload };
    
    default:
      return state;
  }
};

// Context interface
interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  // Helper functions
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string | number, updates: Partial<Task>) => void;
  removeTask: (id: string | number) => void;
  selectTask: (task: Task | null) => void;
  completeTask: (id: string | number, completedBy: string | number) => void;
  assignTask: (id: string | number, assignedTo: string | number, assignedBy: string | number) => void;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  // Context Archive Ready functions
  collectTaskContext: (data: Record<string, any>) => void;
  updateAssignmentIntelligence: (intelligence: Record<string, any>) => void;
  // LiLa Ready functions
  getOptimizationSuggestions: () => any[];
  getTaskInsights: () => any[];
}

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Custom hook to use task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

// Task Provider component
export const TaskProvider: React.FC<{ children: React.ReactNode; familyId?: string }> = ({ 
  children, 
  familyId 
}) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks on mount
  useEffect(() => {
    if (familyId) {
      loadTasks(familyId);
    }
  }, [familyId]);

  // Load tasks from database
  const loadTasks = async (familyId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await getTasks(familyId);
      if (result.success) {
        dispatch({ type: 'SET_TASKS', payload: result.tasks || [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Helper functions with database integration
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await saveTask({
        ...taskData,
        family_id: familyId
      });
      
      if (result.success) {
        dispatch({ type: 'ADD_TASK', payload: result.task });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateTask = async (id: string | number, updates: Partial<Task>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Find current task to merge updates
      const currentTask = state.tasks.find(t => t.id === id);
      if (!currentTask) {
        dispatch({ type: 'SET_ERROR', payload: 'Task not found' });
        return;
      }

      const updatedTask = { ...currentTask, ...updates };
      const result = await saveTask(updatedTask);
      
      if (result.success) {
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeTask = async (id: string | number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await deleteTask(id as string);
      if (result.success) {
        dispatch({ type: 'REMOVE_TASK', payload: id });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const selectTask = (task: Task | null) => {
    dispatch({ type: 'SELECT_TASK', payload: task });
  };

  const completeTask = async (id: string | number, completedBy: string | number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apiCompleteTask(id as string, completedBy as string);
      if (result.success) {
        dispatch({ type: 'COMPLETE_TASK', payload: { id, completedBy } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const assignTask = (id: string | number, assignedTo: string | number, assignedBy: string | number) => {
    dispatch({ type: 'ASSIGN_TASK', payload: { id, assignedTo, assignedBy } });
  };

  const setFilters = (filters: Partial<TaskState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Context Archive Integration
  const collectTaskContext = (data: Record<string, any>) => {
    dispatch({ type: 'SET_TASK_CONTEXT', payload: { ...state.taskContextData, ...data } });
  };

  const updateAssignmentIntelligence = (intelligence: Record<string, any>) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT_INTELLIGENCE', payload: intelligence });
  };

  // LiLa Integration Preparation
  const getOptimizationSuggestions = () => {
    // TODO: Implement optimization suggestions when LiLa is ready
    return state.optimizationSuggestions;
  };

  const getTaskInsights = () => {
    // TODO: Implement task insights logic when LiLa is ready
    return [];
  };

  const value: TaskContextType = {
    state,
    dispatch,
    addTask,
    updateTask,
    removeTask,
    selectTask,
    completeTask,
    assignTask,
    setFilters,
    collectTaskContext,
    updateAssignmentIntelligence,
    getOptimizationSuggestions,
    getTaskInsights
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export default TaskContext;
