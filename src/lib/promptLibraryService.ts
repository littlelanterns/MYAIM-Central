// src/lib/promptLibraryService.ts - Prompt Library CRUD operations

import { supabase } from './supabase';
import type { PersonalPrompt, CreatePromptRequest } from '../types/archives';

export const promptLibraryService = {
  // ============================================================
  // QUERY OPERATIONS
  // ============================================================

  /**
   * Get all prompts for the current user's family
   * @param includeArchived - Whether to include archived prompts (default: false)
   */
  async getPrompts(includeArchived = false): Promise<PersonalPrompt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user's family_id
    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const query = supabase
      .from('personal_prompt_library')
      .select('*')
      .eq('family_id', memberData.family_id);

    if (!includeArchived) {
      query.eq('is_archived', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single prompt by ID
   */
  async getPrompt(promptId: string): Promise<PersonalPrompt | null> {
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .select('*')
      .eq('id', promptId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get prompts by category
   */
  async getPromptsByCategory(category: string, includeArchived = false): Promise<PersonalPrompt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const query = supabase
      .from('personal_prompt_library')
      .select('*')
      .eq('family_id', memberData.family_id)
      .eq('category', category);

    if (!includeArchived) {
      query.eq('is_archived', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get favorite prompts
   */
  async getFavoritePrompts(): Promise<PersonalPrompt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const { data, error } = await supabase
      .from('personal_prompt_library')
      .select('*')
      .eq('family_id', memberData.family_id)
      .eq('is_favorite', true)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Search prompts by title or tags
   */
  async searchPrompts(searchTerm: string): Promise<PersonalPrompt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    // Search in title and tags
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .select('*')
      .eq('family_id', memberData.family_id)
      .eq('is_archived', false)
      .or(`prompt_title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ============================================================
  // CREATE / UPDATE OPERATIONS
  // ============================================================

  /**
   * Create a new prompt
   */
  async createPrompt(promptData: CreatePromptRequest): Promise<PersonalPrompt> {
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .insert([promptData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing prompt
   */
  async updatePrompt(
    promptId: string,
    updates: Partial<CreatePromptRequest>
  ): Promise<PersonalPrompt> {
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // TOGGLE OPERATIONS
  // ============================================================

  /**
   * Toggle favorite status
   */
  async toggleFavorite(promptId: string, currentValue: boolean): Promise<PersonalPrompt> {
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .update({
        is_favorite: !currentValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // ARCHIVE OPERATIONS
  // ============================================================

  /**
   * Archive a prompt
   */
  async archivePrompt(promptId: string): Promise<PersonalPrompt> {
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Unarchive a prompt
   */
  async unarchivePrompt(promptId: string): Promise<PersonalPrompt> {
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .update({
        is_archived: false,
        archived_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // DELETE OPERATIONS
  // ============================================================

  /**
   * Permanently delete a prompt
   */
  async deletePrompt(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('personal_prompt_library')
      .delete()
      .eq('id', promptId);

    if (error) throw error;
  },

  // ============================================================
  // USAGE TRACKING
  // ============================================================

  /**
   * Increment usage count and update last_used_at
   */
  async incrementUsage(promptId: string): Promise<PersonalPrompt> {
    // Get current usage count
    const { data: prompt } = await supabase
      .from('personal_prompt_library')
      .select('times_used')
      .eq('id', promptId)
      .single();

    // Update usage
    const { data, error } = await supabase
      .from('personal_prompt_library')
      .update({
        times_used: (prompt?.times_used || 0) + 1,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Get current user's family ID
   */
  async getCurrentFamilyId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');
    return memberData.family_id;
  },

  /**
   * Get current user's member ID
   */
  async getCurrentMemberId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');
    return memberData.id;
  },

  // ============================================================
  // STATISTICS
  // ============================================================

  /**
   * Get prompt library statistics
   */
  async getStatistics(): Promise<{
    total: number;
    favorites: number;
    archived: number;
    byCategory: Record<string, number>;
    mostUsed: PersonalPrompt[];
  }> {
    const allPrompts = await this.getPrompts(true); // Include archived
    const favorites = allPrompts.filter(p => p.is_favorite && !p.is_archived);
    const archived = allPrompts.filter(p => p.is_archived);

    // Count by category
    const byCategory: Record<string, number> = {};
    allPrompts
      .filter(p => !p.is_archived)
      .forEach(p => {
        const category = p.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });

    // Get most used (top 5)
    const mostUsed = [...allPrompts]
      .filter(p => !p.is_archived)
      .sort((a, b) => b.times_used - a.times_used)
      .slice(0, 5);

    return {
      total: allPrompts.filter(p => !p.is_archived).length,
      favorites: favorites.length,
      archived: archived.length,
      byCategory,
      mostUsed
    };
  }
};
