/**
 * IndependentModeBestIntentions Component
 * Goals and intentions system for teens
 * Features: Weekly/monthly intentions, goal tracking, habit tracker, reflection
 * All colors via CSS variables for theme compatibility
 */

import React, { useState } from 'react';
import '../independent/IndependentMode.css';

interface BestIntentionsProps {
  familyMemberId: string;
  viewMode?: 'self' | 'parent';
}

interface Intention {
  id: string;
  text: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'personal' | 'academic' | 'health' | 'relationships' | 'creative';
  createdAt: Date;
  completedAt?: Date;
  isActive: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'academic' | 'personal-growth' | 'health' | 'creative' | 'relationships';
  targetDate?: Date;
  progress: number; // 0-100
  milestones: Milestone[];
  isArchived: boolean;
  createdAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  targetDays: number; // days per week for weekly habits
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings
  color?: string;
}

type ViewTab = 'intentions' | 'goals' | 'habits';

export const IndependentModeBestIntentions: React.FC<BestIntentionsProps> = ({
  familyMemberId,
  viewMode = 'self'
}) => {
  // State
  const [activeTab, setActiveTab] = useState<ViewTab>('intentions');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntentionText, setNewIntentionText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'personal' | 'academic' | 'health' | 'relationships' | 'creative'>('personal');

  // Mock data - in real implementation, fetch from Supabase
  const [intentions, setIntentions] = useState<Intention[]>([
    {
      id: '1',
      text: 'Practice gratitude by writing 3 things I\'m thankful for',
      type: 'weekly',
      category: 'personal',
      createdAt: new Date(2025, 9, 14),
      isActive: true
    },
    {
      id: '2',
      text: 'Complete all homework assignments on time',
      type: 'weekly',
      category: 'academic',
      createdAt: new Date(2025, 9, 14),
      isActive: true
    },
    {
      id: '3',
      text: 'Exercise for at least 30 minutes',
      type: 'daily',
      category: 'health',
      createdAt: new Date(2025, 9, 21),
      isActive: true
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Read 20 books this year',
      description: 'Expand my knowledge and improve reading skills',
      category: 'personal-growth',
      targetDate: new Date(2025, 11, 31),
      progress: 65,
      milestones: [
        { id: 'm1', title: 'Read 5 books', completed: true },
        { id: 'm2', title: 'Read 10 books', completed: true },
        { id: 'm3', title: 'Read 15 books', completed: false },
        { id: 'm4', title: 'Read 20 books', completed: false }
      ],
      isArchived: false,
      createdAt: new Date(2025, 0, 1)
    },
    {
      id: '2',
      title: 'Learn to play guitar',
      description: 'Master 10 songs and basic music theory',
      category: 'creative',
      progress: 30,
      milestones: [
        { id: 'm1', title: 'Learn basic chords', completed: true },
        { id: 'm2', title: 'Play 3 songs', completed: false },
        { id: 'm3', title: 'Play 10 songs', completed: false }
      ],
      isArchived: false,
      createdAt: new Date(2025, 8, 1)
    }
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Morning meditation',
      description: '10 minutes of mindfulness',
      frequency: 'daily',
      targetDays: 7,
      currentStreak: 7,
      longestStreak: 14,
      completedDates: []
    },
    {
      id: '2',
      name: 'Read for 30 minutes',
      frequency: 'daily',
      targetDays: 7,
      currentStreak: 3,
      longestStreak: 21,
      completedDates: []
    },
    {
      id: '3',
      name: 'Practice Spanish',
      frequency: 'weekly',
      targetDays: 4,
      currentStreak: 2,
      longestStreak: 8,
      completedDates: []
    }
  ]);

  // Add new intention
  const handleAddIntention = () => {
    if (!newIntentionText.trim()) return;

    const newIntention: Intention = {
      id: Date.now().toString(),
      text: newIntentionText,
      type: 'weekly',
      category: selectedCategory,
      createdAt: new Date(),
      isActive: true
    };

    setIntentions([...intentions, newIntention]);
    setNewIntentionText('');
    setShowAddForm(false);
  };

  // Complete intention
  const handleCompleteIntention = (id: string) => {
    setIntentions(intentions.map(intention =>
      intention.id === id
        ? { ...intention, completedAt: new Date(), isActive: false }
        : intention
    ));
  };

  // Get category color class
  const getCategoryClass = (category: string): string => {
    return `category-${category.toLowerCase()}`;
  };

  return (
    <div className="independent-best-intentions-container">
      {/* Header */}
      <div className="independent-best-intentions-header">
        <h2 className="independent-best-intentions-title">Best Intentions</h2>
        <div className="independent-best-intentions-tabs">
          <button
            className={`independent-tab-btn ${activeTab === 'intentions' ? 'active' : ''}`}
            onClick={() => setActiveTab('intentions')}
          >
            Intentions
          </button>
          <button
            className={`independent-tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
          <button
            className={`independent-tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Habits
          </button>
        </div>
      </div>

      {/* Intentions Tab */}
      {activeTab === 'intentions' && (
        <div className="independent-intentions-view">
          <div className="independent-intentions-intro">
            <p className="independent-intro-text">
              Set your intentions for the week. What do you want to focus on? How do you want to show up?
            </p>
          </div>

          <div className="independent-intentions-grid">
            {intentions.filter(i => i.isActive).map(intention => (
              <div key={intention.id} className={`independent-intention-card ${getCategoryClass(intention.category)}`}>
                <div className="independent-intention-content">
                  <div className="independent-intention-text">{intention.text}</div>
                  <div className="independent-intention-meta">
                    <span className="independent-intention-type">{intention.type}</span>
                    <span className="independent-intention-category">{intention.category}</span>
                  </div>
                </div>
                <button
                  className="independent-intention-complete-btn"
                  onClick={() => handleCompleteIntention(intention.id)}
                  title="Mark as complete"
                >
                  ✓
                </button>
              </div>
            ))}
          </div>

          {showAddForm ? (
            <div className="independent-add-intention-form">
              <input
                type="text"
                value={newIntentionText}
                onChange={(e) => setNewIntentionText(e.target.value)}
                placeholder="What's your intention for this week?"
                className="independent-intention-input"
                autoFocus
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="independent-select"
              >
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="health">Health</option>
                <option value="relationships">Relationships</option>
                <option value="creative">Creative</option>
              </select>
              <div className="independent-form-actions">
                <button className="independent-button" onClick={handleAddIntention}>
                  Add Intention
                </button>
                <button className="independent-button-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="independent-add-intention-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Set New Intention
            </button>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="independent-goals-view">
          <div className="independent-goals-intro">
            <p className="independent-intro-text">
              Track your long-term goals and celebrate milestones along the way.
            </p>
          </div>

          <div className="independent-goals-grid">
            {goals.filter(g => !g.isArchived).map(goal => (
              <div key={goal.id} className={`independent-goal-card ${getCategoryClass(goal.category)}`}>
                <div className="independent-goal-header">
                  <h3 className="independent-goal-title">{goal.title}</h3>
                  {goal.targetDate && (
                    <span className="independent-goal-deadline">
                      {goal.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {goal.description && (
                  <p className="independent-goal-description">{goal.description}</p>
                )}

                <div className="independent-goal-progress-section">
                  <div className="independent-goal-progress-header">
                    <span className="independent-goal-progress-label">Progress</span>
                    <span className="independent-goal-progress-percentage">{goal.progress}%</span>
                  </div>
                  <div className="independent-goal-progress-bar">
                    <div
                      className="independent-goal-progress-fill"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div className="independent-goal-milestones">
                  <div className="independent-milestones-label">Milestones</div>
                  {goal.milestones.map(milestone => (
                    <div key={milestone.id} className={`independent-milestone ${milestone.completed ? 'completed' : ''}`}>
                      <div className="independent-milestone-checkbox">
                        {milestone.completed ? '✓' : '○'}
                      </div>
                      <div className="independent-milestone-text">{milestone.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="independent-add-goal-btn">
            + Add New Goal
          </button>
        </div>
      )}

      {/* Habits Tab */}
      {activeTab === 'habits' && (
        <div className="independent-habits-view">
          <div className="independent-habits-intro">
            <p className="independent-intro-text">
              Build positive habits one day at a time. Track your streaks and stay consistent.
            </p>
          </div>

          <div className="independent-habits-grid">
            {habits.map(habit => (
              <div key={habit.id} className="independent-habit-card">
                <div className="independent-habit-header">
                  <h3 className="independent-habit-name">{habit.name}</h3>
                  <span className="independent-habit-frequency">{habit.frequency}</span>
                </div>

                {habit.description && (
                  <p className="independent-habit-description">{habit.description}</p>
                )}

                <div className="independent-habit-stats">
                  <div className="independent-habit-stat">
                    <div className="independent-habit-stat-value">{habit.currentStreak}</div>
                    <div className="independent-habit-stat-label">Current Streak</div>
                  </div>
                  <div className="independent-habit-stat">
                    <div className="independent-habit-stat-value">{habit.longestStreak}</div>
                    <div className="independent-habit-stat-label">Longest Streak</div>
                  </div>
                  {habit.frequency === 'weekly' && (
                    <div className="independent-habit-stat">
                      <div className="independent-habit-stat-value">{habit.targetDays}x/week</div>
                      <div className="independent-habit-stat-label">Target</div>
                    </div>
                  )}
                </div>

                <button className="independent-habit-check-btn">
                  Mark Complete Today
                </button>
              </div>
            ))}
          </div>

          <button className="independent-add-habit-btn">
            + Add New Habit
          </button>
        </div>
      )}
    </div>
  );
};

export default IndependentModeBestIntentions;
