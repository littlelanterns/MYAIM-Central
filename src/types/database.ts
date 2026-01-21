/**
 * Database Types for MyAIM Central
 *
 * Auto-generated from Supabase schema on 2026-01-21
 *
 * To regenerate: npm run db:types
 * Or manually: npx supabase gen types typescript --project-id vrouxykpyzsdqoxestdm > src/types/database.ts
 */

// ============================================================================
// CORE FAMILY TABLES
// ============================================================================

export interface Family {
  id: string; // uuid, PRIMARY KEY
  family_name: string; // NOT NULL
  subscription_tier?: string; // default: 'basic'
  memberpress_level_id?: number;
  default_context_settings?: Record<string, unknown>; // jsonb
  context_privacy_level?: string; // default: 'medium'
  connected_platforms?: {
    claude?: boolean;
    gemini?: boolean;
    chatgpt?: boolean;
    perplexity?: boolean;
  };
  context_usage_patterns?: Record<string, unknown>;
  optimization_preferences?: Record<string, unknown>;
  created_at?: string; // timestamp
  updated_at?: string;
  // Auth & Login
  auth_user_id?: string; // uuid - links to Supabase auth.users
  family_login_name?: string; // UNIQUE - for family member PIN login
  // Founding Family (Beta)
  is_founding_family?: boolean; // default: false
  founding_family_rate?: number;
  founding_family_joined_at?: string;
  membership_status?: string; // default: 'active'
}

export interface FamilyMember {
  id: string; // uuid, PRIMARY KEY
  family_id?: string; // FK -> families.id
  heartbeat_profile_id?: number;
  name: string; // NOT NULL
  role: string; // NOT NULL - 'primary_organizer' | 'parent' | 'child' | etc.
  age?: number;
  personality_traits?: Record<string, unknown>;
  learning_style?: string;
  interests?: string[];
  challenges?: string[];
  strengths?: string[];
  privacy_level?: string; // default: 'family'
  can_modify_context?: boolean; // default: false
  supervised_by?: string; // FK -> family_members.id
  created_at?: string;
  updated_at?: string;
  // Dashboard & UI
  dashboard_type?: string; // default: 'adult'
  dashboard_mode?: string; // default: 'independent'
  theme_preference?: string; // default: 'classic'
  background_image?: string;
  color?: string; // default: '#68a395'
  member_color?: string; // default: 'AIMfM Sage Teal'
  avatar?: string;
  avatar_url?: string;
  // Gamification
  unique_qr_code?: string;
  points_balance?: number; // default: 0
  level?: number; // default: 1
  gamification_level?: string; // default: 'standard'
  badges_earned?: string[];
  // Settings
  use_emojis?: boolean; // default: true
  content_filter_level?: string; // default: 'strict'
  ai_interaction_monitor?: boolean; // default: true
  daily_usage_limit_minutes?: number; // default: 60
  requires_parent_approval?: boolean; // default: true
  week_start_preference?: string;
  // Status & Role
  status?: string; // default: 'home'
  current_challenges?: string[];
  motivators?: string[];
  permissions?: Record<string, unknown>;
  // Extended Family
  birthday?: string; // date
  nicknames?: string[];
  relationship_level?: string; // default: 'immediate'
  access_level?: string; // default: 'guided'
  custom_role?: string;
  in_household?: boolean; // default: true
  contact_frequency?: string; // default: 'regular'
  spouse_name?: string;
  family_notes?: string;
  is_teacher_coach?: boolean; // default: false
  // Auth
  display_title?: string;
  is_primary_parent?: boolean; // default: false
  pin?: string;
  auth_user_id?: string; // uuid - links to Supabase auth.users
}

// ============================================================================
// TASK SYSTEM
// ============================================================================

