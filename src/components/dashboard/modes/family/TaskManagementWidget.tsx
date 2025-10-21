/**
 * TaskManagementWidget Component
 * Create, assign, and track family tasks
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, X } from 'lucide-react';
import { familyMemberColors } from '../../../../styles/colors';

interface Task {
  id: string;
  title: string;
  assignedTo: string[];
  assignedToNames: string[];
  assignedColors: string[];
  dueDate?: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface TaskManagementWidgetProps {
  tasks: Task[];
  onCreateTask: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskManagementWidget: React.FC<TaskManagementWidgetProps> = ({
  tasks,
  onCreateTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getMemberColor = (colorName: string) => {
    const colorObj = familyMemberColors.find(c => c.name === colorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return 'var(--text-color)';
    }
  };

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          color: 'var(--primary-color)',
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Family Tasks
        </h3>
        <button
          onClick={onCreateTask}
          style={{
            background: 'var(--primary-color)',
            color: 'var(--background-color)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={14} />
          Create Task
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--accent-color)',
        paddingBottom: '0.5rem'
      }}>
        {(['all', 'pending', 'completed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              background: filter === filterType ? 'var(--primary-color)' : 'transparent',
              color: filter === filterType ? 'white' : 'var(--text-color)',
              border: filter === filterType ? 'none' : '1px solid var(--accent-color)',
              borderRadius: '6px',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (filter !== filterType) {
                e.currentTarget.style.background = 'var(--accent-color)';
              }
            }}
            onMouseOut={(e) => {
              if (filter !== filterType) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--text-color)',
            opacity: 0.6,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {filter === 'all' && 'No tasks yet. Create one to get started!'}
            {filter === 'pending' && 'No pending tasks. Great job!'}
            {filter === 'completed' && 'No completed tasks yet.'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                background: 'var(--background-color)',
                border: `1px solid ${task.completed ? 'var(--accent-color)' : getPriorityColor(task.priority)}`,
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: task.completed ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: task.completed ? 'var(--primary-color)' : 'var(--text-color)'
                }}
              >
                {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
              </button>

              {/* Task content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'var(--text-color)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  marginBottom: '0.5rem',
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  {task.title}
                </div>

                {/* Assigned members */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Assigned to:
                  </span>
                  {task.assignedToNames.map((name, index) => (
                    <span
                      key={index}
                      style={{
                        background: getMemberColor(task.assignedColors[index]),
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>

                {/* Due date */}
                {task.dueDate && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    marginTop: '0.5rem',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Due: {task.dueDate}
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => onDeleteTask(task.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-color)',
                  opacity: 0.5,
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManagementWidget;
