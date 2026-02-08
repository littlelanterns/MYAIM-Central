/**
 * Dashboard Service
 * Handles all dashboard-related database operations
 */

import { supabase } from '../lib/supabase';
import {
  DashboardConfig,
  DashboardType,
  WidgetConfig,
  WidgetPermission,
  WidgetType,
  WidgetPosition,
  FamilyMemberStatus,
  FamilyOverviewData
} from '../types/dashboard.types';

export class DashboardService {
  /**
   * Get dashboard configuration for a family member
   */
  static async getDashboardConfig(
    familyMemberId: string,
    dashboardType: DashboardType
  ): Promise<DashboardConfig | null> {
    try {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('family_member_id', familyMemberId)
        .eq('dashboard_type', dashboardType)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard config:', error);
      return null;
    }
  }

  /**
   * Create a new dashboard configuration
   */
  static async createDashboardConfig(
    familyMemberId: string,
    dashboardType: DashboardType,
    isPersonal: boolean = false
  ): Promise<DashboardConfig | null> {
    try {
      const defaultLayout = {
        columns: 12,
        rows: 12,
        gap: 16,
        responsive: true
      };

      const { data, error } = await supabase
        .from('dashboard_configs')
        .insert({
          family_member_id: familyMemberId,
          dashboard_type: dashboardType,
          widgets: [],
          layout: defaultLayout,
          is_personal: isPersonal
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating dashboard config:', error);
      return null;
    }
  }

  /**
   * Add a widget to a dashboard
   */
  static async addWidget(
    dashboardConfigId: string,
    widgetType: WidgetType,
    position: WidgetPosition,
    settings: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      // Get current config
      const { data: config, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('widgets')
        .eq('id', dashboardConfigId)
        .single();

      if (fetchError) throw fetchError;

      const widgets = config?.widgets || [];
      const newWidget: WidgetConfig = {
        id: crypto.randomUUID(),
        widget_type: widgetType,
        position,
        settings,
        visible: true,
        editable: true
      };

      widgets.push(newWidget);

      // Update config
      const { error: updateError } = await supabase
        .from('dashboard_configs')
        .update({ widgets, updated_at: new Date().toISOString() })
        .eq('id', dashboardConfigId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error adding widget:', error);
      return false;
    }
  }

  /**
   * Remove a widget from a dashboard
   */
  static async removeWidget(
    dashboardConfigId: string,
    widgetId: string
  ): Promise<boolean> {
    try {
      // Get current config
      const { data: config, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('widgets')
        .eq('id', dashboardConfigId)
        .single();

      if (fetchError) throw fetchError;

      const widgets = (config?.widgets || []).filter(
        (w: WidgetConfig) => w.id !== widgetId
      );

      // Update config
      const { error: updateError } = await supabase
        .from('dashboard_configs')
        .update({ widgets, updated_at: new Date().toISOString() })
        .eq('id', dashboardConfigId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error removing widget:', error);
      return false;
    }
  }

  /**
   * Update widget position
   */
  static async updateWidgetPosition(
    dashboardConfigId: string,
    widgetId: string,
    position: WidgetPosition
  ): Promise<boolean> {
    try {
      // Get current config
      const { data: config, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('widgets')
        .eq('id', dashboardConfigId)
        .single();

      if (fetchError) throw fetchError;

      const widgets = (config?.widgets || []).map((w: WidgetConfig) =>
        w.id === widgetId ? { ...w, position } : w
      );

      // Update config
      const { error: updateError } = await supabase
        .from('dashboard_configs')
        .update({ widgets, updated_at: new Date().toISOString() })
        .eq('id', dashboardConfigId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error updating widget position:', error);
      return false;
    }
  }

  /**
   * Get all family members' dashboard statuses
   * With non-blocking error handling to prevent app freezing
   */
  static async getFamilyOverview(familyId: string): Promise<FamilyOverviewData | null> {
    try {
      // Guard: don't query if no familyId
      if (!familyId) {
        console.log('[DASHBOARD] No familyId provided, skipping overview');
        return null;
      }

      // Get all family members
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select('id, name, role, avatar_url')
        .eq('family_id', familyId);

      if (membersError) {
        console.log('[DASHBOARD] Could not load family members (non-blocking):', membersError.message);
        return null;
      }

      // For each member, get their task status - with individual error handling
      const familyMemberStatuses: FamilyMemberStatus[] = await Promise.all(
        (members || []).map(async (member) => {
          try {
            // Get tasks for this member - handle errors gracefully
            const { data: tasks, error: tasksError } = await supabase
              .from('tasks')
              .select('id, title, due_date, priority, status')
              .contains('assignee', [member.id])
              .gte('due_date', new Date().toISOString());

            if (tasksError) {
              console.log('[DASHBOARD] Could not load tasks for member (non-blocking):', tasksError.message);
            }

            const allTasks = tasks || [];
            const completedTasks = allTasks.filter(t => t.status === 'completed');
            const urgentTasks = allTasks
              .filter(t => t.priority === 'high' || t.priority === 'urgent')
              .filter(t => t.status !== 'completed')
              .slice(0, 3);

            return {
              member_id: member.id,
              name: member.name,
              role: member.role,
              tasks_complete: completedTasks.length,
              tasks_total: allTasks.length,
              urgent_tasks: urgentTasks.map(t => ({
                id: t.id,
                title: t.title,
                due_date: t.due_date,
                priority: t.priority
              })),
              has_notifications: urgentTasks.length > 0,
              avatar_url: member.avatar_url
            };
          } catch (memberErr) {
            // Return default data for this member if error
            console.log('[DASHBOARD] Member task load failed (non-blocking):', memberErr);
            return {
              member_id: member.id,
              name: member.name,
              role: member.role,
              tasks_complete: 0,
              tasks_total: 0,
              urgent_tasks: [],
              has_notifications: false,
              avatar_url: member.avatar_url
            };
          }
        })
      );

      // Get event counts - with individual error handling
      const today = new Date().toISOString().split('T')[0];
      const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      let todayEventsCount = 0;
      let weekEventsCount = 0;
      let activeIntentionsCount = 0;

      try {
        const { data: todayEvents, error: todayError } = await supabase
          .from('calendar_events')
          .select('id', { count: 'exact' })
          .eq('family_id', familyId)
          .gte('start_time', `${today}T00:00:00`)
          .lt('start_time', `${today}T23:59:59`);

        if (!todayError) {
          todayEventsCount = todayEvents?.length || 0;
        } else {
          console.log('[DASHBOARD] Could not load today events (non-blocking):', todayError.message);
        }
      } catch (e) {
        console.log('[DASHBOARD] Today events query failed (non-blocking)');
      }

      try {
        const { data: weekEvents, error: weekError } = await supabase
          .from('calendar_events')
          .select('id', { count: 'exact' })
          .eq('family_id', familyId)
          .gte('start_time', `${today}T00:00:00`)
          .lt('start_time', `${weekEnd}T23:59:59`);

        if (!weekError) {
          weekEventsCount = weekEvents?.length || 0;
        } else {
          console.log('[DASHBOARD] Could not load week events (non-blocking):', weekError.message);
        }
      } catch (e) {
        console.log('[DASHBOARD] Week events query failed (non-blocking)');
      }

      try {
        // Fixed: best_intentions uses is_active, not status
        const { data: intentions, error: intentionsError } = await supabase
          .from('best_intentions')
          .select('id', { count: 'exact' })
          .eq('family_id', familyId)
          .eq('is_active', true);

        if (!intentionsError) {
          activeIntentionsCount = intentions?.length || 0;
        } else {
          console.log('[DASHBOARD] Could not load intentions (non-blocking):', intentionsError.message);
        }
      } catch (e) {
        console.log('[DASHBOARD] Intentions query failed (non-blocking)');
      }

      return {
        family_members: familyMemberStatuses,
        today_events: todayEventsCount,
        week_events: weekEventsCount,
        active_intentions: activeIntentionsCount,
        completion_rate: this.calculateCompletionRate(familyMemberStatuses)
      };
    } catch (error) {
      // Silently handle - return null to show empty state
      console.log('[DASHBOARD] Family overview load failed (non-blocking):', error);
      return null;
    }
  }

  /**
   * Check if user can edit a dashboard
   */
  static async canEditDashboard(
    viewingUserId: string,
    dashboardOwnerId: string
  ): Promise<boolean> {
    try {
      // Get viewing user's role
      const { data: viewingUser, error: viewerError } = await supabase
        .from('family_members')
        .select('role, family_id')
        .eq('id', viewingUserId)
        .single();

      if (viewerError) throw viewerError;

      // Can always edit own dashboard
      if (viewingUserId === dashboardOwnerId) return true;

      // Primary organizer (mom) can edit anyone's dashboard
      if (viewingUser?.role === 'primary_organizer') return true;

      // Parents can edit children's dashboards
      if (viewingUser?.role === 'parent') {
        const { data: ownerUser } = await supabase
          .from('family_members')
          .select('role')
          .eq('id', dashboardOwnerId)
          .single();

        if (ownerUser?.role === 'child' || ownerUser?.role === 'teen') {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  }

  /**
   * Calculate overall family task completion rate
   */
  private static calculateCompletionRate(members: FamilyMemberStatus[]): number {
    const totalTasks = members.reduce((sum, m) => sum + m.tasks_total, 0);
    const completedTasks = members.reduce((sum, m) => sum + m.tasks_complete, 0);

    if (totalTasks === 0) return 100;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  /**
   * Get widget permissions
   */
  static async getWidgetPermissions(
    dashboardConfigId: string
  ): Promise<WidgetPermission[]> {
    try {
      const { data, error } = await supabase
        .from('widget_permissions')
        .select('*')
        .eq('dashboard_config_id', dashboardConfigId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching widget permissions:', error);
      return [];
    }
  }

  /**
   * Set widget permission
   */
  static async setWidgetPermission(
    dashboardConfigId: string,
    widgetId: string,
    visibleTo: string,
    editableBy: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('widget_permissions')
        .upsert({
          dashboard_config_id: dashboardConfigId,
          widget_id: widgetId,
          visible_to: visibleTo,
          editable_by: editableBy
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting widget permission:', error);
      return false;
    }
  }
}
