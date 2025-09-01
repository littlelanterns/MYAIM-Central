import { useState, useEffect } from 'react';
import { useTaskContext } from '../../components/tasks/shared/TaskContext';

// Custom hook for task management with context integration
export const useTasks = (filters?: any) => {
  const { 
    state, 
    addTask, 
    updateTask, 
    removeTask, 
    completeTask, 
    assignTask,
    setFilters,
    collectTaskContext
  } = useTaskContext();

  // Apply filters
  const filteredTasks = state.tasks.filter(task => {
    if (!filters) return true;
    
    if (filters.status && task.status !== filters.status) return false;
    if (filters.assignedTo && task.assigned_to !== filters.assignedTo) return false;
    if (filters.category && task.category !== filters.category) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    
    return true;
  });

  // Task statistics
  const getTaskStats = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const pending = filteredTasks.filter(t => t.status === 'pending').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
    const overdue = filteredTasks.filter(t => t.status === 'overdue').length;
    
    return { total, completed, pending, inProgress, overdue };
  };

  // Task operations with context collection
  const addTaskWithContext = (taskData: any) => {
    addTask(taskData);
    // Collect context about task creation patterns
    collectTaskContext({
      action: 'task_created',
      category: taskData.category,
      priority: taskData.priority,
      timestamp: new Date().toISOString()
    });
  };

  const completeTaskWithContext = (taskId: string | number, completedBy: string | number) => {
    completeTask(taskId, completedBy);
    // Collect context about completion patterns
    collectTaskContext({
      action: 'task_completed',
      taskId,
      completedBy,
      timestamp: new Date().toISOString()
    });
  };

  return {
    // State
    tasks: filteredTasks,
    allTasks: state.tasks,
    selectedTask: state.selectedTask,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addTask: addTaskWithContext,
    updateTask,
    removeTask,
    completeTask: completeTaskWithContext,
    assignTask,
    setFilters,
    
    // Statistics
    stats: getTaskStats(),
    
    // Context Integration
    collectTaskContext,
    
    // LiLa Ready
    optimizationSuggestions: state.optimizationSuggestions
  };
};
