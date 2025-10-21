/**
 * PersonalTasks Widget
 * Mom's private task list with categories
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import { CheckSquare, Square, Plus } from 'lucide-react';

type TaskCategory = 'All' | 'Work' | 'Personal' | 'Self-Care';

interface Task {
  id: string;
  title: string;
  category: Exclude<TaskCategory, 'All'>;
  completed: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface PersonalTasksProps {
  familyMemberId: string;
}

const PersonalTasks: React.FC<PersonalTasksProps> = ({ familyMemberId }) => {
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('All');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review quarterly goals',
      category: 'Work',
      completed: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Schedule dentist appointment',
      category: 'Personal',
      completed: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Morning yoga routine',
      category: 'Self-Care',
      completed: true,
      priority: 'medium'
    }
  ]);

  const categories: TaskCategory[] = ['All', 'Work', 'Personal', 'Self-Care'];

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const filteredTasks = activeCategory === 'All'
    ? tasks
    : tasks.filter(task => task.category === activeCategory);

  return (
    <div style={{
      background: 'var(--background-color)',
      border: `1px solid var(--accent-color)`,
      borderRadius: '12px',
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          color: 'var(--primary-color)',
          margin: 0,
          fontSize: '1.25rem'
        }}>
          My Tasks
        </h3>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--secondary-color)',
          opacity: 0.8
        }}>
          Private
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              background: category === activeCategory
                ? 'var(--primary-color)'
                : 'transparent',
              color: category === activeCategory
                ? 'var(--background-color)'
                : 'var(--text-color)',
              border: `1px solid var(--accent-color)`,
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        marginBottom: '1rem'
      }}>
        {filteredTasks.map(task => (
          <div
            key={task.id}
            style={{
              background: 'var(--gradient-background)',
              border: `1px solid var(--accent-color)`,
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              opacity: task.completed ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onClick={() => toggleTask(task.id)}
          >
            {task.completed ? (
              <CheckSquare size={20} color="var(--primary-color)" />
            ) : (
              <Square size={20} color="var(--text-color)" style={{ opacity: 0.5 }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{
                color: 'var(--text-color)',
                fontSize: '0.9375rem',
                textDecoration: task.completed ? 'line-through' : 'none'
              }}>
                {task.title}
              </div>
              {task.category && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-color)',
                  opacity: 0.6,
                  marginTop: '0.25rem'
                }}>
                  {task.category}
                </div>
              )}
            </div>

            {task.priority && (
              <span style={{
                fontSize: '0.625rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: task.priority === 'high'
                  ? 'rgba(255, 0, 0, 0.1)'
                  : task.priority === 'medium'
                  ? 'rgba(255, 165, 0, 0.1)'
                  : 'rgba(0, 128, 0, 0.1)',
                color: task.priority === 'high'
                  ? '#c00'
                  : task.priority === 'medium'
                  ? '#d68000'
                  : '#006400'
              }}>
                {task.priority.toUpperCase()}
              </span>
            )}
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--text-color)',
            opacity: 0.6
          }}>
            <p>No tasks in this category</p>
          </div>
        )}
      </div>

      <button style={{
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: '500'
      }}>
        <Plus size={16} />
        Add Task
      </button>
    </div>
  );
};

export default PersonalTasks;
