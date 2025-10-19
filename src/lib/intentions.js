// src/lib/intentions.js - Best Intentions API Layer
import { supabase } from './supabase';
import { bestIntentionsService } from './bestIntentionsService';

// FUNCTION 1: Get all intentions for a family
export async function getFamilyIntentions(familyId) {
  const { data, error } = await supabase
    .from('best_intentions')
    .select(`
      *,
      intention_categories (
        id,
        display_name,
        icon,
        color_hex,
        category_type
      )
    `)
    .eq('family_id', familyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// FUNCTION 2: Get intentions by category
export async function getIntentionsByCategory(familyId, categoryId) {
  const { data, error } = await supabase
    .from('best_intentions')
    .select(`
      *,
      intention_categories (
        id,
        display_name,
        icon,
        color_hex,
        category_type
      )
    `)
    .eq('family_id', familyId)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// FUNCTION 3: Create new intention
export async function createIntention(intentionData) {
  const { data, error } = await supabase
    .from('best_intentions')
    .insert({
      family_id: intentionData.family_id,
      created_by: intentionData.created_by,
      title: intentionData.title,
      current_state: intentionData.current_state,
      desired_state: intentionData.desired_state,
      why_it_matters: intentionData.why_it_matters,
      category_id: intentionData.category_id,
      priority: intentionData.priority || 'medium',
      privacy_level: intentionData.privacy_level || 'family',
      status: 'active'
    })
    .select(`
      *,
      intention_categories (
        id,
        display_name,
        icon,
        color_hex,
        category_type
      )
    `)
    .single();

  if (error) throw error;

  // Sync to Family Archives system
  try {
    await bestIntentionsService.syncBestIntentionToArchive(data.id);
  } catch (syncError) {
    console.error('Failed to sync Best Intention to Archives:', syncError);
    // Don't throw - intention was created successfully
  }

  return data;
}

// FUNCTION 4: Update intention
export async function updateIntention(intentionId, updates) {
  const { data, error } = await supabase
    .from('best_intentions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', intentionId)
    .select(`
      *,
      intention_categories (
        id,
        display_name,
        icon,
        color_hex,
        category_type
      )
    `)
    .single();

  if (error) throw error;

  // Sync to Family Archives system
  try {
    await bestIntentionsService.syncBestIntentionToArchive(intentionId);
  } catch (syncError) {
    console.error('Failed to sync Best Intention to Archives:', syncError);
    // Don't throw - intention was updated successfully
  }

  return data;
}

// FUNCTION 5: Delete (soft delete) intention
export async function deleteIntention(intentionId) {
  const { error } = await supabase
    .from('best_intentions')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', intentionId);
  
  if (error) throw error;
  return true;
}

// FUNCTION 6: Get intention by ID
export async function getIntentionById(intentionId) {
  const { data, error } = await supabase
    .from('best_intentions')
    .select(`
      *,
      intention_categories (
        id,
        display_name,
        icon,
        color_hex,
        category_type
      )
    `)
    .eq('id', intentionId)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
}

// FUNCTION 7: Update intention status
export async function updateIntentionStatus(intentionId, status) {
  const { data, error } = await supabase
    .from('best_intentions')
    .update({ 
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', intentionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// FUNCTION 8: Get intention statistics
export async function getIntentionStats(familyId) {
  const { data, error } = await supabase
    .from('best_intentions')
    .select('status, priority, category_id')
    .eq('family_id', familyId)
    .eq('is_active', true);
  
  if (error) return { total: 0, byStatus: {}, byPriority: {}, byCategory: {} };
  
  const stats = {
    total: data.length,
    byStatus: {},
    byPriority: {},
    byCategory: {}
  };
  
  data.forEach(intention => {
    // Count by status
    stats.byStatus[intention.status] = (stats.byStatus[intention.status] || 0) + 1;
    
    // Count by priority
    stats.byPriority[intention.priority] = (stats.byPriority[intention.priority] || 0) + 1;
    
    // Count by category
    if (intention.category_id) {
      stats.byCategory[intention.category_id] = (stats.byCategory[intention.category_id] || 0) + 1;
    }
  });
  
  return stats;
}