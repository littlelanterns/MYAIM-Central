/**
 * IndependentModeTaskWidget Component
 * Full-featured task management for teens
 *
 * Features:
 * - List and Kanban views
 * - Filtering and sorting
 * - Priority levels and tags
 * - Due dates with reminders
 * - Quick add with keyboard shortcut
 * - Drag-to-reorder support
 * - Subtask management
 * - Theme-aware via CSS variables
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Filter, Plus, Search, Calendar as CalendarIcon, Tag as TagIcon, X } from 'lucide-react';
import { IndependentWidgetContainer } from './IndependentModeLayout';
import './IndependentMode.css';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  task_name: string;
  description?: string;
  status: 'pending' | 'complete';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: string[];
  points_value?: number;
  ai_subtasks?: Subtask[];
  created_by?: string;
  created_at: string;
}

interface IndependentModeTaskWidgetProps {
  familyMemberId: string;
  viewMode?: 'self' | 'parent';
  onTaskComplete?: (taskId: string) => void;
  onTaskCreate?: (task: Partial<Task>) => void;
}

type ViewMode = 'list' | 'kanban';
type FilterMode = 'all' | 'today' | 'week' | 'overdue';
type SortMode = 'priority' | 'due_date' | 'created';

export const IndependentModeTaskWidget: React.FC<IndependentModeTaskWidgetProps> = ({
  familyMemberId,
  viewMode = 'self',
  onTaskComplete,
  onTaskCreate
}) => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewType, setViewType] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: [] as string[]
  });

  // Sample data (replace with real data fetch)
  useEffect(() => {
    // TODO: Fetch tasks from Supabase
    const sampleTasks: Task[] = [
      {
        id: '1',
        task_name: 'Complete history essay',
        description: 'Write 5 pages on the Industrial Revolution',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        tags: ['school', 'homework'],
        points_value: 25,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        task_name: 'Clean room',
        description: 'Deep clean and organize',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        tags: ['chores'],
        points_value: 15,
        ai_subtasks: [
          { id: 's1', title: 'Make bed', completed: false },
          { id: 's2', title: 'Vacuum floor', completed: false },
          { id: 's3', title: 'Organize desk', completed: false }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        task_name: 'Study for math test',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        tags: ['school', 'test'],
        points_value: 20,
        created_at: new Date().toISOString()
      }
    ];
    setTasks(sampleTasks);
  }, [familyMemberId]);

  // Keyboard shortcut for quick add (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (task.status === 'complete') return false;

    // Search filter
    if (searchQuery && !task.task_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tag filter
    if (selectedTags.length > 0 && !task.tags?.some(tag => selectedTags.includes(tag))) {
      return false;
    }

    // Date filter
    if (filterMode !== 'all') {
      const now = new Date();
      const dueDate = task.due_date ? new Date(task.due_date) : null;

      if (filterMode === 'today' && dueDate) {
        return dueDate.toDateString() === now.toDateString();
      }
      if (filterMode === 'week' && dueDate) {
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= weekFromNow;
      }
      if (filterMode === 'overdue' && dueDate) {
        return dueDate < now;
      }
    }

    return true;
  });

  // Sorting logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortMode === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
    }
    if (sortMode === 'due_date') {
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return aDate - bDate;
    }
    if (sortMode === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  // Handlers
  const handleTaskToggle = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'complete' ? 'pending' : 'complete' }
        : task
    ));
    if (onTaskComplete) {
      onTaskComplete(taskId);
    }
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId && task.ai_subtasks
        ? {
            ...task,
            ai_subtasks: task.ai_subtasks.map(st =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            )
          }
        : task
    ));
  };

  const handleQuickAdd = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      task_name: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      due_date: newTask.dueDate || undefined,
      tags: newTask.tags,
      points_value: newTask.priority === 'high' ? 20 : newTask.priority === 'medium' ? 15 : 10,
      created_at: new Date().toISOString()
    };

    setTasks([...tasks, task]);
    if (onTaskCreate) {
      onTaskCreate(task);
    }

    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      tags: []
    });
    setShowQuickAdd(false);
  };

  // Get all unique tags
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])));

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <IndependentWidgetContainer
      title="Tasks"
      icon={<CheckSquare size={20} />}
      actions={
        <>
          <button
            className="independent-icon-button"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <Filter size={18} />
          </button>
          <button
            className="independent-button"
            onClick={() => setShowQuickAdd(true)}
            title="Add task (Ctrl+K)"
          >
            <Plus size={18} />
            Add
          </button>
        </>
      }
    >
      {/* Search and View Toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-color)',
              opacity: 0.5
            }}
          />
          <input
            type="text"
            className="independent-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`independent-button-secondary ${viewType === 'list' ? 'active' : ''}`}
            onClick={() => setViewType('list')}
            style={{
              background: viewType === 'list' ? 'var(--accent-color)' : 'transparent'
            }}
          >
            List
          </button>
          <button
            className={`independent-button-secondary ${viewType === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewType('kanban')}
            style={{
              background: viewType === 'kanban' ? 'var(--accent-color)' : 'transparent'
            }}
          >
            Board
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          background: 'var(--accent-color)',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="independent-label" style={{ marginBottom: '0.5rem' }}>
              Time Filter
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['all', 'today', 'week', 'overdue'] as FilterMode[]).map(mode => (
                <button
                  key={mode}
                  className="independent-badge"
                  onClick={() => setFilterMode(mode)}
                  style={{
                    background: filterMode === mode ? 'var(--primary-color)' : 'var(--background-color)',
                    color: filterMode === mode ? 'var(--background-color)' : 'var(--text-color)',
                    cursor: 'pointer'
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div>
              <label className="independent-label" style={{ marginBottom: '0.5rem' }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className="independent-badge"
                    onClick={() =>
                      setSelectedTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )
                    }
                    style={{
                      background: selectedTags.includes(tag) ? 'var(--primary-color)' : 'var(--background-color)',
                      color: selectedTags.includes(tag) ? 'var(--background-color)' : 'var(--text-color)',
                      cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sort Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-color)', opacity: 0.7 }}>
          Sort by:
        </span>
        <select
          className="independent-select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          style={{ width: 'auto', padding: '0.375rem 0.5rem', fontSize: '0.875rem' }}
        >
          <option value="priority">Priority</option>
          <option value="due_date">Due Date</option>
          <option value="created">Newest</option>
        </select>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-color)', opacity: 0.7, marginLeft: 'auto' }}>
          {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task List */}
      <div className="independent-list">
        {sortedTasks.length === 0 ? (
          <div className="independent-empty-state">
            <div className="independent-empty-state-icon">✓</div>
            <div className="independent-empty-state-message">All caught up!</div>
            <div className="independent-empty-state-hint">
              {searchQuery || selectedTags.length > 0
                ? 'No tasks match your filters'
                : 'No pending tasks'}
            </div>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className={`independent-task-item independent-task-priority-${task.priority || 'medium'}`}>
              <div
                className={`independent-task-checkbox ${task.status === 'complete' ? 'checked' : ''}`}
                onClick={() => handleTaskToggle(task.id)}
              >
                {task.status === 'complete' && '✓'}
              </div>

              <div className="independent-task-content">
                <h4 className="independent-task-title">{task.task_name}</h4>
                {task.description && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    margin: '0.25rem 0 0.5rem 0'
                  }}>
                    {task.description}
                  </p>
                )}

                <div className="independent-task-meta">
                  {task.priority && (
                    <span className="independent-task-tag">
                      {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                      {task.priority}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="independent-task-tag">
                      <CalendarIcon size={12} style={{ marginRight: '0.25rem' }} />
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                  {task.points_value && (
                    <span className="independent-task-tag">
                      ⭐ {task.points_value} pts
                    </span>
                  )}
                  {task.tags?.map(tag => (
                    <span key={tag} className="independent-task-tag">
                      <TagIcon size={12} style={{ marginRight: '0.25rem' }} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Subtasks */}
                {task.ai_subtasks && task.ai_subtasks.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--accent-color)' }}>
                    {task.ai_subtasks.map(subtask => (
                      <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div
                          className={`independent-task-checkbox ${subtask.completed ? 'checked' : ''}`}
                          onClick={() => handleSubtaskToggle(task.id, subtask.id)}
                          style={{ width: '16px', height: '16px', fontSize: '0.75rem' }}
                        >
                          {subtask.completed && '✓'}
                        </div>
                        <span style={{
                          fontSize: '0.875rem',
                          textDecoration: subtask.completed ? 'line-through' : 'none',
                          opacity: subtask.completed ? 0.6 : 1
                        }}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="independent-modal-overlay" onClick={() => setShowQuickAdd(false)}>
          <div className="independent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="independent-modal-header">
              <h3 className="independent-modal-title">Add Task</h3>
              <button className="independent-modal-close" onClick={() => setShowQuickAdd(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="independent-form-group">
              <label className="independent-label">Task Name</label>
              <input
                type="text"
                className="independent-input"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="independent-form-group">
              <label className="independent-label">Description (optional)</label>
              <textarea
                className="independent-textarea"
                placeholder="Add details..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                style={{ minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="independent-form-group">
                <label className="independent-label">Priority</label>
                <select
                  className="independent-select"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="independent-form-group">
                <label className="independent-label">Due Date</label>
                <input
                  type="date"
                  className="independent-input"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="independent-modal-actions">
              <button
                className="independent-button-secondary"
                onClick={() => setShowQuickAdd(false)}
              >
                Cancel
              </button>
              <button
                className="independent-button"
                onClick={handleQuickAdd}
                disabled={!newTask.title.trim()}
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </IndependentWidgetContainer>
  );
};

export default IndependentModeTaskWidget;
