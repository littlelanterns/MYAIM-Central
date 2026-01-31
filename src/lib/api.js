// src/lib/api.js - Enhanced with family setup functions
import { supabase } from './supabase';

// Existing function
export async function getTasksForFamily(familyId) {
  console.log('Fetching tasks for family:', familyId);
  // Real database logic will go here
  return []; // Return empty array for now
}

// NEW: Save family setup (family name and basic info)
export async function saveFamilySetup(familyData) {
  try {
    console.log('Saving family setup:', familyData);
    
    // First, check if family already exists for this user
    const { data: existingFamily, error: checkError } = await supabase
      .from('families')
      .select('id')
      .eq('auth_user_id', familyData.auth_user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let familyId;
    
    if (existingFamily) {
      // Update existing family
      const { data, error } = await supabase
        .from('families')
        .update({
          family_name: familyData.family_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingFamily.id)
        .select()
        .single();
        
      if (error) throw error;
      familyId = data.id;
    } else {
      // Create new family
      const { data, error } = await supabase
        .from('families')
        .insert([{
          auth_user_id: familyData.auth_user_id,
          family_login_name: familyData.family_login_name || null,
          family_name: familyData.family_name,
          subscription_tier: familyData.subscription_tier || 'basic'
        }])
        .select()
        .single();
        
      if (error) throw error;
      familyId = data.id;
      
      // Initialize default reward types for new family
      await initializeFamilyRewardTypes(familyId);
    }

    return { success: true, familyId };
  } catch (error) {
    console.error('Error saving family setup:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Save individual family member
export async function saveFamilyMember(memberData) {
  try {
    console.log('Saving family member:', memberData);
    
    // Calculate age from birthday if provided
    let age = null;
    if (memberData.birthday) {
      const birthDate = new Date(memberData.birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Prepare member data for database
    const dbMemberData = {
      family_id: memberData.family_id,
      name: memberData.name,
      role: memberData.relationship === 'special' ? memberData.customRole : memberData.relationship,
      age: age,
      birthday: memberData.birthday || null,
      nicknames: memberData.nicknames || [],
      access_level: memberData.accessLevel || 'guided',
      dashboard_type: memberData.dashboard_type || 'guided',
      pin: memberData.pin || null,
      in_household: memberData.inHousehold !== undefined ? memberData.inHousehold : true,
      permissions: memberData.permissions || {},
      notes: memberData.notes || ''
    };

    if (memberData.id && typeof memberData.id === 'string' && memberData.id.includes('-')) {
      // This is an existing member with a real UUID - update
      const { data, error } = await supabase
        .from('family_members')
        .update(dbMemberData)
        .eq('id', memberData.id)
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, member: data };
    } else {
      // This is a new member - insert
      const { data, error } = await supabase
        .from('family_members')
        .insert([dbMemberData])
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, member: data };
    }
  } catch (error) {
    console.error('Error saving family member:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Get family members for a family
export async function getFamilyMembers(familyId) {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return { success: true, members: data };
  } catch (error) {
    console.error('Error fetching family members:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Get family info by user ID
export async function getFamilyByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('auth_user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, family: data };
  } catch (error) {
    console.error('Error fetching family:', error);
    return { success: false, error: error.message };
  }
}

// NEW: Delete family member
export async function deleteFamilyMember(memberId) {
  try {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting family member:', error);
    return { success: false, error: error.message };
  }
}

// TASK MANAGEMENT API FUNCTIONS

// Get tasks for a family
export async function getTasks(familyId) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { success: true, tasks: data };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: error.message };
  }
}

// Save or update a task
export async function saveTask(taskData) {
  try {
    console.log('Saving task:', taskData);
    
    if (taskData.id && typeof taskData.id === 'string' && taskData.id.includes('-')) {
      // Update existing task
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assigned_to,
          assigned_by: taskData.assigned_by,
          status: taskData.status,
          due_date: taskData.due_date,
          priority: taskData.priority,
          category: taskData.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskData.id)
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, task: data };
    } else {
      // Create new task
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          family_id: taskData.family_id,
          title: taskData.title,
          description: taskData.description || '',
          assigned_to: taskData.assigned_to,
          assigned_by: taskData.assigned_by,
          status: taskData.status || 'pending',
          due_date: taskData.due_date,
          priority: taskData.priority || 'medium',
          category: taskData.category || 'general'
        }])
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, task: data };
    }
  } catch (error) {
    console.error('Error saving task:', error);
    return { success: false, error: error.message };
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
}

// Complete a task
export async function completeTask(taskId, completedBy) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: completedBy
      })
      .eq('id', taskId)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, task: data };
  } catch (error) {
    console.error('Error completing task:', error);
    return { success: false, error: error.message };
  }
}

