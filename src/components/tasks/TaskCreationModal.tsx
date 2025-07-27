// src/components/tasks/TaskCreationModal.tsx - Your FULL working version + Portal wrapper
import React, { useState, useEffect, FormEvent, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskData: any) => void;
  familyMembers?: any[];
}

interface SubtaskType {
  id: number;
  text: string;
  completed: boolean;
  miniSteps: string[];
  showMiniSteps: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  familyMembers = []
}) => {
  // Basic task info state
  const [taskName, setTaskName] = useState<string>('');
  const [duration, setDuration] = useState<string>('No time limit');
  const [description, setDescription] = useState<string>('');
  const [taskImage, setTaskImage] = useState<File | null>(null);
  const [saveTemplate, setSaveTemplate] = useState<boolean>(false);

  // Task type state
  const [taskType, setTaskType] = useState<string>('task');
  const [showTaskTypeDescription, setShowTaskTypeDescription] = useState<boolean>(false);

  // Assignment state
  const [assignees, setAssignees] = useState<string[]>([]);

  // Frequency state
  const [frequency, setFrequency] = useState<string>('one-time');
  const [frequencyDetails, setFrequencyDetails] = useState<any>({});

  // Completion and rewards state
  const [incompleteAction, setIncompleteAction] = useState<string>('auto-disappear');
  const [rewardType, setRewardType] = useState<string>('none');
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [trackTask, setTrackTask] = useState<boolean>(false);
  const [trackingOptions, setTrackingOptions] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  // AI features state
  const [subtasks, setSubtasks] = useState<SubtaskType[]>([]);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState<boolean>(false);
  const [descriptionChecklist, setDescriptionChecklist] = useState<string[]>([]);

  // Draggable functionality
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Default family members if none provided
  const defaultMembers = [
    { id: 1, name: "Tommy", age: 8, value: "Tommy (Age 8)" },
    { id: 2, name: "Sarah", age: 15, value: "Sarah (Age 15)" },
    { id: 3, name: "Mom", value: "Mom" },
    { id: 4, name: "Dad", value: "Dad" },
    { id: 5, name: "Whole Family", value: "Whole Family" }
  ];

  const membersToUse = familyMembers.length > 0 ? familyMembers : defaultMembers;

  // Draggable handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragState.isDragging && modalRef.current) {
      const newX = e.clientX - dragState.offsetX;
      const newY = e.clientY - dragState.offsetY;
      
      modalRef.current.style.left = `${newX}px`;
      modalRef.current.style.top = `${newY}px`;
      modalRef.current.style.transform = 'none';
    }
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTaskName('');
    setDuration('No time limit');
    setDescription('');
    setTaskImage(null);
    setSaveTemplate(false);
    setTaskType('task');
    setAssignees([]);
    setFrequency('one-time');
    setFrequencyDetails({});
    setIncompleteAction('auto-disappear');
    setRewardType('none');
    setRewardAmount('');
    setRequireApproval(false);
    setTrackTask(false);
    setTrackingOptions([]);
    setEstimatedTime(0);
    setSubtasks([]);
    setDescriptionChecklist([]);
  };

  const handleAssigneeChange = (memberValue: string, checked: boolean) => {
    if (checked) {
      setAssignees([...assignees, memberValue]);
    } else {
      setAssignees(assignees.filter(a => a !== memberValue));
    }
  };

  const handleTrackingOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setTrackingOptions([...trackingOptions, option]);
    } else {
      setTrackingOptions(trackingOptions.filter(o => o !== option));
    }
  };

  const generateSubtasks = async () => {
    if (!taskName.trim()) {
      alert('Please enter a task name first');
      return;
    }

    setIsGeneratingSubtasks(true);

    try {
      // Mock AI-generated subtasks (will connect to Pipedream later)
      await new Promise(resolve => setTimeout(resolve, 1500));

      let mockSubtasks: string[] = [];
      
      if (description.toLowerCase().includes('clean') || description.toLowerCase().includes('organize')) {
        mockSubtasks = [
          `Gather all items for "${taskName}"`,
          "Sort items into keep, donate, and trash piles",
          "Put away items that belong elsewhere",
          "Wipe down surfaces and vacuum/sweep",
          "Do a final walkthrough and organize remaining items"
        ];
      } else if (description.toLowerCase().includes('homework') || description.toLowerCase().includes('study')) {
        mockSubtasks = [
          "Gather all materials and find a quiet workspace",
          `Review the assignment requirements for "${taskName}"`,
          "Break the work into smaller sections",
          "Complete each section with short breaks",
          "Review and double-check all work before submitting"
        ];
      } else {
        mockSubtasks = [
          `Prepare materials needed for "${taskName}"`,
          "Start with the most important or time-sensitive part",
          "Complete the main activity step by step",
          "Clean up and organize when finished",
          "Review what was accomplished and mark as complete"
        ];
      }

      const formattedSubtasks: SubtaskType[] = mockSubtasks.map((text, index) => ({
        id: index,
        text,
        completed: false,
        miniSteps: [],
        showMiniSteps: false
      }));

      setSubtasks(formattedSubtasks);

    } catch (error) {
      console.error('Error generating subtasks:', error);
      alert('Error generating subtasks. Please try again.');
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const toggleSubtaskComplete = (id: number) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === id 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    ));
  };

  const generateMiniSteps = async (subtaskId: number) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    if (subtask.showMiniSteps) {
      setSubtasks(subtasks.map(s => 
        s.id === subtaskId 
          ? { ...s, showMiniSteps: false }
          : s
      ));
      return;
    }

    // Generate mini-steps for this subtask
    const miniSteps = [
      `Start: ${subtask.text.toLowerCase()}`,
      `Check that everything needed is available`,
      `Complete the main action carefully`,
      `Verify the result meets expectations`
    ];

    setSubtasks(subtasks.map(s => 
      s.id === subtaskId 
        ? { ...s, miniSteps, showMiniSteps: true }
        : s
    ));
  };

  const organizeDescription = () => {
    if (!description.trim()) {
      alert('Please enter a description first.');
      return;
    }
    
    const items = description.split(/[.\n•-]/)
      .filter(item => item.trim().length > 3)
      .map(item => item.trim());
    
    setDescriptionChecklist(items);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) {
      alert('Please enter a task name');
      return;
    }
    
    if (assignees.length === 0) {
      alert('Please assign this task to at least one person');
      return;
    }

    const taskData = {
      task_name: taskName,
      duration,
      description,
      task_type: taskType,
      assignee: assignees,
      frequency,
      frequency_details: frequencyDetails,
      incomplete_action: incompleteAction,
      reward_type: rewardType,
      reward_amount: rewardAmount,
      require_approval: requireApproval,
      track_task: trackTask,
      tracking_options: trackingOptions,
      estimated_time: estimatedTime,
      subtasks: subtasks.map(s => s.text),
      save_template: saveTemplate
    };

    console.log('Task data:', taskData);
    
    if (onSave) {
      onSave(taskData);
    }
    
    alert('Task created successfully!');
    onClose();
  };

  if (!isOpen) return null;

  // ONLY CHANGE: Wrap everything in ReactDOM.createPortal
  return ReactDOM.createPortal(
    <>
      <style>{`
        /* Themed scrollbars for task creation modal */
        .task-modal-content::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .task-modal-content::-webkit-scrollbar-track {
          background: var(--accent-color, #d4e3d9);
          border-radius: 4px;
        }
        
        .task-modal-content::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)));
          border-radius: 4px;
          border: 1px solid var(--accent-color, #d4e3d9);
        }
        
        .task-modal-content::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover, linear-gradient(135deg, var(--secondary-color, #d6a461), var(--primary-color, #68a395)));
        }
        
        .task-modal-content::-webkit-scrollbar-corner {
          background: var(--accent-color, #d4e3d9);
        }
      `}</style>
      
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
        zIndex: 9999, // CHANGED: Higher z-index
        padding: '1rem'
      }}>
        <div 
          ref={modalRef}
          className="task-modal-content"
          style={{
            background: 'var(--background-color, #fff4ec)',
            borderRadius: '20px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--accent-color, #d4e3d9)',
            position: 'relative',
            cursor: dragState.isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Header */}
          <div 
            onMouseDown={handleMouseDown}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: '1px solid var(--accent-color, #d4e3d9)',
              background: 'var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)))',
              borderRadius: '20px 20px 0 0',
              color: 'white',
              cursor: 'grab',
              userSelect: 'none'
            }}
          >
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              fontFamily: 'var(--font-heading, "The Seasons"), "Playfair Display", serif'
            }}>
              Create New Task
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              AI-powered family task management
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Task Basics Section */}
          <section style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <h3 style={{
              color: 'var(--primary-color, #68a395)',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Task Basics
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-color, #5a4033)',
                marginBottom: '0.5rem'
              }}>
                What needs to be done?
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--accent-color, #d4e3d9)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color, #68a395)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--accent-color, #d4e3d9)'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-color, #5a4033)',
                marginBottom: '0.5rem'
              }}>
                Time Duration (Optional)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--accent-color, #d4e3d9)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option>No time limit</option>
                <option>5 minutes</option>
                <option>10 minutes</option>
                <option>15 minutes</option>
                <option>20 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
                <option>Custom duration</option>
              </select>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.25rem 0 0 0' }}>
                Set a time limit only if needed (like 30 minutes of math homework)
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-color, #5a4033)',
                marginBottom: '0.5rem'
              }}>
                Description & TaskBreaker Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--accent-color, #d4e3d9)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color, #68a395)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--accent-color, #d4e3d9)'}
              />
            </div>

            {/* AI Features */}
            <div style={{
              background: 'rgba(104, 163, 149, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                color: 'var(--primary-color, #68a395)',
                marginBottom: '0.75rem',
                fontSize: '1rem'
              }}>
                TaskBreaker AI Preview
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Based on your description, TaskBreaker will create smart subtasks...
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={generateSubtasks}
                  disabled={isGeneratingSubtasks}
                  style={{
                    background: 'var(--primary-color, #68a395)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: isGeneratingSubtasks ? 'not-allowed' : 'pointer',
                    opacity: isGeneratingSubtasks ? 0.7 : 1,
                    fontSize: '0.9rem'
                  }}
                >
                  {isGeneratingSubtasks ? 'Generating...' : 'Generate Subtasks Preview'}
                </button>
                
                <button
                  type="button"
                  onClick={organizeDescription}
                  style={{
                    background: 'transparent',
                    color: 'var(--primary-color, #68a395)',
                    border: '1px solid var(--primary-color, #68a395)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Organize Description as Checklist
                </button>
              </div>

              {/* Subtasks Preview */}
              {subtasks.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <h5 style={{ marginBottom: '0.75rem', color: 'var(--primary-color, #68a395)' }}>
                    AI-Generated Subtasks:
                  </h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {subtasks.map((subtask) => (
                      <li key={subtask.id} style={{
                        marginBottom: '0.5rem',
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                        opacity: subtask.completed ? 0.6 : 1
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => toggleSubtaskComplete(subtask.id)}
                            style={{ accentColor: 'var(--primary-color, #68a395)' }}
                          />
                          <span
                            onClick={() => generateMiniSteps(subtask.id)}
                            style={{
                              cursor: 'pointer',
                              flex: 1,
                              fontSize: '0.9rem'
                            }}
                          >
                            {subtask.text}
                          </span>
                        </div>
                        {subtask.showMiniSteps && subtask.miniSteps.length > 0 && (
                          <ul style={{
                            marginLeft: '1.5rem',
                            marginTop: '0.5rem',
                            fontSize: '0.8rem',
                            opacity: 0.8
                          }}>
                            {subtask.miniSteps.map((step, index) => (
                              <li key={index} style={{ marginBottom: '0.25rem' }}>
                                {step}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description Checklist */}
              {descriptionChecklist.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <h5 style={{ marginBottom: '0.75rem', color: 'var(--primary-color, #68a395)' }}>
                    Description Checklist:
                  </h5>
                  {descriptionChecklist.map((item, index) => (
                    <label key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      <input
                        type="checkbox"
                        style={{ accentColor: 'var(--primary-color, #68a395)' }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={saveTemplate}
                onChange={(e) => setSaveTemplate(e.target.checked)}
                style={{ accentColor: 'var(--primary-color, #68a395)' }}
              />
              Save as reusable/reassignable template
            </label>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.25rem 0 0 0' }}>
              Create a template that can be assigned to different family members for different time periods
            </p>
          </section>

          {/* Task Type Section */}
          <section style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <h3 style={{
              color: 'var(--primary-color, #68a395)',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Task Type
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setTaskType('task')}
                style={{
                  background: taskType === 'task' 
                    ? 'var(--primary-color, #68a395)' 
                    : 'var(--accent-color, #d4e3d9)',
                  color: taskType === 'task' ? 'white' : 'var(--text-color, #5a4033)',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => setTaskType('opportunity')}
                style={{
                  background: taskType === 'opportunity' 
                    ? 'var(--primary-color, #68a395)' 
                    : 'var(--accent-color, #d4e3d9)',
                  color: taskType === 'opportunity' ? 'white' : 'var(--text-color, #5a4033)',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Opportunity
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTaskTypeDescription(!showTaskTypeDescription)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color, #68a395)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginBottom: '0.5rem'
              }}
            >
              {showTaskTypeDescription ? '▼' : '▶'} Tasks vs Opportunities
            </button>

            {showTaskTypeDescription && (
              <div style={{
                background: 'rgba(104, 163, 149, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Tasks:</strong> Required responsibilities (chores, homework, routines) that count toward family expectations.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Opportunities:</strong> Optional goals (read a book, learn a skill, creative projects, bonus chores, or extra jobs) that provide rewards when completed but don't create pressure if ignored.
                </p>
              </div>
            )}
          </section>

          {/* Assignment Section */}
          <section style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <h3 style={{
              color: 'var(--primary-color, #68a395)',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Who's Responsible?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {membersToUse.map((member) => (
                <label key={member.id || member.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={assignees.includes(member.value)}
                    onChange={(e) => handleAssigneeChange(member.value, e.target.checked)}
                    style={{ accentColor: 'var(--primary-color, #68a395)' }}
                  />
                  {member.name ? `${member.name}${member.age ? ` (Age ${member.age})` : ''}` : member.value}
                </label>
              ))}
            </div>
          </section>

          {/* Frequency Section */}
          <section style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <h3 style={{
              color: 'var(--primary-color, #68a395)',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              How Often?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { value: 'one-time', label: 'One-Time Task - Something that needs to be done once' },
                { value: 'daily', label: 'Daily - Every day (like morning routines)' },
                { value: 'weekly', label: 'Weekly Recurrence (like chores or activities)' },
                { value: 'custom', label: 'Custom Schedule - Specific days or flexible timing' }
              ].map((option) => (
                <label key={option.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={frequency === option.value}
                    onChange={(e) => setFrequency(e.target.value)}
                    style={{ accentColor: 'var(--primary-color, #68a395)' }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          {/* Incomplete Action Section */}
          <section style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <h3 style={{
              color: 'var(--primary-color, #68a395)',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              What happens if not completed?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { value: 'auto-disappear', label: 'Auto-Disappear - Task vanishes if not done - fresh start each day (great for daily routines)' },
                { value: 'allow-late', label: 'Allow Late Completion - Can be marked done after the day passes (good for flexible chores)' },
                { value: 'auto-reschedule', label: 'Auto-Reschedule - Moves to next available day/time slot (helpful for important but flexible tasks)' },
                { value: 'require-decision', label: 'Require Decision - Goes to Deadline Central for manual sorting (best for school/deadline tasks)' }
              ].map((option) => (
                <label key={option.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="incompleteAction"
                    value={option.value}
                    checked={incompleteAction === option.value}
                    onChange={(e) => setIncompleteAction(e.target.value)}
                    style={{ accentColor: 'var(--primary-color, #68a395)' }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          {/* Rewards Section */}
          <section style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <h3 style={{
              color: 'var(--primary-color, #68a395)',
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Rewards & Completion Tracking
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-color, #5a4033)',
                marginBottom: '0.5rem'
              }}>
                Reward Type
              </label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--accent-color, #d4e3d9)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option value="none">None</option>
                <option value="stars">Stars</option>
                <option value="points">Points</option>
                <option value="money">Money</option>
                <option value="privilege">Special Privilege</option>
                <option value="family">Family Reward</option>
              </select>
            </div>

            {rewardType !== 'none' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}>
                  Amount/Value
                </label>
                <input
                  type="text"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--accent-color, #d4e3d9)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            )}

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                style={{ accentColor: 'var(--primary-color, #68a395)' }}
              />
              Require parent approval before reward
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                checked={trackTask}
                onChange={(e) => setTrackTask(e.target.checked)}
                style={{ accentColor: 'var(--primary-color, #68a395)' }}
              />
              Track this task?
            </label>

            {trackTask && (
              <div style={{
                background: 'rgba(104, 163, 149, 0.1)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  Mark all that apply:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 'completion_percentage', label: 'Track completion percentage' },
                    { value: 'completion_streaks', label: 'Track completion streaks' },
                    { value: 'times_completed', label: 'Track times completed' },
                    { value: 'estimated_time', label: 'Track estimated time spent' }
                  ].map((option) => (
                    <label key={option.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={trackingOptions.includes(option.value)}
                        onChange={(e) => handleTrackingOptionChange(option.value, e.target.checked)}
                        style={{ accentColor: 'var(--primary-color, #68a395)' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {trackingOptions.includes('estimated_time') && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-color, #5a4033)',
                      marginBottom: '0.5rem'
                    }}>
                      Estimated time to complete (minutes)
                    </label>
                    <input
                      type="number"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                      min="1"
                      placeholder="e.g. 15"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--accent-color, #d4e3d9)',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Form Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px solid var(--accent-color, #d4e3d9)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: 'var(--text-color, #5a4033)',
                border: '1px solid var(--accent-color, #d4e3d9)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
    </>,
    document.getElementById('modal-root') || document.body
  );
};

export default TaskCreationModal;