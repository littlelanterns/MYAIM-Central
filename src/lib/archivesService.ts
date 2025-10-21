// src/lib/archivesService.ts - Archives CRUD operations

import { supabase } from './supabase';
import type {
  ArchiveFolder,
  ArchiveContextItem,
  CreateFolderRequest,
  CreateContextItemRequest,
  UpdateContextItemRequest
} from '../types/archives';

export const archivesService = {
  // ============================================================
  // FOLDERS
  // ============================================================

  /**
   * Get all folders for the current user's family
   */
  async getFolders(): Promise<ArchiveFolder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user's family_id
    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const { data, error } = await supabase
      .from('archive_folders')
      .select('*')
      .eq('family_id', memberData.family_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single folder by ID
   */
  async getFolder(folderId: string): Promise<ArchiveFolder | null> {
    const { data, error } = await supabase
      .from('archive_folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get folders by parent ID (for hierarchical display)
   */
  async getFoldersByParent(parentId: string | null): Promise<ArchiveFolder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const query = supabase
      .from('archive_folders')
      .select('*')
      .eq('family_id', memberData.family_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (parentId === null) {
      query.is('parent_folder_id', null);
    } else {
      query.eq('parent_folder_id', parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new folder
   */
  async createFolder(folderData: CreateFolderRequest): Promise<ArchiveFolder> {
    const { data, error } = await supabase
      .from('archive_folders')
      .insert([folderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing folder
   */
  async updateFolder(
    folderId: string,
    updates: Partial<CreateFolderRequest>
  ): Promise<ArchiveFolder> {
    const { data, error } = await supabase
      .from('archive_folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update folder color
   */
  async updateFolderColor(folderId: string, colorHex: string): Promise<void> {
    const { error } = await supabase
      .from('archive_folders')
      .update({
        color_hex: colorHex,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId);

    if (error) throw error;
  },

  /**
   * Soft delete a folder (set is_active = false)
   */
  async deleteFolder(folderId: string): Promise<void> {
    const { error } = await supabase
      .from('archive_folders')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', folderId);

    if (error) throw error;
  },

  /**
   * Hard delete a folder (permanent)
   */
  async permanentlyDeleteFolder(folderId: string): Promise<void> {
    const { error } = await supabase
      .from('archive_folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;
  },

  // ============================================================
  // CONTEXT ITEMS
  // ============================================================

  /**
   * Get all context items for a folder
   */
  async getContextItems(folderId: string): Promise<ArchiveContextItem[]> {
    const { data, error } = await supabase
      .from('archive_context_items')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all ACTIVE context items for a folder (use_for_context = true)
   */
  async getActiveContextItems(folderId: string): Promise<ArchiveContextItem[]> {
    const { data, error } = await supabase
      .from('archive_context_items')
      .select('*')
      .eq('folder_id', folderId)
      .eq('use_for_context', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new context item
   */
  async addContextItem(itemData: CreateContextItemRequest): Promise<ArchiveContextItem> {
    const { data, error } = await supabase
      .from('archive_context_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a context item
   */
  async updateContextItem(
    itemId: string,
    updates: UpdateContextItemRequest
  ): Promise<ArchiveContextItem> {
    const { data, error } = await supabase
      .from('archive_context_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Toggle use_for_context checkbox
   */
  async toggleContextUsage(itemId: string, currentValue: boolean): Promise<ArchiveContextItem> {
    const { data, error } = await supabase
      .from('archive_context_items')
      .update({
        use_for_context: !currentValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a context item
   */
  async deleteContextItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('archive_context_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // ============================================================
  // CONTEXT RETRIEVAL (For LiLa)
  // ============================================================

  /**
   * Get all active context for a member (with inheritance)
   * Uses the database function created in migration
   */
  async getMemberContextWithInheritance(memberId: string): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('get_member_context_with_inheritance', {
        member_uuid: memberId
      });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all active context for the entire family
   * Uses the database function created in migration
   */
  async getFamilyContext(familyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('get_family_context', {
        p_family_id: familyId
      });

    if (error) throw error;
    return data || [];
  },

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
  // BULK OPERATIONS
  // ============================================================

  /**
   * Add multiple context items at once (for interview completion)
   */
  async addMultipleContextItems(items: CreateContextItemRequest[]): Promise<ArchiveContextItem[]> {
    const { data, error } = await supabase
      .from('archive_context_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Update folder sort order
   */
  async updateFolderSortOrder(updates: Array<{ id: string; sort_order: number }>): Promise<void> {
    // Update each folder's sort order
    const promises = updates.map(({ id, sort_order }) =>
      supabase
        .from('archive_folders')
        .update({ sort_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      throw new Error(`Failed to update sort order for ${errors.length} folders`);
    }
  },

  // ============================================================
  // MASTER FOLDER OPERATIONS
  // ============================================================

  /**
   * Get all master folders for the current user's family
   * For development: uses hardcoded ADMIN family if not authenticated
   */
  async getMasterFolders(): Promise<ArchiveFolder[]> {
    const ADMIN_FAMILY_ID = 'cfb3dd22-ad35-48a5-8757-3ffcceab6ebe';

    // Try to get authenticated user's family
    const { data: { user } } = await supabase.auth.getUser();

    let familyId = ADMIN_FAMILY_ID; // Default to ADMIN family for development

    if (user) {
      const { data: memberData } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('auth_user_id', user.id)
        .single();

      if (memberData) {
        familyId = memberData.family_id;
      }
    }

    const { data, error } = await supabase
      .from('archive_folders')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_master', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get subfolders for a specific parent folder
   */
  async getSubfolders(parentFolderId: string): Promise<ArchiveFolder[]> {
    const { data, error } = await supabase
      .from('archive_folders')
      .select('*')
      .eq('parent_folder_id', parentFolderId)
      .eq('is_active', true)
      .order('folder_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a subfolder under a master folder
   */
  async createSubfolder(folderData: {
    parent_folder_id: string;
    folder_name: string;
    folder_type: string;
    icon: string;
    description?: string;
    color_hex?: string;
  }): Promise<ArchiveFolder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const { data, error} = await supabase
      .from('archive_folders')
      .insert([{
        family_id: memberData.family_id,
        parent_folder_id: folderData.parent_folder_id,
        folder_name: folderData.folder_name,
        folder_type: folderData.folder_type,
        icon: folderData.icon,
        description: folderData.description || null,
        color_hex: folderData.color_hex || '#68a395',
        is_master: false,
        required_tier: 'full_magic'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get current user's subscription tier
   */
  async getUserTier(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    const { data, error } = await supabase
      .from('families')
      .select('subscription_tier')
      .eq('id', memberData.family_id)
      .single();

    if (error) throw error;
    return data?.subscription_tier || 'essential';
  }
};
