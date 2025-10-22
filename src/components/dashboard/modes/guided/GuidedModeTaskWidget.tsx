/**
 * GuidedModeTaskWidget Component
 * Task list with checkboxes and category colors
 * CRITICAL: All colors use CSS variables - theme compatible
 * Features: Category-coded tasks, progress tracking, clear visual feedback
 */

import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Star } from 'lucide-react';
import './GuidedModeTaskWidget.css';

export interface Task {
  id: string;
  title: string;
  category?: 'homework' | 'chores' | 'personal' | 'family';
  emoji?: string;
  dueTime?: string;
  priority?: 'high' | 'medium' | 'low';
  points?: number;
  completed: boolean;
}

interface GuidedModeTaskWidgetProps {
  familyMemberId: string;
}

const categoryEmojis: Record<string, string> = {
  homework: '📚',
  chores: '🧹',
  personal: '⭐',
  family: '❤️'
};

export const GuidedModeTaskWidget: React.FC<GuidedModeTaskWidgetProps> = ({
  familyMemberId
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'homework' | 'chores'>('all');

  // Mock data - in real implementation, fetch from Supabase
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Finish math homework',
      category: 'homework',
      completed: false,
      dueTime: '5:00 PM',
      points: 10,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Clean your room',
      category: 'chores',
      completed: false,
      points: 8,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Practice piano',
      category: 'personal',
      completed: false,
      dueTime: '4:00 PM',
      points: 5,
      priority: 'low'
    },
    {
      id: '4',
      title: 'Read for 20 minutes',
      category: 'personal',
      completed: true,
      points: 10
    }
  ]);

  const onTaskComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const maxDisplay = 10;
  const showCompleted = true;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.completed) return false;
    if (filter === 'all') return true;
    if (filter === 'today') return !task.completed;
    return task.category === filter;
  }).slice(0, maxDisplay);

  // Calculate completion stats
  const totalTasks = tasks.filter(t => !t.completed).length;
  const completedToday = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0
    ? Math.round((completedToday / tasks.length) * 100)
    : 0;

  return (
    <div className="guided-task-widget">
      {/* Progress Summary */}
      <div className="task-progress-summary">
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-number">{totalTasks}</span>
            <span className="stat-label">To Do</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedToday}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completionRate}%</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="task-progress-bar">
          <div
            className="task-progress-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="task-filters">
        {[
          { key: 'all', label: 'All', icon: '📋' },
          { key: 'today', label: 'Today', icon: '⭐' },
          { key: 'homework', label: 'Homework', icon: '📚' },
          { key: 'chores', label: 'Chores', icon: '🧹' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key as typeof filter)}
          >
            <span className="filter-icon">{icon}</span>
            <span className="filter-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <p className="empty-message">
              {filter === 'today' && completedToday > 0
                ? 'All done! Great work! 🎉'
                : 'No tasks yet. Time to add some!'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''} ${task.priority ? `priority-${task.priority}` : ''}`}
              onClick={() => !task.completed && onTaskComplete(task.id)}
            >
              {/* Checkbox */}
              <div className="task-checkbox">
                {task.completed ? (
                  <CheckCircle className="check-icon checked" size={28} />
                ) : (
                  <Circle className="check-icon unchecked" size={28} />
                )}
              </div>

              {/* Task Content */}
              <div className="task-content">
                <div className="task-title-row">
                  {task.emoji && <span className="task-emoji">{task.emoji}</span>}
                  {!task.emoji && task.category && (
                    <span className="task-emoji">{categoryEmojis[task.category]}</span>
                  )}
                  <span className="task-title">{task.title}</span>
                </div>

                {/* Task Meta Info */}
                <div className="task-meta">
                  {task.dueTime && (
                    <span className="task-time">
                      <Clock size={14} />
                      {task.dueTime}
                    </span>
                  )}
                  {task.points && (
                    <span className="task-points">
                      <Star size={14} />
                      {task.points} pts
                    </span>
                  )}
                  {task.category && (
                    <span className={`task-category category-${task.category}`}>
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuidedModeTaskWidget;
