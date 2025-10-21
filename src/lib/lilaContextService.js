// src/lib/lilaContextService.js - Service for gathering family context for LiLa optimization
import { supabase } from './supabase';
import { archivesService } from './archivesService';

export const lilaContextService = {
  /**
   * Get comprehensive family context for LiLa optimization
   * Returns formatted context about family members, preferences, and settings
   */
  async getFamilyContextForOptimization() {
    try {
      // Get current family ID
      const familyId = await archivesService.getCurrentFamilyId();

      // Get family members
      const { data: familyMembers, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;

      // Get family-wide context from Archives
      const familyContext = await archivesService.getFamilyContext(familyId);

      // Build member profiles with their context
      const memberProfiles = await Promise.all(
        familyMembers.map(async (member) => {
          try {
            // Get member-specific context
            const memberContext = await archivesService.getMemberContextWithInheritance(member.id);

            return {
              name: member.name,
              relationship: member.relationship,
              role: member.role,
              age: this.calculateAge(member.date_of_birth),
              context: this.formatMemberContext(memberContext)
            };
          } catch (error) {
            console.error(`Error loading context for ${member.name}:`, error);
            return {
              name: member.name,
              relationship: member.relationship,
              role: member.role,
              context: {}
            };
          }
        })
      );

      // Format family-wide context
      const formattedFamilyContext = this.formatFamilyContext(familyContext);

      return {
        familyId,
        members: memberProfiles,
        familyContext: formattedFamilyContext,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error gathering family context:', error);
      // Return minimal context if there's an error
      return {
        error: error.message,
        members: [],
        familyContext: {},
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Format member context into organized categories
   */
  formatMemberContext(contextItems) {
    const formatted = {};

    if (!contextItems || contextItems.length === 0) {
      return formatted;
    }

    contextItems.forEach(item => {
      formatted[item.context_field] = item.context_value;
    });

    return formatted;
  },

  /**
   * Format family-wide context
   */
  formatFamilyContext(contextItems) {
    const formatted = {};

    if (!contextItems || contextItems.length === 0) {
      return formatted;
    }

    contextItems.forEach(item => {
      if (item.folder_type === 'master_family' || item.folder_type === 'family_root') {
        formatted[item.context_field] = item.context_value;
      }
    });

    return formatted;
  },

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  },

  /**
   * Build a natural language summary of family context
   * This creates a human-readable summary for LiLa to use
   */
  buildContextSummary(context) {
    if (!context || !context.members) return '';

    const parts = [];

    // Family members summary
    if (context.members.length > 0) {
      const memberSummaries = context.members.map(member => {
        let summary = member.name;
        if (member.age) summary += ` (${member.age} years old)`;
        if (member.relationship) summary += `, ${member.relationship}`;

        // Add key context points
        if (member.context.personality) {
          summary += ` - ${member.context.personality}`;
        }
        if (member.context.learning_style) {
          summary += `, learns best through ${member.context.learning_style}`;
        }
        if (member.context.interests) {
          summary += `, interested in ${member.context.interests}`;
        }

        return summary;
      });

      parts.push('Family Members:\n' + memberSummaries.join('\n'));
    }

    // Family-wide context
    if (context.familyContext && Object.keys(context.familyContext).length > 0) {
      const familyParts = [];
      Object.entries(context.familyContext).forEach(([key, value]) => {
        if (value && value !== 'Complete LiLa interview to add') {
          familyParts.push(`${key}: ${value}`);
        }
      });

      if (familyParts.length > 0) {
        parts.push('\nFamily Context:\n' + familyParts.join('\n'));
      }
    }

    return parts.join('\n\n');
  },

  /**
   * Get context for a specific member by name
   */
  async getMemberContextByName(memberName) {
    try {
      const familyId = await archivesService.getCurrentFamilyId();

      const { data: member, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .ilike('name', memberName)
        .single();

      if (error) throw error;

      const memberContext = await archivesService.getMemberContextWithInheritance(member.id);

      return {
        name: member.name,
        relationship: member.relationship,
        role: member.role,
        age: this.calculateAge(member.date_of_birth),
        context: this.formatMemberContext(memberContext)
      };

    } catch (error) {
      console.error(`Error getting context for ${memberName}:`, error);
      return null;
    }
  }
};
