import React, { useState, useEffect } from 'react';
import { getFamilyMembers, getFamilyByUserId, getFamilyRewardTypes, saveTaskWithRewards } from '../../lib/api';
import './TaskCreationForm.css';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  access_level: string;
}

interface TaskFormData {
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface RewardData {
  reward_type: string;
  reward_amount: string;
}

const TaskCreationForm: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familyRewardTypes, setFamilyRewardTypes] = useState<any[]>([]);
  const [rewardData, setRewardData] = useState<RewardData>({
    reward_type: 'none',
    reward_amount: ''
  });
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assigned_to: '',
    assigned_by: '',
    due_date: '',
    priority: 'medium',
    category: 'general'
  });

  // Mock current user - in real app this would come from auth
  const currentUserId = 1;

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      // Get family info for current user
      const familyResult = await getFamilyByUserId(currentUserId);
      if (familyResult.success && familyResult.family) {
        setFamilyId(familyResult.family.id);
        
        // Get family members
        const membersResult = await getFamilyMembers(familyResult.family.id);
        if (membersResult.success && membersResult.members) {
          setFamilyMembers(membersResult.members);
          
          // Set current user as the one assigning the task
          const currentMember = membersResult.members.find(m => 
            m.role === 'self' || m.name.toLowerCase().includes('mom') || m.name.toLowerCase().includes('parent')
          );
          if (currentMember) {
            setFormData(prev => ({ ...prev, assigned_by: currentMember.id }));
          }
        }
        
        // Get family reward types
        const rewardTypesResult = await getFamilyRewardTypes(familyResult.family.id);
        if (rewardTypesResult.success && rewardTypesResult.rewardTypes) {
          setFamilyRewardTypes(rewardTypesResult.rewardTypes);
        }
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRewardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRewardData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId || !formData.title.trim() || !formData.assigned_to) return;

    setSaving(true);
    try {
      const taskData = {
        ...formData,
        family_id: familyId,
        status: 'pending'
      };

      // Prepare reward data if rewards are set
      const rewardInfo = rewardData.reward_type !== 'none' && rewardData.reward_amount ? {
        [rewardData.reward_type]: {
          amount: parseInt(rewardData.reward_amount) || 0,
          bonusThreshold: 0.85, // Default 85% for bonus
          bonusAmount: Math.floor((parseInt(rewardData.reward_amount) || 0) * 0.2) // 20% bonus
        }
      } : {};

      const result = await saveTaskWithRewards(taskData, rewardInfo);
      if (result.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          assigned_to: '',
          assigned_by: formData.assigned_by, // Keep the assigner
          due_date: '',
          priority: 'medium',
          category: 'general'
        });
        setRewardData({
          reward_type: 'none',
          reward_amount: ''
        });
        alert('Task created successfully!');
      } else {
        alert('Failed to create task: ' + (result as any).error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading family members...</div>;
  }

  if (familyMembers.length === 0) {
    return (
      <div>
        <h2>Task Creation Form</h2>
        <p>No family members found. Please set up your family in Settings first.</p>
      </div>
    );
  }

  return (
    <div className="task-creation-form">
      <h2>Create New Task</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="What needs to be done?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Additional details about the task..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="assigned_to">Assign To *</label>
          <select
            id="assigned_to"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleInputChange}
            required
          >
            <option value="">Select family member</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role}) {member.age ? `- ${member.age} years old` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="general">General</option>
            <option value="chores">Chores</option>
            <option value="homework">Homework</option>
            <option value="personal">Personal Care</option>
            <option value="family">Family Time</option>
            <option value="outdoor">Outdoor Activities</option>
            <option value="creative">Creative Projects</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="reward_type">Reward Type</label>
          <select
            id="reward_type"
            name="reward_type"
            value={rewardData.reward_type}
            onChange={handleRewardChange}
          >
            <option value="none">None</option>
            {familyRewardTypes.length > 0 ? (
              familyRewardTypes.map(type => (
                <option key={type.reward_type} value={type.reward_type}>
                  {type.display_name}
                </option>
              ))
            ) : (
              <>
                <option value="stars">Stars</option>
                <option value="points">Points</option>
                <option value="money">Money</option>
                <option value="privileges">Special Privilege</option>
                <option value="family_rewards">Family Reward</option>
              </>
            )}
          </select>
        </div>

        {rewardData.reward_type !== 'none' && (
          <div className="form-group">
            <label htmlFor="reward_amount">Reward Amount</label>
            <input
              type="number"
              id="reward_amount"
              name="reward_amount"
              value={rewardData.reward_amount}
              onChange={handleRewardChange}
              placeholder="Enter reward amount"
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={saving || !formData.title.trim() || !formData.assigned_to}>
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>

      <div className="family-info">
        <h3>Family Members Available:</h3>
        <ul>
          {familyMembers.map(member => (
            <li key={member.id}>
              <strong>{member.name}</strong> - {member.role} 
              {member.age && ` (${member.age} years old)`} - {member.access_level} access
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskCreationForm;