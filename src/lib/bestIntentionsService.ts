// src/lib/bestIntentionsService.ts - Best Intentions integration with Archives

import { supabase } from './supabase';

export const bestIntentionsService = {
  /**
   * Sync a Best Intention to the Archives system
   * Creates/updates a folder under the Best Intentions master folder
   */
  async syncBestIntentionToArchive(intentionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user's family_id
    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    // Get the Best Intentions master folder
    const { data: masterFolder, error: masterError } = await supabase
      .from('archive_folders')
      .select('id')
      .eq('family_id', memberData.family_id)
      .eq('folder_type', 'master_best_intentions')
      .single();

    if (masterError || !masterFolder) {
      console.log('Best Intentions master folder not found (migration 007 may not be run yet)');
      return;
    }

    // Get the intention
    const { data: intention, error: intentionError } = await supabase
      .from('best_intentions')
      .select('*')
      .eq('id', intentionId)
      .single();

    if (intentionError || !intention) {
      throw new Error('Best Intention not found');
    }

    // Check if folder already exists for this intention
    let { data: intentionFolder } = await supabase
      .from('archive_folders')
      .select('id')
      .eq('parent_folder_id', masterFolder.id)
      .eq('folder_name', intention.title)
      .maybeSingle();

    if (!intentionFolder) {
      // Create folder for this intention
      const { data: newFolder, error: createError } = await supabase
        .from('archive_folders')
        .insert({
          family_id: memberData.family_id,
          parent_folder_id: masterFolder.id,
          folder_name: intention.title,
          folder_type: 'best_intention_item',
          icon: '🎯',
          description: intention.why_it_matters,
          is_master: false,
          required_tier: 'enhanced'
        })
        .select()
        .single();

      if (createError) throw createError;
      intentionFolder = newFolder;
    } else {
      // Update existing folder
      await supabase
        .from('archive_folders')
        .update({
          folder_name: intention.title,
          description: intention.why_it_matters,
          updated_at: new Date().toISOString()
        })
        .eq('id', intentionFolder.id);
    }

    // Add/update context items
    if (!intentionFolder?.id) return; // Safety check

    const folderId = intentionFolder.id; // Extract ID for use in loop

    const contextItems = [
      { field: 'current_state', value: intention.current_state },
      { field: 'desired_state', value: intention.desired_state },
      { field: 'why_it_matters', value: intention.why_it_matters },
      { field: 'category', value: intention.category_name || 'uncategorized' }
    ];

    for (const item of contextItems) {
      // Check if context item exists
      const { data: existingItem } = await supabase
        .from('archive_context_items')
        .select('id')
        .eq('folder_id', folderId)
        .eq('context_field', item.field)
        .maybeSingle();

      if (existingItem) {
        // Update existing
        await supabase
          .from('archive_context_items')
          .update({
            context_value: item.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);
      } else {
        // Insert new
        await supabase
          .from('archive_context_items')
          .insert({
            folder_id: folderId,
            context_field: item.field,
            context_value: item.value,
            use_for_context: true,
            added_by: 'manual'
          });
      }
    }
  },

  /**
   * Sync all Best Intentions to Archives (for initial setup or bulk sync)
   */
  async syncAllBestIntentionsToArchive(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!memberData) throw new Error('Family member not found');

    // Get all Best Intentions for this family
    const { data: intentions, error } = await supabase
      .from('best_intentions')
      .select('id')
      .eq('family_id', memberData.family_id)
      .eq('is_active', true);

    if (error) throw error;

    if (!intentions || intentions.length === 0) {
      console.log('No Best Intentions to sync');
      return;
    }

    // Sync each intention
    for (const intention of intentions) {
      try {
        await this.syncBestIntentionToArchive(intention.id);
      } catch (err) {
        console.error(`Failed to sync intention ${intention.id}:`, err);
      }
    }
  }
};