// PERMISSION MANAGEMENT API FUNCTIONS

// Save user permissions 
export async function saveUserPermissions(userId, permissions) {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .upsert([{
        user_id: userId,
        permissions: permissions,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, permissions: data };
  } catch (error) {
    console.error('Error saving permissions:', error);
    return { success: false, error: error.message };
  }
}

// Get user permissions
export async function getUserPermissions(userId) {
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permissions')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, permissions: data?.permissions || {} };
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return { success: false, error: error.message };
  }
}

// REWARD SYSTEM API FUNCTIONS

// Get family reward types (configured currency types for a family)
export async function getFamilyRewardTypes(familyId) {
  try {
    const { data, error } = await supabase
      .from('family_reward_types')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('reward_type');
      
    if (error) throw error;
    return { success: true, rewardTypes: data };
  } catch (error) {
    console.error('Error fetching family reward types:', error);
    return { success: false, error: error.message };
  }
}

// Initialize default reward types for a new family
export async function initializeFamilyRewardTypes(familyId) {
  try {
    const defaultTypes = [
      { reward_type: 'stars', display_name: 'Gold Stars', icon: 'star', color: '#FFD700' },
      { reward_type: 'points', display_name: 'House Points', icon: 'trophy', color: '#4CAF50' },
      { reward_type: 'money', display_name: 'Allowance Money', icon: 'dollar-sign', color: '#2E7D32' },
      { reward_type: 'privileges', display_name: 'Special Privileges', icon: 'crown', color: '#9C27B0' },
      { reward_type: 'family_rewards', display_name: 'Family Activities', icon: 'users', color: '#FF5722' }
    ];

    const insertData = defaultTypes.map(type => ({
      family_id: familyId,
      ...type
    }));

    const { data, error } = await supabase
      .from('family_reward_types')
      .insert(insertData)
      .select();
      
    if (error) throw error;
    return { success: true, rewardTypes: data };
  } catch (error) {
    console.error('Error initializing family reward types:', error);
    return { success: false, error: error.message };
  }
}

// Save task with rewards
export async function saveTaskWithRewards(taskData, rewardData) {
  try {
    console.log('Saving task with rewards:', { taskData, rewardData });
    
    // Save the task first
    const taskResult = await saveTask(taskData);
    if (!taskResult.success) {
      return taskResult;
    }

    // Save task rewards if any
    if (rewardData && Object.keys(rewardData).length > 0) {
      const rewardInserts = Object.entries(rewardData).map(([rewardType, config]) => ({
        task_id: taskResult.task.id,
        reward_type: rewardType,
        reward_amount: config.amount || 0,
        bonus_threshold: config.bonusThreshold || null,
        bonus_amount: config.bonusAmount || 0
      }));

      const { data: rewardInsertData, error: rewardError } = await supabase
        .from('task_rewards')
        .insert(rewardInserts)
        .select();
        
      if (rewardError) throw rewardError;
      
      return { success: true, task: taskResult.task, rewards: rewardInsertData };
    }

    return taskResult;
  } catch (error) {
    console.error('Error saving task with rewards:', error);
    return { success: false, error: error.message };
  }
}

// Get member reward balances
export async function getMemberRewardBalances(familyMemberId) {
  try {
    const { data, error } = await supabase
      .from('member_reward_balances')
      .select('*')
      .eq('family_member_id', familyMemberId);
      
    if (error) throw error;
    return { success: true, balances: data };
  } catch (error) {
    console.error('Error fetching member reward balances:', error);
    return { success: false, error: error.message };
  }
}

