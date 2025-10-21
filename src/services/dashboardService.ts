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
   */
  static async getFamilyOverview(familyId: string): Promise<FamilyOverviewData | null> {
    try {
      // Get all family members
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select('id, name, role, avatar_url')
        .eq('family_id', familyId);

      if (membersError) throw membersError;

      // For each member, get their task status
      const familyMemberStatuses: FamilyMemberStatus[] = await Promise.all(
        (members || []).map(async (member) => {
          // Get tasks for this member
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, due_date, priority, status')
            .eq('assigned_to', member.id)
            .gte('due_date', new Date().toISOString());

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
        })
      );

      // Get event counts
      const today = new Date().toISOString().split('T')[0];
      const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const { data: todayEvents } = await supabase
        .from('calendar_events')
        .select('id', { count: 'exact' })
        .eq('family_id', familyId)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`);

      const { data: weekEvents } = await supabase
        .from('calendar_events')
        .select('id', { count: 'exact' })
        .eq('family_id', familyId)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${weekEnd}T23:59:59`);

      const { data: intentions } = await supabase
        .from('best_intentions')
        .select('id', { count: 'exact' })
        .eq('family_id', familyId)
        .eq('status', 'active');

      return {
        family_members: familyMemberStatuses,
        today_events: todayEvents?.length || 0,
        week_events: weekEvents?.length || 0,
        active_intentions: intentions?.length || 0,
        completion_rate: this.calculateCompletionRate(familyMemberStatuses)
      };
    } catch (error) {
      console.error('Error fetching family overview:', error);
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
