import React, { useState, useEffect } from 'react';
import { personalThemes, primaryBrand, colorPalette } from '../styles/colors';
import SmartNotepad from '../components/ui/SmartNotepad.jsx';

// Type definitions
interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Task {
  id: number;
  task_name: string;
  description: string;
  assignee: string[];
  task_type: 'task' | 'opportunity';
  task_frequency: 'one-time' | 'weekly' | 'monthly';
  points_value: number;
  status: 'pending' | 'complete';
  reward_type: string;
  created_at: string;
  ai_subtasks?: Subtask[];
  due_date?: string;
  opportunity_type?: 'personal' | 'family' | 'bonus';
  completed_at?: string;
}

// Icons
const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
)

const Plus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const Calendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const Clock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
)

const X = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const Target = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const Image = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
)

const Settings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
  </svg>
)

const VideoCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)

// Sample data for teen
const teenMember = {
  id: 3,
  name: "Emma",
  age: 16,
  dashboard_type: "teen",
  points_balance: 245,
  level: 3,
  background_image: null
}

// Theme grouping function (same as GlobalHeader.js)
const getThemeGroups = () => {
  const standard: Array<{key: string, theme: any}> = [];
  const seasonal: Array<{key: string, theme: any}> = [];
  const holiday: Array<{key: string, theme: any}> = [];
  const childFriendly: Array<{key: string, theme: any}> = [];
  
  Object.entries(personalThemes).forEach(([key, theme]) => {
    const themeWithFlags = theme as any;
    if (themeWithFlags.childFriendly) {
      childFriendly.push({ key, theme });
    } else if (themeWithFlags.holiday) {
      holiday.push({ key, theme });
    } else if (themeWithFlags.seasonal) {
      seasonal.push({ key, theme });
    } else {
      standard.push({ key, theme });
    }
  });
  
  return { standard, seasonal, holiday, childFriendly };
};

// Sample tasks with real database structure
const assignedTasks: Task[] = [
  {
    id: 1,
    task_name: "Clean bedroom",
    description: "Make bed, organize desk, vacuum floor",
    assignee: ["Emma"],
    task_type: "task",
    task_frequency: "one-time",
    points_value: 15,
    status: "pending",
    ai_subtasks: [
      { id: 1, title: "Make your bed neatly", completed: false },
      { id: 2, title: "Clear everything off your desk", completed: false },
      { id: 3, title: "Put clothes in hamper or dresser", completed: false },
      { id: 4, title: "Vacuum or sweep the floor", completed: false },
      { id: 5, title: "Take a photo when finished", completed: false }
    ],
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    task_name: "Do laundry",
    description: "Wash, dry, and fold all clothes",
    assignee: ["Emma"],
    task_type: "task",
    task_frequency: "weekly",
    points_value: 25,
    status: "pending",
    due_date: "2024-01-21T23:59:59Z",
    ai_subtasks: [
      { id: 11, title: "Gather all dirty clothes", completed: false },
      { id: 12, title: "Sort by colors and fabric type", completed: false },
      { id: 13, title: "Start first load in washer", completed: false },
      { id: 14, title: "Move to dryer when done", completed: false },
      { id: 15, title: "Fold and put away all clothes", completed: false }
    ],
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 3,
    task_name: "Deep clean closet",
    description: "Organize, donate unused items",
    assignee: ["Emma"],
    task_type: "task",
    task_frequency: "monthly",
    points_value: 50,
    status: "pending",
    due_date: "2024-01-31T23:59:59Z",
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 4,
    task_name: "Learn guitar chord",
    description: "Practice new chord for 30 minutes",
    assignee: ["Emma"],
    task_type: "opportunity",
    opportunity_type: "personal",
    task_frequency: "one-time",
    points_value: 15,
    status: "pending",
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 5,
    task_name: "Movie night setup",
    description: "Set up living room for family movie night",
    assignee: [], // Open to anyone
    task_type: "opportunity",
    opportunity_type: "family",
    task_frequency: "one-time",
    points_value: 20,
    status: "pending",
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 6,
    task_name: "Extra math practice",
    description: "Complete bonus worksheet for extra credit",
    assignee: ["Emma"],
    task_type: "opportunity",
    opportunity_type: "bonus",
    task_frequency: "one-time",
    points_value: 30,
    status: "pending",
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 7,
    task_name: "Help with dinner prep",
    description: "Chop vegetables and set table",
    assignee: ["Emma"],
    task_type: "task",
    task_frequency: "one-time",
    points_value: 10,
    status: "complete",
    completed_at: "2024-01-15T18:30:00Z",
    reward_type: "points",
    created_at: "2024-01-15T10:00:00Z"
  }
]

const TeenDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(assignedTasks)
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showVictoryRecorder, setShowVictoryRecorder] = useState(false)
  const [showTaskBreakdown, setShowTaskBreakdown] = useState(false)
  const [selectedTaskForBreakdown, setSelectedTaskForBreakdown] = useState<Task | null>(null)
  // Standalone theme system - no global sync needed
  const [currentTheme, setCurrentTheme] = useState<keyof typeof personalThemes>('classic')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(teenMember.background_image)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium'
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === 'complete' ? 'pending' as const : 'complete' as const,
            completed_at: task.status === 'complete' ? undefined : new Date().toISOString() 
          }
        : task
    ))
  }

  const handleSubtaskToggle = (taskId: number, subtaskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? {
            ...task,
            ai_subtasks: task.ai_subtasks ? task.ai_subtasks.map(subtask =>
              subtask.id === subtaskId 
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            ) : []
          }
        : task
    ))
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return
    
    const task: Task = {
      id: Date.now(),
      task_name: newTask.title,
      description: newTask.description,
      assignee: [teenMember.name],
      task_type: "task" as const,
      task_frequency: "one-time" as const,
      points_value: newTask.priority === 'high' ? 20 : newTask.priority === 'medium' ? 15 : 10,
      status: "pending" as const,
      reward_type: "points" as const,
      created_at: new Date().toISOString()
    }
    
    setTasks([...tasks, task])
    setNewTask({ title: '', description: '', priority: 'medium' })
    setShowTaskCreator(false)
  }

  const handleTaskBreakdown = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTaskForBreakdown(task)
      setShowTaskBreakdown(true)
    }
  }

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Standalone theme system - no global sync needed
  const theme = personalThemes[currentTheme] || personalThemes.classic
  
  // Get theme groups for dropdown
  const { standard, seasonal, holiday, childFriendly } = getThemeGroups()
  
  // Separate tasks by type and frequency using real database structure
  const regularTasks = tasks.filter(task => task.task_type === 'task' && task.task_frequency === 'one-time' && task.status !== 'complete')
  const weeklyTasks = tasks.filter(task => task.task_type === 'task' && task.task_frequency === 'weekly' && task.status !== 'complete')
  const monthlyTasks = tasks.filter(task => task.task_type === 'task' && task.task_frequency === 'monthly' && task.status !== 'complete')
  
  // Separate opportunities by type
  const personalOpportunities = tasks.filter(task => task.task_type === 'opportunity' && task.opportunity_type === 'personal' && task.status !== 'complete')
  const familyOpportunities = tasks.filter(task => task.task_type === 'opportunity' && task.opportunity_type === 'family' && task.status !== 'complete')
  const bonusOpportunities = tasks.filter(task => task.task_type === 'opportunity' && task.opportunity_type === 'bonus' && task.status !== 'complete')
  
  const completedTasks = tasks.filter(task => task.status === 'complete')
  const allPendingTasks = tasks.filter(task => task.status !== 'complete')

  // Sort subtasks so completed ones are at bottom
  const sortSubtasks = (subtasks: Subtask[]) => {
    if (!subtasks) return []
    return [...subtasks].sort((a, b) => {
      if (a.completed === b.completed) return 0
      return a.completed ? 1 : -1
    })
  }

  const weather = { temp: 72, condition: "Sunny" }

  return (
    <div 
      className="teen-dashboard" 
      style={{ 
        background: backgroundImage ? `url(${backgroundImage})` : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        minHeight: '100vh',
        color: theme.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative'
      }}
    >
      <style>{`
        /* Mobile-First Standalone Teen Dashboard Styles */
        .teen-dashboard {
          padding: 0;
          margin: 0;
        }
        
        /* Mobile Header */
        .mobile-header {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-left h1 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: ${primaryBrand.warmCream};
        }
        
        .level-points {
          margin: 0;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.8);
          margin-top: 2px;
        }
        
        .theme-dropdown {
          background: ${primaryBrand.warmCream};
          border: 1px solid ${theme.primary}60;
          color: ${theme.text};
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-right: 0.5rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .theme-dropdown option {
          background: ${primaryBrand.warmCream};
          color: ${theme.text};
        }
        
        .mobile-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .mobile-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: ${primaryBrand.warmCream};
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .mobile-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Content Container */
        .dashboard-content {
          padding: 1rem;
          max-width: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          max-height: calc(100vh - 120px);
        }
        
        /* ===== Hybrid Corner System ===== */
        /* Outer layout elements - sharp, professional */
        .mobile-header, .dashboard-content {
          border-radius: 0;
        }
        
        /* Inner cards - friendly, approachable */
        .stat-card, .action-btn {
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        
        /* Task items - softer cards */
        .task-item {
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        
        /* Buttons - softer, inviting */
        .mobile-btn, .theme-dropdown, button {
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .mobile-btn:hover, .action-btn:hover, button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }
        
        /* Header inner accent elements */
        .level-info, .task-count {
          border-radius: 10px;
          font-weight: bold;
        }
        
        /* Header logo card - hybrid corner system - matches stat cards */
        .header-logo-card {
          background: var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%));
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: var(--text-color, #5a4033);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          display: inline-block;
          border: 1px solid var(--primary-color, #68a395);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .header-logo-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary-color, #68a395);
          border-radius: 12px 12px 0 0;
          opacity: 0.8;
        }
        
        .header-logo-card:hover {
          transform: translateY(-3px);
          background: var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)));
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          color: white;
        }
        
        .header-logo-card h1 {
          margin: 0 0 0.25rem 0;
          color: inherit;
        }
        
        .header-logo-card .level-points {
          margin: 0;
          color: inherit;
          opacity: 0.8;
        }
        
        .header-logo-card:hover h1,
        .header-logo-card:hover .level-points {
          color: white;
        }
        
        /* Desktop Layout */
        .content-layout {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }
        
        .tasks-area {
          flex: 2;
          min-width: 0;
        }
        
        .notepad-area {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
          position: sticky;
          top: 1rem;
        }
        
        /* Mobile Layout - Stack Vertically */
        @media (max-width: 768px) {
          .content-layout {
            flex-direction: column;
          }
          
          .notepad-area {
            position: static;
            max-width: none;
            min-width: auto;
          }
        }
        
        /* Stats Row - Mobile Optimized */
        .stats-mobile {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-card {
          background: var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%));
          border-radius: 16px;
          padding: 1.2rem 1rem;
          text-align: center;
          border: 1px solid var(--primary-color, #68a395);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          color: var(--text-color, #5a4033);
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary-color, #68a395);
          border-radius: 16px 16px 0 0;
          opacity: 0.8;
        }
        
        .stat-card:hover {
          transform: translateY(-3px);
          background: var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)));
          border-color: var(--primary-color, #68a395);
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          color: white;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          display: block;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.8rem;
          opacity: 0.8;
        }
        
        /* Action Buttons - Mobile Optimized */
        .mobile-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .action-btn {
          background: var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%));
          border: 1px solid var(--primary-color, #68a395);
          color: var(--text-color, #5a4033);
          padding: 1.2rem;
          border-radius: 16px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          font-size: 0.9rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          position: relative;
        }
        
        .action-btn::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--secondary-color, #d6a461);
          opacity: 0.6;
        }
        
        .action-btn:hover {
          background: var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)));
          transform: translateY(-2px);
          border-color: var(--primary-color, #68a395);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          color: white;
        }
        
        /* Task Sections - Mobile Optimized - FORCE SQUARE CORNERS */
        .task-section {
          background: var(--accent-color, #d4e3d9);
          border-radius: 0 !important;
          margin-bottom: 1.5rem;
          border: 1px solid var(--primary-color, #68a395);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .section-header {
          background: linear-gradient(135deg, ${theme.primary}20, ${theme.accent}20);
          padding: 1rem;
          border-bottom: 1px solid ${theme.primary}30;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }
        
        .task-count {
          background: ${theme.primary};
          color: ${primaryBrand.warmCream};
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .task-list {
          padding: 0;
        }
        
        .task-item {
          padding: 1rem;
          transition: all 0.3s ease;
          color: var(--text-color, #5a4033);
          background: var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%));
          margin: 0.5rem;
          border: 1px solid var(--primary-color, #68a395);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          position: relative;
        }
        
        .task-item:last-child {
          border-bottom: none;
        }
        
        .task-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary-color, #68a395);
          border-radius: 12px 12px 0 0;
          opacity: 0.8;
        }
        
        .task-item:hover {
          transform: translateY(-3px);
          background: var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)));
          border-color: var(--primary-color, #68a395);
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          color: white;
        }
        
        .task-item:hover h4,
        .task-item:hover p,
        .task-item:hover .task-meta span,
        .task-item:hover .subtask-text {
          color: white;
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          gap: 1rem;
        }
        
        .task-info {
          flex: 1;
        }
        
        .task-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .task-info p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.85rem;
          line-height: 1.4;
        }
        
        .task-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        
        .task-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: ${primaryBrand.warmCream};
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .task-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .task-btn.complete {
          background: rgba(34, 197, 94, 0.3);
          border-color: rgba(34, 197, 94, 0.5);
          color: #86efac;
        }
        
        .task-btn.breakdown {
          background: ${theme.primary}30;
          border-color: ${theme.primary}60;
          color: ${theme.primary};
        }
        
        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
          font-size: 0.75rem;
        }
        
        .meta-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        /* Subtasks - Mobile Optimized */
        .subtasks {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .subtasks h5 {
          margin: 0 0 0.75rem 0;
          font-size: 0.85rem;
          opacity: 0.9;
        }
        
        .subtask-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem 0;
          font-size: 0.85rem;
        }
        
        .subtask-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent;
          font-size: 12px;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .subtask-checkbox.checked {
          background: ${theme.primary};
          border-color: ${theme.primary};
          color: ${primaryBrand.warmCream};
        }
        
        .subtask-text {
          flex: 1;
          line-height: 1.4;
        }
        
        .subtask-text.completed {
          text-decoration: line-through;
          opacity: 0.6;
        }
        
        /* Modals - Mobile Optimized */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          padding: 0;
        }
        
        @media (min-width: 640px) {
          .modal-overlay {
            align-items: center;
            padding: 1rem;
          }
        }
        
        .modal-content {
          background: ${theme.background};
          border-radius: 16px 16px 0 0;
          padding: 1.5rem;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          color: ${theme.text};
        }
        
        @media (min-width: 640px) {
          .modal-content {
            border-radius: 16px;
            max-width: 500px;
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${theme.primary};
        }
        
        .close-btn {
          background: none;
          border: none;
          color: ${theme.text};
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
          opacity: 0.7;
        }
        
        .close-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          opacity: 1;
        }
        
        /* Form Elements - Mobile Optimized */
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          color: ${theme.primary};
        }
        
        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: ${theme.text};
          font-size: 1rem;
          box-sizing: border-box;
        }
        
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: ${theme.primary};
          background: ${primaryBrand.warmCream};
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }
        
        .btn-secondary, .btn-primary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
        }
        
        .btn-secondary {
          background: rgba(0, 0, 0, 0.1);
          color: ${theme.text};
        }
        
        .btn-primary {
          background: ${theme.primary};
          color: ${primaryBrand.warmCream};
        }
        
        .btn-primary:hover {
          background: ${theme.secondary};
        }
        
        /* Empty States */
        .empty-state {
          text-align: center;
          padding: 2rem;
          opacity: 0.7;
        }
        
        /* Desktop Adjustments */
        @media (min-width: 768px) {
          .dashboard-content {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .stats-mobile {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .mobile-actions {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .teen-dashboard::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${backgroundImage ? 'rgba(0, 0, 0, 0.3)' : 'transparent'};
          z-index: -1;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 50px;
          height: 50px;
          background: ${theme.primary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: bold;
          color: ${primaryBrand.warmCream};
        }

        .user-details h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .user-details p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-weather {
          text-align: center;
        }

        .date-display {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .weather-display {
          font-size: 0.85rem;
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .time-display {
          font-size: 1.25rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .header-controls {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: ${primaryBrand.warmCream};
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .stats {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          display: block;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .actions-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: ${primaryBrand.warmCream};
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(10px);
        }

        .btn-primary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .task-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .task-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-item {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .task-item.completed {
          opacity: 0.7;
          background: rgba(255, 255, 255, 0.05);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .task-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .task-info p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }

        .points-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .task-assignor {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .complete-btn {
          background: rgba(34, 197, 94, 0.3);
          border: 1px solid rgba(34, 197, 94, 0.5);
          color: #86efac;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .complete-btn:hover {
          background: rgba(34, 197, 94, 0.4);
        }

        .complete-btn.completed {
          background: rgba(34, 197, 94, 0.6);
          color: ${primaryBrand.warmCream};
        }

        .subtasks {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .subtasks h5 {
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .subtask-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subtask-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .subtask-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .subtask-item.completed {
          opacity: 0.6;
        }

        .subtask-checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent;
          font-size: 10px;
          transition: all 0.2s ease;
        }

        .subtask-checkbox.checked {
          background: ${theme.primary};
          border-color: ${theme.primary};
          color: ${primaryBrand.warmCream};
        }

        .subtask-text {
          flex: 1;
          transition: all 0.2s ease;
        }

        .subtask-text.completed {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          color: ${primaryBrand.warmCream};
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: ${primaryBrand.warmCream};
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: ${primaryBrand.warmCream};
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.15);
        }

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: ${primaryBrand.warmCream};
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
        }

        .form-select option {
          background: #2d3748;
          color: ${primaryBrand.warmCream};
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .theme-option {
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          text-align: center;
        }

        .theme-option:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .theme-option.active {
          border-color: ${primaryBrand.warmCream};
        }

        .background-upload {
          margin-bottom: 1.5rem;
        }

        .upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-area:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: ${primaryBrand.warmCream};
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          opacity: 0.7;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .teen-dashboard {
            padding: 0.5rem;
          }
          
          .header-top {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .stats {
            justify-content: center;
          }
          
          .actions-bar {
            flex-direction: column;
          }

          .task-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="header-left">
          <div className="header-logo-card">
            <h1>Hey {teenMember.name}! 👋</h1>
            <p className="level-points">Level {teenMember.level} • {teenMember.points_balance} points</p>
          </div>
        </div>
        <div className="mobile-controls">
          <select 
            className="theme-dropdown"
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value as keyof typeof personalThemes)}
            title="Change theme"
          >
            {standard.map(({ key, theme }) => (
              <option key={key} value={key}>
                {theme.name}
              </option>
            ))}
            
            {seasonal.map(({ key, theme }) => (
              <option key={key} value={key}>
                {theme.name}
              </option>
            ))}
            
            {childFriendly.map(({ key, theme }) => (
              <option key={key} value={key}>
                {theme.name}
              </option>
            ))}
            
            {holiday.map(({ key, theme }) => (
              <option key={key} value={key}>
                {theme.name}
              </option>
            ))}
          </select>
          <button className="mobile-btn" onClick={() => setShowSettings(true)} title="Settings">
            <Settings />
          </button>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="dashboard-content">
        
        {/* Stats - Mobile Grid */}
        <div className="stats-mobile">
          <div className="stat-card">
            <span className="stat-value">{allPendingTasks.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{personalOpportunities.length + familyOpportunities.length + bonusOpportunities.length}</span>
            <span className="stat-label">Opportunities</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{completedTasks.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{teenMember.points_balance}</span>
            <span className="stat-label">Points</span>
          </div>
        </div>

        {/* Action Buttons - Mobile Grid */}
        <div className="mobile-actions">
          <button className="action-btn" onClick={() => setShowTaskCreator(true)}>
            <Plus />
            Add Task
          </button>
          <button className="action-btn" onClick={() => setShowVictoryRecorder(true)}>
            <VideoCamera />
            Victory Recorder
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="content-layout">
          <div className="tasks-area">
            {/* Task Sections */}
        {/* Regular Tasks */}
        {regularTasks.length > 0 && (
          <div className="task-section">
            <div className="section-header">
              <CheckCircle />
              <h3 className="section-title">Daily Tasks</h3>
              <span className="task-count">{regularTasks.length}</span>
            </div>
            
            <div className="task-list">
              {regularTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <div className="task-buttons">
                      <button 
                        className="task-btn breakdown"
                        onClick={() => handleTaskBreakdown(task.id)}
                        title="Break this task into smaller steps"
                      >
                        🧩 Break Down
                      </button>
                      <button 
                        className="task-btn complete"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-meta">
                    <span className="points-badge">
                      <Target />
                      {task.points_value} points
                    </span>
                    <span className="task-assignor">
                      {task.assignee.includes(teenMember.name) ? 'Personal task' : 'From Mom'}
                    </span>
                    <span className="task-assignor">
                      {task.reward_type === 'points' ? 'Point reward' : task.reward_type}
                    </span>
                  </div>

                  {task.ai_subtasks && (
                    <div className="subtasks">
                      <h5>Steps to complete:</h5>
                      <div className="subtask-list">
                        {sortSubtasks(task.ai_subtasks).map((subtask) => (
                          <div key={subtask.id} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
                            <div 
                              className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
                              onClick={() => handleSubtaskToggle(task.id, subtask.id)}
                            >
                              {subtask.completed && '✓'}
                            </div>
                            <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Tasks */}
        {weeklyTasks.length > 0 && (
          <div className="task-section">
            <div className="section-header">
              <Calendar />
              <h3 className="section-title">Weekly Tasks</h3>
              <span className="task-count">{weeklyTasks.length}</span>
            </div>
            
            <div className="task-list">
              {weeklyTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                      {task.due_date && (
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.25rem 0 0 0' }}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="task-buttons">
                      <button 
                        className="task-btn breakdown"
                        onClick={() => handleTaskBreakdown(task.id)}
                        title="Break this task into smaller steps"
                      >
                        🧩 Break Down
                      </button>
                      <button 
                        className="task-btn complete"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-meta">
                    <span className="points-badge">
                      <Target />
                      {task.points_value} points
                    </span>
                    <span className="task-assignor">
                      Weekly • {task.assignee.includes(teenMember.name) ? 'Personal' : 'From Mom'}
                    </span>
                    <span className="task-assignor">
                      {task.reward_type === 'points' ? 'Point reward' : task.reward_type}
                    </span>
                  </div>

                  {task.ai_subtasks && (
                    <div className="subtasks">
                      <h5>Steps to complete:</h5>
                      <div className="subtask-list">
                        {sortSubtasks(task.ai_subtasks).map((subtask) => (
                          <div key={subtask.id} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
                            <div 
                              className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
                              onClick={() => handleSubtaskToggle(task.id, subtask.id)}
                            >
                              {subtask.completed && '✓'}
                            </div>
                            <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Tasks */}
        {monthlyTasks.length > 0 && (
          <div className="task-section">
            <div className="section-header">
              <Calendar />
              <h3 className="section-title">Monthly Goals</h3>
              <span className="task-count">{monthlyTasks.length}</span>
            </div>
            
            <div className="task-list">
              {monthlyTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                      {task.due_date && (
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.25rem 0 0 0' }}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="task-buttons">
                      <button 
                        className="task-btn breakdown"
                        onClick={() => handleTaskBreakdown(task.id)}
                        title="Break this task into smaller steps"
                      >
                        🧩 Break Down
                      </button>
                      <button 
                        className="task-btn complete"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                  
                  <div className="task-meta">
                    <span className="points-badge">
                      <Target />
                      {task.points_value} points
                    </span>
                    <span className="task-assignor">
                      Monthly • {task.assignee.includes(teenMember.name) ? 'Personal' : 'From Mom'}
                    </span>
                    <span className="task-assignor">
                      {task.reward_type === 'points' ? 'Point reward' : task.reward_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Opportunities */}
        {personalOpportunities.length > 0 && (
          <div className="task-section">
            <div className="section-header">
              <Target />
              <h3 className="section-title">My Opportunities</h3>
              <span className="task-count">{personalOpportunities.length}</span>
            </div>
            
            <div className="task-list">
              {personalOpportunities.map((task) => (
                <div key={task.id} className="task-item" style={{ border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <button 
                      className="complete-btn"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      Take It!
                    </button>
                  </div>
                  
                  <div className="task-meta">
                    <span style={{ background: 'rgba(34, 197, 94, 0.3)', color: '#86efac', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      Personal
                    </span>
                    <span className="points-badge">
                      <Target />
                      {task.points_value} points
                    </span>
                    <span className="task-assignor">
                      Optional • Self-improvement
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family & Bonus Opportunities */}
        {(familyOpportunities.length > 0 || bonusOpportunities.length > 0) && (
          <div className="task-section">
            <div className="section-header">
              <Target />
              <h3 className="section-title">Family Opportunities</h3>
              <span className="task-count">{familyOpportunities.length + bonusOpportunities.length}</span>
            </div>
            
            <div className="task-list">
              {familyOpportunities.map((task) => (
                <div key={task.id} className="task-item" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <button 
                      className="complete-btn"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      Claim It!
                    </button>
                  </div>
                  
                  <div className="task-meta">
                    <span style={{ background: 'rgba(245, 158, 11, 0.3)', color: '#fcd34d', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      Family
                    </span>
                    <span className="points-badge">
                      <Target />
                      {task.points_value} points
                    </span>
                    <span className="task-assignor">
                      Open to anyone • {task.reward_type}
                    </span>
                  </div>
                </div>
              ))}
              
              {bonusOpportunities.map((task) => (
                <div key={task.id} className="task-item" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <button 
                      className="complete-btn"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      Go for It!
                    </button>
                  </div>
                  
                  <div className="task-meta">
                    <span style={{ background: 'rgba(168, 85, 247, 0.3)', color: '#c4b5fd', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      Bonus
                    </span>
                    <span className="points-badge">
                      <Target />
                      {task.points_value} points
                    </span>
                    <span className="task-assignor">
                      Extra credit • Optional
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="task-section">
            <div className="section-header">
              <CheckCircle />
              <h3 className="section-title">Completed Today</h3>
              <span className="task-count">{completedTasks.length}</span>
            </div>
            
            <div className="task-list">
              {completedTasks.map((task) => (
                <div key={task.id} className="task-item completed">
                  <div className="task-header">
                    <div className="task-info">
                      <h4>{task.task_name}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <button 
                      className="complete-btn completed"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      ✓ Done
                    </button>
                  </div>
                  
                  <div className="task-meta">
                    <span className="points-badge">
                      <Target />
                      +{task.points_value} points earned
                    </span>
                    <span className="task-assignor">
                      <Clock />
                      Completed {new Date(task.completed_at || '').toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="task-assignor">
                      {task.reward_type === 'points' ? 'Point reward' : task.reward_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no tasks */}
        {allPendingTasks.length === 0 && (
          <div className="task-section">
            <div className="empty-state">
              <p>All caught up! No pending tasks or opportunities.</p>
            </div>
          </div>
        )}
          </div>
          
          {/* SmartNotepad Area */}
          <div className="notepad-area">
            <div className="task-section" style={{ height: '600px' }}>
              <div className="section-header">
                <h3>Smart Notepad</h3>
              </div>
              <div style={{ 
                background: primaryBrand.warmCream, 
                borderRadius: '16px', 
                padding: '1rem', 
                border: `1px solid ${theme.primary}40`,
                height: 'calc(100% - 60px)',
                overflow: 'hidden'
              }}>
                <SmartNotepad />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creator Modal */}
      {showTaskCreator && (
        <div className="modal-overlay" onClick={() => setShowTaskCreator(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Personal Task</h3>
              <button className="close-btn" onClick={() => setShowTaskCreator(false)}>
                <X />
              </button>
            </div>
            
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="What do you need to do?"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Any additional details..."
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-select"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="low">Low (10 points)</option>
                <option value="medium">Medium (15 points)</option>
                <option value="high">High (20 points)</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowTaskCreator(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateTask}>
                <Plus />
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dashboard Settings</h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                <X />
              </button>
            </div>
            
            <div className="form-group">
              <label>Theme</label>
              <select
                className="form-select"
                value={currentTheme}
                onClick={(e) => {
                  console.log('Theme dropdown clicked');
                }}
                onChange={(e) => {
                  console.log('Teen dashboard theme changing to:', e.target.value);
                  setCurrentTheme(e.target.value as keyof typeof personalThemes);
                }}
              >
                {Object.entries(personalThemes).map(([key, themeOption]) => (
                  <option key={key} value={key}>
                    {themeOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Custom Background</label>
              <div className="background-upload">
                <label htmlFor="background-upload" className="upload-area">
                  <input
                    id="background-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    style={{ display: 'none' }}
                  />
                  <Image />
                  <div>Click to upload background image</div>
                </label>
              </div>
              {backgroundImage && (
                <button 
                  className="btn-secondary" 
                  onClick={() => setBackgroundImage(null)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Remove Background
                </button>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowSettings(false)}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Recorder Modal - Placeholder */}
      {showVictoryRecorder && (
        <div className="modal-overlay" onClick={() => setShowVictoryRecorder(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Victory Recorder</h3>
              <button className="close-btn" onClick={() => setShowVictoryRecorder(false)}>
                <X />
              </button>
            </div>
            
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VideoCamera />
              </div>
              <p style={{ marginBottom: '1.5rem' }}>Victory Recorder component will be integrated here...</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Record your wins, celebrate achievements, and share your progress!
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
                <button className="btn-primary">
                  <VideoCamera />
                  Record Video
                </button>
                <button className="btn-primary">
                  <Image />
                  Take Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeenDashboard;