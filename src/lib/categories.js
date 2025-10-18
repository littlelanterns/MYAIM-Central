// src/lib/categories.js - Categories API Layer
// Import supabase client
import { supabase } from './supabase';

// FUNCTION 1: Get all categories for a family
export async function getFamilyCategories(familyId) {
  console.log('🔍 [categories.js] getFamilyCategories called with familyId:', familyId);

  try {
    console.log('🔄 [categories.js] Attempting RPC call: get_family_categories');
    const { data, error } = await supabase
      .rpc('get_family_categories', { p_family_id: familyId });

    console.log('📥 [categories.js] RPC result:', { data, error });

    if (error) {
      console.warn('⚠️ [categories.js] RPC function failed, falling back to direct query:', error);
      console.warn('⚠️ [categories.js] Error code:', error.code, 'Message:', error.message);

      // Fallback: Try direct query if RPC function doesn't exist
      console.log('🔄 [categories.js] Attempting direct query to intention_categories table');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('intention_categories')
        .select('*')
        .or(`family_id.is.null,family_id.eq.${familyId}`)
        .order('sort_order', { ascending: true });

      console.log('📥 [categories.js] Fallback query result:', { fallbackData, fallbackError });
      console.log('📊 [categories.js] Fallback data count:', fallbackData?.length || 0);

      if (fallbackError) {
        console.error('❌ [categories.js] Fallback query failed:', fallbackError);
        throw fallbackError;
      }

      console.log('✅ [categories.js] Returning fallback data');
      return fallbackData;
    }

    console.log('✅ [categories.js] Returning RPC data');
    return data;
  } catch (err) {
    console.error('❌ [categories.js] getFamilyCategories completely failed:', err);
    console.error('❌ [categories.js] Error details:', {
      message: err?.message,
      code: err?.code,
      details: err?.details
    });

    console.log('🔄 [categories.js] Returning mock categories as final fallback');
    // Return mock categories for development
    return [
      {
        id: '1',
        category_name: 'family_relationships',
        display_name: 'Family Relationships',
        description: 'Intentions focused on strengthening family bonds',
        icon: '👨‍👩‍👧‍👦',
        color_hex: '#68a395',
        category_type: 'system_default',
        is_custom: false,
        sort_order: 1
      },
      {
        id: '2',
        category_name: 'personal_growth',
        display_name: 'Personal Growth',
        description: 'Individual development and learning goals',
        icon: '🌱',
        color_hex: '#d6a461',
        category_type: 'system_default',
        is_custom: false,
        sort_order: 2
      },
      {
        id: '3',
        category_name: 'household_culture',
        display_name: 'Household Culture',
        description: 'Creating positive family environment and traditions',
        icon: '🏡',
        color_hex: '#b99c34',
        category_type: 'system_default',
        is_custom: false,
        sort_order: 3
      }
    ];
  }
}

// FUNCTION 2: Create custom category
export async function createCustomCategory(familyId, categoryData) {
  const category_name = categoryData.display_name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const { data, error } = await supabase
    .from('intention_categories')
    .insert({
      family_id: familyId,
      category_name: category_name,
      display_name: categoryData.display_name,
      description: categoryData.description || null,
      icon: categoryData.icon || '📋',
      color_hex: categoryData.color_hex || '#68a395',
      category_type: 'custom',
      sort_order: categoryData.sort_order || 0
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// FUNCTION 3: Create guiding value category (for Inner Oracle later)
export async function createGuidingValueCategory(familyId, guidingValue, assessmentId) {
  const category_name = guidingValue
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
  
  const { data, error } = await supabase
    .from('intention_categories')
    .insert({
      family_id: familyId,
      category_name: category_name,
      display_name: guidingValue,
      description: `Intentions aligned with your core value: ${guidingValue}`,
      icon: '⭐',
      color_hex: '#D4A5A5',
      category_type: 'guiding_value',
      source_type: 'inner_oracle',
      source_id: assessmentId
    })
    .select()
    .single();
  
  if (error && error.code === '23505') return null; // Already exists
  if (error) throw error;
  return data;
}

// FUNCTION 4: Update category
export async function updateCategory(categoryId, updates) {
  const { data, error } = await supabase
    .from('intention_categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', categoryId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// FUNCTION 5: Delete (soft delete) category
export async function deleteCategory(categoryId) {
  const { error } = await supabase
    .from('intention_categories')
    .update({ is_active: false })
    .eq('id', categoryId);
  
  if (error) throw error;
  return true;
}

// FUNCTION 6: Check if category name is unique
export async function isCategoryNameUnique(familyId, categoryName) {
  const normalized = categoryName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
  
  const { data, error } = await supabase
    .from('intention_categories')
    .select('id')
    .eq('family_id', familyId)
    .eq('category_name', normalized)
    .single();
  
  if (error && error.code === 'PGRST116') return true; // No rows = unique
  return false;
}

// FUNCTION 7: Get category counts
export async function getCategoryCounts(familyId) {
  const { data, error } = await supabase
    .from('best_intentions')
    .select('category_id')
    .eq('family_id', familyId)
    .eq('is_active', true);
  
  if (error) return {};
  
  const counts = {};
  data.forEach(intention => {
    if (intention.category_id) {
      counts[intention.category_id] = (counts[intention.category_id] || 0) + 1;
    }
  });
  
  return counts;
}

// HELPER FUNCTION: Get category by ID
export async function getCategoryById(categoryId) {
  const { data, error } = await supabase
    .from('intention_categories')
    .select('*')
    .eq('id', categoryId)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
}

// HELPER FUNCTION: Get default categories only
export async function getSystemCategories() {
  const { data, error } = await supabase
    .from('intention_categories')
    .select('*')
    .is('family_id', null)
    .eq('category_type', 'system_default')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data;
}