// Get family reward balances for all members
export async function getFamilyRewardBalances(familyId) {
  try {
    const { data, error } = await supabase
      .from('member_reward_balances')
      .select(`
        *,
        family_members:family_member_id (
          id,
          name,
          role
        )
      `)
      .in('family_member_id', 
        supabase
          .from('family_members')
          .select('id')
          .eq('family_id', familyId)
      );
      
    if (error) throw error;
    return { success: true, balances: data };
  } catch (error) {
    console.error('Error fetching family reward balances:', error);
    return { success: false, error: error.message };
  }
}

// Add reward transaction (earning or spending)
export async function addRewardTransaction(transactionData) {
  try {
    const { data, error } = await supabase
      .from('reward_transactions')
      .insert([{
        family_member_id: transactionData.family_member_id,
        reward_type: transactionData.reward_type,
        transaction_type: transactionData.transaction_type, // 'earned', 'spent', 'bonus', 'penalty'
        amount: transactionData.amount,
        source_type: transactionData.source_type, // 'task_completion', 'manual_adjustment', etc.
        source_id: transactionData.source_id,
        description: transactionData.description,
        created_by: transactionData.created_by
      }])
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, transaction: data };
  } catch (error) {
    console.error('Error adding reward transaction:', error);
    return { success: false, error: error.message };
  }
}

// Get reward transaction history
export async function getRewardTransactions(familyMemberId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('reward_transactions')
      .select('*')
      .eq('family_member_id', familyMemberId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return { success: true, transactions: data };
  } catch (error) {
    console.error('Error fetching reward transactions:', error);
    return { success: false, error: error.message };
  }
}

// Complete task and award rewards
export async function completeTaskWithRewards(taskId, completedBy, completionPercentage = 100) {
  try {
    // Complete the task
    const taskResult = await completeTask(taskId, completedBy);
    if (!taskResult.success) {
      return taskResult;
    }

    // Get task rewards
    const { data: taskRewards, error: rewardError } = await supabase
      .from('task_rewards')
      .select('*')
      .eq('task_id', taskId);
      
    if (rewardError) throw rewardError;

    // Award rewards based on completion percentage
    const rewardTransactions = [];
    for (const reward of taskRewards) {
      let earnedAmount = Math.floor((reward.reward_amount * completionPercentage) / 100);
      
      // Check for bonus
      if (reward.bonus_threshold && completionPercentage >= (reward.bonus_threshold * 100)) {
        earnedAmount += reward.bonus_amount;
      }

      if (earnedAmount > 0) {
        const transaction = await addRewardTransaction({
          family_member_id: completedBy,
          reward_type: reward.reward_type,
          transaction_type: 'earned',
          amount: earnedAmount,
          source_type: 'task_completion',
          source_id: taskId,
          description: `Earned from completing task: ${taskResult.task.title}`,
          created_by: completedBy
        });
        
        if (transaction.success) {
          rewardTransactions.push(transaction.transaction);
        }
      }
    }

    return { 
      success: true, 
      task: taskResult.task, 
      rewards: rewardTransactions 
    };
  } catch (error) {
    console.error('Error completing task with rewards:', error);
    return { success: false, error: error.message };
  }
}

// THEME PREFERENCES API FUNCTIONS

// Save user theme preference
export async function saveUserTheme(userId, themeName, themeType = 'personal') {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{
        user_id: userId,
        preference_type: 'theme',
        preference_value: { theme: themeName, type: themeType },
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, preference: data };
  } catch (error) {
    console.error('Error saving theme preference:', error);
    return { success: false, error: error.message };
  }
}

// Get user theme preference
export async function getUserTheme(userId) {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preference_value')
      .eq('user_id', userId)
      .eq('preference_type', 'theme')
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { 
      success: true, 
      theme: data?.preference_value?.theme || 'classic',
      type: data?.preference_value?.type || 'personal'
    };
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    return { success: false, error: error.message };
  }
}