export interface Task {
  id: string;
  family_id?: string; // FK -> families.id
  task_name: string; // NOT NULL
  description?: string;
  duration?: string; // default: 'No time limit'
  task_image_url?: string;
  task_type?: string; // default: 'task'
  assignee: string[]; // NOT NULL - array of member IDs
  frequency_details?: Record<string, unknown>;
  incomplete_action?: string; // default: 'auto-disappear'
  reward_type?: string; // default: 'none'
  reward_amount?: string;
  reward_details?: Record<string, unknown>;
  require_approval?: boolean; // default: false
  subtasks?: string[];
  status?: string; // default: 'pending'
  qr_code_url?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  completed_at?: string;
  approved_by?: string; // FK -> family_members.id
  approved_at?: string;
  created_by?: string; // FK -> family_members.id
  // AI & Context
  context_categories_used?: string[];
  ai_optimization_data?: Record<string, unknown>;
  ai_subtasks?: Record<string, unknown>;
  ai_insights?: Record<string, unknown>;
  // Additional fields
  task_frequency?: string; // default: 'one-time'
  task_category?: string; // default: 'task'
  opportunity_type?: string;
  points_value?: number; // default: 10
  difficulty_level?: number; // default: 1
  priority?: string; // default: 'medium'
  target_type?: string; // default: 'family'
  verification_required?: string; // default: 'none'
  // Completion
  completion_photo?: string;
  completion_photo_local?: string;
  photo_processed?: boolean;
  completion_note?: string;
  parent_approved?: boolean;
  pipedream_processed?: boolean;
}

export interface TaskCompletion {
  id: string;
  task_id?: string; // FK -> tasks.id
  family_id?: string; // FK -> families.id
  completed_by?: string; // FK -> family_members.id
  completion_method?: string; // default: 'manual'
  completion_quality_score?: number;
  completion_time_minutes?: number;
  completion_notes?: string;
  context_at_completion?: Record<string, unknown>;
  created_at?: string;
}

export interface TaskSubtask {
  id: string;
  task_id?: string; // FK -> tasks.id
  title: string; // NOT NULL
  completed?: boolean; // default: false
}

export interface TaskTemplate {
  id: string;
  family_id?: string; // FK -> families.id
  template_name: string; // NOT NULL
  task_name: string; // NOT NULL
  description?: string;
  duration?: string;
  task_image_url?: string;
  task_type?: string;
  default_assignee?: string[];
  frequency?: string;
  frequency_details?: Record<string, unknown>;
  incomplete_action?: string;
  reward_type?: string;
  reward_amount?: string;
  reward_details?: Record<string, unknown>;
  require_approval?: boolean;
  subtasks?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string; // FK -> family_members.id
  usage_count?: number;
  last_used_at?: string;
  context_categories_suggested?: string[];
}

export interface TaskReward {
  id: string;
  task_id: string; // FK -> tasks.id, NOT NULL
  reward_type: string; // NOT NULL
  reward_amount: number; // NOT NULL
  bonus_threshold?: number;
  bonus_amount?: number;
  created_at?: string;
}

// ============================================================================
// CALENDAR & EVENTS
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string; // NOT NULL
  description?: string;
  location?: string;
  start_time: string; // NOT NULL
  end_time: string; // NOT NULL
  is_all_day?: boolean;
  event_type: string; // NOT NULL, default: 'event'
  category?: string;
  priority?: string;
  color?: string;
  source?: string; // default: 'family'
  external_id?: string;
  // Recurrence
  is_recurring?: boolean;
  recurrence_type?: string;
  recurrence_interval?: number;
  recurrence_end_date?: string;
  recurrence_days?: Record<string, unknown>;
  recurrence_count?: number;
  // Relations
  created_by: string; // FK -> family_members.id, NOT NULL
  family_id: string; // FK -> families.id, NOT NULL
  created_at?: string;
  updated_at?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string; // FK -> calendar_events.id, NOT NULL
  family_member_id: string; // FK -> family_members.id, NOT NULL
  can_edit?: boolean;
  can_view?: boolean;
  rsvp_status?: string;
  added_at?: string;
}

// ============================================================================
// REWARDS SYSTEM
// ============================================================================

export interface FamilyReward {
  id: string;
  family_id: string; // NOT NULL
  created_by: string; // NOT NULL
  title: string; // NOT NULL
  description?: string;
  reward_type: string; // NOT NULL
  cost: number; // NOT NULL
  category?: string;
  assigned_to?: string;
  contribution_rule?: string;
  contributors?: Record<string, unknown>;
  bulk_recipients?: Record<string, unknown>;
  is_active?: boolean;
  is_redeemable?: boolean;
  max_redemptions?: number;
  current_redemptions?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FamilyRewardType {
  id: string;
  family_id: string; // NOT NULL
  reward_type: string; // NOT NULL
  display_name: string; // NOT NULL
  icon?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MemberRewardBalance {
  id: string;
  family_member_id: string; // NOT NULL
  reward_type: string; // NOT NULL
  current_balance?: number;
  lifetime_earned?: number;
  lifetime_spent?: number;
  last_updated?: string;
}

export interface RewardTransaction {
  id: string;
  family_member_id: string; // NOT NULL
  reward_type: string; // NOT NULL
  transaction_type: string; // NOT NULL
  amount: number; // NOT NULL
  source_type?: string;
  source_id?: string;
  description?: string;
  created_by?: string;
  created_at?: string;
}

export interface RewardRedemption {
  id: string;
  reward_id: string; // NOT NULL
  redeemed_by: string; // NOT NULL
  amount_spent: number; // NOT NULL
  status?: string;
  notes?: string;
  redeemed_at?: string;
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
}

// ============================================================================
// BEST INTENTIONS (Goals)
// ============================================================================

export interface BestIntention {
  id: string;
  family_id?: string;
  created_by?: string;
  title: string; // NOT NULL
  current_state?: string;
  desired_state?: string;
  why_it_matters?: string;
  category?: string;
  priority?: string; // default: 'medium'
  is_active?: boolean;
  is_archived?: boolean;
  archived_reason?: string;
  related_members?: string[];
  keywords?: string[];
  ai_reference_count?: number;
  last_referenced_at?: string;
  progress_notes?: unknown[];
  use_as_context?: boolean;
  created_at?: string;
  updated_at?: string;
  privacy_level?: string;
  category_id?: string;
  // Display settings
  show_in_quick_actions?: boolean;
  show_in_command_center?: boolean;
  show_in_archives?: boolean;
  linked_archive_folder_id?: string;
}

export interface IntentionCategory {
  id: string;
  family_id?: string;
  category_name: string; // NOT NULL
  display_name: string; // NOT NULL
  description?: string;
  icon?: string;
  color_hex?: string;
  sort_order?: number;
  category_type?: string;
  source_type?: string;
  source_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IntentionProgress {
  id: string;
  intention_id?: string;
  entry_type?: string;
  content: string; // NOT NULL
  created_by?: string;
  created_at?: string;
}

// ============================================================================
// ARCHIVE SYSTEM
// ============================================================================

export interface ArchiveFolder {
  id: string;
  family_id: string; // NOT NULL
  parent_folder_id?: string;
  folder_name: string; // NOT NULL
  folder_type: string; // NOT NULL
  member_id?: string;
  icon?: string;
  cover_photo_url?: string;
  color_hex?: string;
  description?: string;
  is_active?: boolean;
  required_tier?: string;
  sort_order?: number;
  is_master?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ArchiveContextItem {
  id: string;
  folder_id: string; // NOT NULL
  context_field: string; // NOT NULL
  context_value: string; // NOT NULL
  context_type?: string;
  use_for_context?: boolean;
  added_by?: string;
  conversation_reference?: string;
  suggested_by_lila?: boolean;
  suggestion_accepted?: boolean;
  suggestion_reasoning?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// GAMIFICATION
// ============================================================================

export interface GamificationProgress {
  id: string;
  family_member_id: string; // NOT NULL
  theme: string; // NOT NULL, default: 'flower-garden'
  level: number; // NOT NULL, default: 1
  points: number; // NOT NULL, default: 0
  points_to_next_level: number; // NOT NULL, default: 100
  items?: unknown[];
  achievements?: unknown[];
  current_streak?: number;
  longest_streak?: number;
  last_activity_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Achievement {
  id: string;
  member_id?: string;
  achievement_type?: string;
  points_awarded?: number;
  earned_at?: string;
}

export interface Victory {
  id: string;
  family_member_id: string; // NOT NULL
  description: string; // NOT NULL
  category?: string;
  celebration_message?: string;
  voice_url?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// DASHBOARD & UI
// ============================================================================

export interface DashboardConfig {
  id: string;
  family_member_id: string; // NOT NULL
  dashboard_type: string; // NOT NULL
  dashboard_mode?: string;
  widgets?: unknown[];
  layout?: Record<string, unknown>;
  is_personal?: boolean;
  created_at?: string;
  updated_at?: string;
  gamification_system?: string;
  selected_theme?: string;
  widget_layout?: string;
  victory_settings?: Record<string, unknown>;
}

export interface WidgetPermission {
  id: string;
  dashboard_config_id: string; // NOT NULL
  widget_id: string; // NOT NULL
  visible_to: string; // NOT NULL, default: 'owner'
}

// ============================================================================
// BETA & ADMIN
// ============================================================================

export interface BetaUser {
  id: string;
  user_id: string; // NOT NULL, UNIQUE
  status: string; // NOT NULL, default: 'active'
  beta_tier: string; // NOT NULL, default: 'beta'
  setup_completed?: boolean;
  last_active?: string;
  total_sessions?: number;
  total_feedback_submissions?: number;
  beta_code?: string;
  invited_by?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  features_enabled?: Record<string, unknown>;
}

export interface StaffPermission {
  id: string;
  user_id: string; // NOT NULL
  permission_type: string; // NOT NULL
  is_active?: boolean;
  expires_at?: string;
  granted_by?: string;
  granted_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackSubmission {
  id: string;
  user_id: string; // NOT NULL
  page_url: string; // NOT NULL
  issue_type: string; // NOT NULL
  priority: string; // NOT NULL
  description: string; // NOT NULL
  screenshot_url?: string;
  context_data?: Record<string, unknown>;
  status: string; // NOT NULL, default: 'new'
  admin_response?: string;
  admin_id?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// CONTEXT & AI
// ============================================================================

export interface ContextCategory {
  id: string;
  family_id?: string;
  category_name: string; // NOT NULL
  category_type: string; // NOT NULL
  display_name: string; // NOT NULL
  icon?: string;
  is_enabled?: boolean;
  priority_order?: number;
  privacy_level?: string;
  context_data?: Record<string, unknown>;
  relevance_keywords?: string[];
  usage_count?: number;
  last_used_at?: string;
  effectiveness_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContextItem {
  id: string;
  category_id?: string;
  family_id?: string;
  item_name: string; // NOT NULL
  item_type: string; // NOT NULL
  content: Record<string, unknown>; // NOT NULL
  relevance_score?: number;
  usage_frequency?: number;
  last_accessed?: string;
  keywords?: string[];
  summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LilaConversation {
  id: string;
  family_id?: string;
  user_id?: string;
  original_prompt: string; // NOT NULL
  optimized_prompt?: string;
  intentions_used?: string[];
  context_used?: Record<string, unknown>;
  optimization_method?: string;
  ai_model_used?: string;
  was_accepted?: boolean;
  user_feedback?: string;
  tokens_used?: number;
  cost_usd?: number;
  created_at?: string;
}

export interface LilaContextSuggestion {
  id: string;
  family_id: string; // NOT NULL
  conversation_reference?: string;
  suggested_context_field: string; // NOT NULL
  suggested_context_value: string; // NOT NULL
  suggested_folder_id?: string;
  suggestion_type?: string;
  reasoning?: string;
  confidence_score?: number;
  detected_pattern?: string;
  status?: string;
  mom_modified_value?: string;
  responded_at?: string;
  responded_by?: string;
  created_at?: string;
}

// ============================================================================
// ARTICLES & CONTENT
// ============================================================================

export interface Article {
  id: string;
  slug: string; // NOT NULL, UNIQUE
  title: string; // NOT NULL
  excerpt?: string;
  content: string; // NOT NULL
  featured_image_url?: string;
  category: string; // NOT NULL
  author_id?: string;
  published_at?: string;
  status?: string;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  image_url: string; // NOT NULL
  testimonial_text: string; // NOT NULL
  display_title: string; // NOT NULL
  name: string; // NOT NULL
  family_description?: string;
  status?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// LIBRARY SYSTEM
// ============================================================================

export interface LibraryItem {
  id: string;
  title: string; // NOT NULL
  description?: string;
  short_description?: string;
  category: string; // NOT NULL
  subcategory?: string;
  difficulty_level?: string;
  estimated_time_minutes?: number;
  content_type: string; // NOT NULL
  required_tier: string; // NOT NULL
  content_url: string; // NOT NULL
  thumbnail_url?: string;
  preview_image_url?: string;
  tags?: string[];
  prerequisites?: string[];
  learning_outcomes?: string[];
  tools_mentioned?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  sort_order?: number;
  view_count?: number;
  bookmark_count?: number;
  average_rating?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  status?: string;
  // Tool-specific
  tool_type?: string;
  tool_url?: string;
  embedding_method?: string;
  portal_description?: string;
  portal_tips?: string[];
  prerequisites_text?: string;
  requires_auth?: boolean;
  auth_provider?: string;
  // Usage limits
  enable_usage_limits?: boolean;
  usage_limit_type?: string;
  usage_limit_amount?: number;
  usage_limit_notes?: string;
  session_timeout_minutes?: number;
  // Seasonal
  seasonal_tags?: string[];
  gift_idea_tags?: string[];
  seasonal_priority?: number;
  allowed_tiers?: string[];
}

export interface LibraryCategory {
  id: string; // text PRIMARY KEY
  display_name: string; // NOT NULL
  description?: string;
  icon_name?: string;
  color_hex?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

// ============================================================================
// SUBSCRIPTION
// ============================================================================

export interface SubscriptionTier {
  tier_name: string; // PRIMARY KEY
  display_name: string; // NOT NULL
  tier_level: number; // NOT NULL
  monthly_price?: number;
  description?: string;
  created_at?: string;
}

// ============================================================================
// PLAY MODE (Kids Dashboard)
// ============================================================================

export interface PlayModeActivity {
  id: string;
  family_member_id: string; // NOT NULL
  title: string; // NOT NULL
  emoji?: string;
  image_url?: string;
  time_of_day: string; // NOT NULL
  is_recurring?: boolean;
  recurrence_pattern?: string;
  points?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DailyActivityCompletion {
  id: string;
  family_member_id: string; // NOT NULL
  activity_id: string; // NOT NULL
  completion_date: string; // NOT NULL
  completed_at?: string;
  points_earned?: number;
  celebration_triggered?: boolean;
}

// ============================================================================
// DATABASE HELPER TYPES
// ============================================================================

export type TableName =
  | 'families'
  | 'family_members'
  | 'tasks'
  | 'task_completions'
  | 'task_subtasks'
  | 'task_templates'
  | 'task_rewards'
  | 'calendar_events'
  | 'event_attendees'
  | 'family_rewards'
  | 'family_reward_types'
  | 'member_reward_balances'
  | 'reward_transactions'
  | 'reward_redemptions'
  | 'best_intentions'
  | 'intention_categories'
  | 'intention_progress'
  | 'archive_folders'
  | 'archive_context_items'
  | 'gamification_progress'
  | 'achievements'
  | 'victories'
  | 'dashboard_configs'
  | 'beta_users'
  | 'staff_permissions'
  | 'feedback_submissions'
  | 'context_categories'
  | 'context_items'
  | 'lila_conversations'
  | 'lila_context_suggestions'
  | 'articles'
  | 'testimonials'
  | 'library_items'
  | 'library_categories'
  | 'subscription_tiers'
  | 'play_mode_activities'
  | 'daily_activity_completions';

// Type for insert operations (makes id and timestamps optional)
export type InsertRow<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// Type for update operations (all fields optional except id)
export type UpdateRow<T> = Partial<Omit<T, 'id'>> & { id: string };
