/**
 * Dashboard System Types
 * Multi-level dashboard architecture for family organization
 */

export type DashboardType = 'family' | 'personal' | 'play' | 'guided' | 'independent' | 'additional_adult';
export type DashboardMode = 'play' | 'guided' | 'independent';
export type DashboardRole = 'primary_organizer' | 'parent' | 'additional_adult' | 'teen' | 'child';

export interface DashboardConfig {
  id: string;
  family_member_id: string;
  dashboard_type: DashboardType;
  dashboard_mode?: DashboardMode; // For play/guided/independent mode dashboards
  widgets: WidgetConfig[];
  layout: LayoutConfig;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
}

export interface WidgetConfig {
  id: string;
  widget_type: WidgetType;
  position: WidgetPosition;
  settings: Record<string, any>;
  visible: boolean;
  editable: boolean;
}

export type WidgetType =
  | 'calendar'
  | 'chores'
  | 'meals'
  | 'grocery'
  | 'routines'
  | 'tasks'
  | 'archives'
  | 'best_intentions'
  | 'week_at_a_glance'
  | 'family_overview'
  | 'homeschool'
  | 'gamification'
  | 'victory_recorder';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutConfig {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

export interface WidgetPermission {
  id: string;
  dashboard_config_id: string;
  widget_id: string;
  visible_to: VisibilityLevel;
  editable_by: EditPermissionLevel;
  created_at: string;
}

export type VisibilityLevel = 'owner' | 'parents' | 'family' | 'all';
export type EditPermissionLevel = 'owner' | 'parents' | 'none';

export interface FamilyMemberStatus {
  member_id: string;
  name: string;
  role: DashboardRole;
  tasks_complete: number;
  tasks_total: number;
  urgent_tasks: UrgentTask[];
  has_notifications: boolean;
  avatar_url?: string;
}

export interface UrgentTask {
  id: string;
  title: string;
  due_date: string;
  priority: 'high' | 'urgent';
}

export interface FamilyOverviewData {
  family_members: FamilyMemberStatus[];
  today_events: number;
  week_events: number;
  active_intentions: number;
  completion_rate: number;
}

export interface DashboardContextState {
  currentView: DashboardType;
  viewingMemberId: string | null;
  canEdit: boolean;
  familyOverview: FamilyMemberStatus[];

  // Navigation methods
  switchToMemberDashboard: (memberId: string) => void;
  switchToFamilyDashboard: () => void;
  switchToPersonalDashboard: () => void;

  // Widget management
  addWidget: (memberId: string, widgetType: WidgetType) => Promise<void>;
  removeWidget: (memberId: string, widgetId: string) => Promise<void>;
  updateWidgetPosition: (memberId: string, widgetId: string, position: WidgetPosition) => Promise<void>;

  // Permissions
  checkEditPermission: (dashboardOwnerId: string) => boolean;
  checkViewPermission: (dashboardOwnerId: string) => boolean;
}

export interface WeekAtAGlanceData {
  days: DayData[];
  conflicts: EventConflict[];
  busiest_day: string;
}

export interface DayData {
  date: string;
  day_of_week: string;
  event_count: number;
  events: EventSummary[];
}

export interface EventSummary {
  id: string;
  title: string;
  time: string;
  attendees: string[];
  driver?: string;
  drive_time?: number;
  has_packing_list: boolean;
}

export interface EventConflict {
  date: string;
  time: string;
  conflicting_events: EventSummary[];
  severity: 'minor' | 'major';
}

export interface DashboardWidget {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  default_size: WidgetPosition;
  min_size: { w: number; h: number };
  available_for: DashboardRole[];
}

export const AVAILABLE_WIDGETS: DashboardWidget[] = [
  {
    type: 'calendar',
    title: 'Calendar',
    description: 'Family calendar with events',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent', 'teen', 'child']
  },
  {
    type: 'week_at_a_glance',
    title: 'Week at a Glance',
    description: 'Quick week overview',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 3, h: 2 },
    min_size: { w: 2, h: 1 },
    available_for: ['primary_organizer', 'parent']
  },
  {
    type: 'family_overview',
    title: 'Family Overview',
    description: 'Everyone\'s status at a glance',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 2, h: 2 },
    available_for: ['primary_organizer', 'parent']
  },
  {
    type: 'tasks',
    title: 'My Tasks',
    description: 'Personal task list',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 1, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent', 'teen', 'child']
  },
  {
    type: 'chores',
    title: 'Chores',
    description: 'Chore chart and rewards',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 1, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent', 'teen', 'child']
  },
  {
    type: 'best_intentions',
    title: 'Best Intentions',
    description: 'Goals and focus areas',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent', 'teen', 'child']
  },
  {
    type: 'meals',
    title: 'Meal Planning',
    description: 'Weekly meal plan',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent']
  },
  {
    type: 'grocery',
    title: 'Grocery Lists',
    description: 'Shopping lists',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 1, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent']
  },
  {
    type: 'routines',
    title: 'My Routines',
    description: 'Daily routines',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['teen', 'child']
  },
  {
    type: 'gamification',
    title: 'Rewards',
    description: 'Points and achievements',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 1, h: 1 },
    min_size: { w: 1, h: 1 },
    available_for: ['teen', 'child']
  },
  {
    type: 'archives',
    title: 'Archives',
    description: 'Family context storage',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 1, h: 1 },
    available_for: ['primary_organizer', 'parent']
  },
  {
    type: 'homeschool',
    title: 'Homeschool',
    description: 'Course tracking',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 2, h: 1 },
    available_for: ['primary_organizer', 'parent', 'teen']
  },
  {
    type: 'victory_recorder',
    title: 'Victory Recorder',
    description: 'Track and celebrate accomplishments',
    icon: '', // Icon handled by component
    default_size: { x: 0, y: 0, w: 2, h: 2 },
    min_size: { w: 2, h: 1 },
    available_for: ['primary_organizer', 'parent', 'additional_adult', 'teen', 'child']
  }
];
