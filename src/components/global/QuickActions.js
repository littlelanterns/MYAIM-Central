// src/components/global/QuickActions.js - With Database Usage Tracking
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCreationModal from '../tasks/TaskCreationModal.tsx';
import { supabase } from '../../lib/supabase';
import './QuickActions.css';

const QuickActions = ({ contextType = 'dashboard' }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // User state for database tracking
  const [familyMemberId, setFamilyMemberId] = useState(null);

  // Modal states
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [showTaskBreaker, setShowTaskBreaker] = useState(false);
  const [showMediator, setShowMediator] = useState(false);
  const [showComplimentGenerator, setShowComplimentGenerator] = useState(false);
  const [showSillyQuestions, setShowSillyQuestions] = useState(false);
  const [showManners, setShowManners] = useState(false);

  // Actions with usage count for auto-rearrangement
  const getInitialActions = () => {
    const baseActions = [
      { name: "Command Center", usageCount: 0, id: 'command-center', type: 'navigation' },
      { name: "Family Setup", usageCount: 0, id: 'family-setup', type: 'navigation' },
      // ARCHIVED: AIM-Admin moved to direct URL access only (/aim-admin)
      // { name: "AIM-Admin", usageCount: 0, id: 'aim-admin', type: 'navigation' },
      { name: "Create Task", usageCount: 0, id: 'create-task', type: 'modal' },
      { name: "Me with Manners", usageCount: 0, id: 'manners', type: 'modal' },
      { name: "Task Breaker", usageCount: 0, id: 'task-breaker', type: 'modal' },
      { name: "Mediator", usageCount: 0, id: 'mediator', type: 'modal' },
      { name: "Meal Planner", usageCount: 0, id: 'meal-planner', type: 'modal' },
      { name: "Compliment Generator", usageCount: 0, id: 'compliment-generator', type: 'modal' },
      { name: "Silly Question Generator", usageCount: 0, id: 'silly-questions', type: 'modal' },
    ];

    return baseActions;
  };

  const [actions, setActions] = useState(getInitialActions());

  // Load family member ID and usage data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get family member ID
        const { data: memberData, error: memberError } = await supabase
          .from('family_members')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (memberError) {
          console.log('No family member found for user');
          return;
        }

        setFamilyMemberId(memberData.id);

        // Load usage data
        const { data: usageData, error: usageError } = await supabase
          .from('quick_action_usage')
          .select('action_name, click_count')
          .eq('family_member_id', memberData.id);

        if (usageError) {
          console.log('No usage data found (table may not exist yet)');
          return;
        }

        // Update actions with usage counts from database
        if (usageData && usageData.length > 0) {
          setActions(prevActions => {
            const updatedActions = prevActions.map(action => {
              const usage = usageData.find(u => u.action_name === action.id);
              return {
                ...action,
                usageCount: usage ? usage.click_count : 0
              };
            });

            // Sort by usage count
            return updatedActions.sort((a, b) => {
              if (b.usageCount !== a.usageCount) {
                return b.usageCount - a.usageCount;
              }
              return a.name.localeCompare(b.name);
            });
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction * 300,
        behavior: 'smooth'
      });
    }
  };

  const handleActionClick = async (actionId) => {
    console.log('QuickAction clicked:', actionId);

    // Update local usage count and sort
    setActions(prevActions => {
      const updatedActions = prevActions.map(action =>
        action.id === actionId
          ? { ...action, usageCount: action.usageCount + 1 }
          : action
      );

      // Sort by usage count (descending), then by name
      return updatedActions.sort((a, b) => {
        if (b.usageCount !== a.usageCount) {
          return b.usageCount - a.usageCount;
        }
        return a.name.localeCompare(b.name);
      });
    });

    // Save to database (non-blocking)
    if (familyMemberId) {
      try {
        const { error } = await supabase.rpc('increment_quick_action_usage', {
          p_family_member_id: familyMemberId,
          p_action_name: actionId
        });

        if (error) {
          console.error('Error saving quick action usage:', error);
        }
      } catch (error) {
        console.error('Error calling increment function:', error);
      }
    }

    // Handle the action based on type
    const clickedAction = actions.find(a => a.id === actionId);

    if (clickedAction.type === 'navigation') {
      console.log('Navigating to:', actionId);
      handleNavigation(actionId);
    } else if (clickedAction.type === 'modal') {
      console.log('Opening modal:', actionId);
      handleModalOpen(actionId);
    }

    console.log(`Triggered: ${clickedAction.name}`);
  };

  const handleNavigation = (actionId) => {
    switch (actionId) {
      case 'command-center':
        navigate('/command-center');
        break;
      case 'family-setup':
        navigate('/family-setup');
        break;
      // ARCHIVED: aim-admin navigation removed (access directly via /aim-admin URL)
      default:
        console.log(`Navigation not implemented for: ${actionId}`);
    }
  };

  const handleModalOpen = (actionId) => {
    switch (actionId) {
      case 'create-task':
        setShowTaskCreator(true);
        break;
      case 'meal-planner':
        setShowMealPlanner(true);
        break;
      case 'task-breaker':
        setShowTaskBreaker(true);
        break;
      case 'mediator':
        setShowMediator(true);
        break;
      case 'compliment-generator':
        setShowComplimentGenerator(true);
        break;
      case 'silly-questions':
        setShowSillyQuestions(true);
        break;
      case 'manners':
        setShowManners(true);
        break;
      default:
        console.log(`Modal not implemented for: ${actionId}`);
    }
  };

  const addNewAction = () => {
    const newActionName = prompt("Enter new action name:");
    if (newActionName && newActionName.trim()) {
      const newAction = {
        name: newActionName.trim(),
        usageCount: 0,
        id: `custom-${Date.now()}`,
        type: 'modal'
      };
      setActions(prev => [...prev, newAction]);
    }
  };

  const handleTaskSave = (taskData) => {
    console.log('Task data to save:', taskData);
    // TODO: Connect to actual Supabase save function
    // Example: await saveTask(taskData);
    alert('Task saved successfully! (Will connect to Supabase soon)');
  };

  return (
    <>
      <div className="quick-actions-container">
        <button 
          className="scroll-button scroll-left" 
          onClick={() => scroll(-1)}
          title="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="quick-actions-scroll" ref={scrollRef}>
          <div className="quick-actions-list">
            {actions.map((action) => (
              <button 
                key={action.id} 
                className="quick-action-card"
                onClick={(e) => {
                  console.log('Button clicked:', action.id, action.name);
                  e.preventDefault();
                  e.stopPropagation();
                  handleActionClick(action.id);
                }}
                title={`Used ${action.usageCount} times`}
              >
                {action.name}
                {action.usageCount > 0 && (
                  <span className="usage-badge">{action.usageCount}</span>
                )}
              </button>
            ))}
            
            <button 
              className="quick-action-card add-action"
              onClick={addNewAction}
              title="Add new action"
            >
              <Plus size={16} /> Add Action
            </button>
          </div>
        </div>
        
        <button 
          className="scroll-button scroll-right" 
          onClick={() => scroll(1)}
          title="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={showTaskCreator}
        onClose={() => setShowTaskCreator(false)}
        onSave={handleTaskSave}
        familyMembers={[]} // TODO: Pass real family members from context/props
      />

      {/* Placeholder Modals with Portal and Close buttons */}
      {showMealPlanner && (
        <PlaceholderModal
          title="Meal Planner"
          onClose={() => setShowMealPlanner(false)}
          content="AI-powered meal planning coming soon! This will help you create weekly meal plans based on family preferences and dietary needs."
        />
      )}

      {showTaskBreaker && (
        <PlaceholderModal
          title="TaskBreaker AI"
          onClose={() => setShowTaskBreaker(false)}
          content="TaskBreaker AI will help break down complex tasks into manageable subtasks. Perfect for overwhelming chores or homework assignments."
        />
      )}

      {showMediator && (
        <PlaceholderModal
          title="Family Mediator"
          onClose={() => setShowMediator(false)}
          content="The AI Mediator helps resolve family conflicts with fair, age-appropriate solutions and communication strategies."
        />
      )}

      {showComplimentGenerator && (
        <PlaceholderModal
          title="Compliment Generator"
          onClose={() => setShowComplimentGenerator(false)}
          content="Generate personalized, meaningful compliments for family members based on their recent achievements and personality."
        />
      )}

      {showSillyQuestions && (
        <PlaceholderModal
          title="Silly Question Generator"
          onClose={() => setShowSillyQuestions(false)}
          content="Fun conversation starters and silly questions to get the family laughing and talking together."
        />
      )}

      {showManners && (
        <PlaceholderModal
          title="Me with Manners"
          onClose={() => setShowManners(false)}
          content="AI assistant for teaching and reinforcing good manners and social skills in age-appropriate ways."
        />
      )}
    </>
  );
};

// FIXED Placeholder Modal Component with Portal and Close button
const PlaceholderModal = ({ title, content, onClose }) => {
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999, // FIXED: Higher z-index
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--background-color, #fff4ec)',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--accent-color, #d4e3d9)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* ADDED: Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-color, #5a4033)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
          title="Close"
        >
          <X size={20} />
        </button>

        <h2 style={{
          color: 'var(--primary-color, #68a395)',
          marginBottom: '1rem',
          fontFamily: 'var(--font-heading, "The Seasons"), "Playfair Display", serif'
        }}>
          {title}
        </h2>
        <p style={{
          color: 'var(--text-color, #5a4033)',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          {content}
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)))',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Got it!
        </button>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default QuickActions;