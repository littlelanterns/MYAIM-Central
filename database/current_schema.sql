-- Current Supabase Schema for AIMfM (Context Only - Do Not Run)
-- This file reflects the current state of your database

-- Family and User Management
CREATE TABLE public.families (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subscription_tier text DEFAULT 'basic'::text CHECK (subscription_tier = ANY (ARRAY['basic'::text, 'enhanced'::text, 'premium'::text])),
  wordpress_user_id bigint NOT NULL UNIQUE,
  family_name text NOT NULL,
  default_context_settings jsonb DEFAULT '{}'::jsonb,
  context_privacy_level text DEFAULT 'medium'::text CHECK (context_privacy_level = ANY (ARRAY['minimal'::text, 'medium'::text, 'comprehensive'::text])),
  memberpress_level_id integer,
  connected_platforms jsonb DEFAULT '{"claude": false, "gemini": false, "chatgpt": false, "perplexity": false}'::jsonb,
  context_usage_patterns jsonb DEFAULT '{}'::jsonb,
  optimization_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT families_pkey PRIMARY KEY (id)
);

CREATE TABLE public.family_members (
  dashboard_type text DEFAULT 'adult'::text,
  unique_qr_code text,
  points_balance integer DEFAULT 0,
  level integer DEFAULT 1,
  theme_preference text DEFAULT 'classic'::text,
  background_image text,
  gamification_level text DEFAULT 'standard'::text CHECK (gamification_level = ANY (ARRAY['minimal'::text, 'standard'::text, 'high'::text])),
  use_emojis boolean DEFAULT true,
  content_filter_level text DEFAULT 'strict'::text CHECK (content_filter_level = ANY (ARRAY['strict'::text, 'moderate'::text, 'minimal'::text])),
  ai_interaction_monitor boolean DEFAULT true,
  daily_usage_limit_minutes integer DEFAULT 60,
  requires_parent_approval boolean DEFAULT true,
  color text DEFAULT '#68a395'::text,
  status text DEFAULT 'home'::text,
  avatar text,
  current_challenges ARRAY,
  motivators ARRAY,
  badges_earned ARRAY,
  permissions jsonb,
  family_id uuid,
  wordpress_user_id bigint,
  name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['mom'::text, 'dad'::text, 'child'::text, 'teen'::text, 'guardian'::text])),
  age integer,
  learning_style text,
  interests ARRAY,
  challenges ARRAY,
  strengths ARRAY,
  supervised_by uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  personality_traits jsonb DEFAULT '{}'::jsonb,
  privacy_level text DEFAULT 'family'::text CHECK (privacy_level = ANY (ARRAY['private'::text, 'family'::text, 'supervised'::text])),
  can_modify_context boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  heartbeat_profile_id bigint,
  birthday date,
  nicknames ARRAY DEFAULT '{}'::text[],
  relationship_level text DEFAULT 'immediate'::text,
  access_level text DEFAULT 'guided'::text,
  custom_role text,
  in_household boolean DEFAULT true,
  contact_frequency text DEFAULT 'regular'::text,
  spouse_name text,
  family_notes text,
  is_teacher_coach boolean DEFAULT false,
  CONSTRAINT family_members_pkey PRIMARY KEY (id),
  CONSTRAINT family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT family_members_supervised_by_fkey FOREIGN KEY (supervised_by) REFERENCES public.family_members(id)
);

-- Library System Tables (Already Exist)
CREATE TABLE public.subscription_tiers (
  tier_name text NOT NULL,
  display_name text NOT NULL,
  tier_level integer NOT NULL,
  monthly_price numeric,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT subscription_tiers_pkey PRIMARY KEY (tier_name)
);

CREATE TABLE public.library_categories (
  id text NOT NULL,
  display_name text NOT NULL,
  description text,
  icon_name text,
  color_hex text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT library_categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.library_items (
  title text NOT NULL,
  description text,
  short_description text,
  category text NOT NULL,
  subcategory text,
  estimated_time_minutes integer,
  gamma_page_url text NOT NULL,
  thumbnail_url text,
  preview_image_url text,
  tags ARRAY,
  prerequisites ARRAY,
  learning_outcomes ARRAY,
  tools_mentioned ARRAY,
  created_by uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  difficulty_level text DEFAULT 'beginner'::text CHECK (difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  content_type text NOT NULL DEFAULT 'tutorial'::text CHECK (content_type = ANY (ARRAY['tutorial'::text, 'tool-collection'::text, 'workflow'::text, 'prompt-pack'::text])),
  required_tier text NOT NULL DEFAULT 'essential'::text,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  view_count integer DEFAULT 0,
  bookmark_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0.0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  status text DEFAULT 'published'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  CONSTRAINT library_items_pkey PRIMARY KEY (id),
  CONSTRAINT library_items_required_tier_fkey FOREIGN KEY (required_tier) REFERENCES public.subscription_tiers(tier_name)
);

CREATE TABLE public.user_library_bookmarks (
  user_id uuid NOT NULL,
  library_item_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_library_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT user_library_bookmarks_library_item_id_fkey FOREIGN KEY (library_item_id) REFERENCES public.library_items(id)
);

CREATE TABLE public.user_library_progress (
  user_id uuid NOT NULL,
  library_item_id uuid,
  notes text,
  completed_at timestamp without time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'not-started'::text CHECK (status = ANY (ARRAY['not-started'::text, 'in-progress'::text, 'completed'::text])),
  progress_percent integer DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_accessed timestamp without time zone DEFAULT now(),
  time_spent_minutes integer DEFAULT 0,
  CONSTRAINT user_library_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_library_progress_library_item_id_fkey FOREIGN KEY (library_item_id) REFERENCES public.library_items(id)
);

CREATE TABLE public.library_ratings (
  user_id uuid NOT NULL,
  library_item_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT library_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT library_ratings_library_item_id_fkey FOREIGN KEY (library_item_id) REFERENCES public.library_items(id)
);

-- Task System Tables
CREATE TABLE public.tasks (
  task_frequency text DEFAULT 'one-time'::text,
  task_category text DEFAULT 'task'::text,
  opportunity_type text,
  points_value integer DEFAULT 10,
  ai_subtasks jsonb,
  completion_photo_local text,
  photo_processed boolean DEFAULT false,
  created_by uuid,
  priority text DEFAULT 'medium'::text,
  pipedream_processed boolean DEFAULT false,
  ai_insights jsonb,
  difficulty_level integer DEFAULT 1,
  completion_photo text,
  completion_note text,
  parent_approved boolean DEFAULT false,
  family_id uuid,
  task_name text NOT NULL,
  description text,
  task_image_url text,
  assignee ARRAY NOT NULL,
  reward_amount text,
  subtasks ARRAY,
  qr_code_url text,
  due_date timestamp without time zone,
  completed_at timestamp without time zone,
  approved_by uuid,
  approved_at timestamp without time zone,
  context_categories_used ARRAY,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  duration text DEFAULT 'No time limit'::text,
  task_type text DEFAULT 'task'::text CHECK (task_type = ANY (ARRAY['task'::text, 'opportunity'::text])),
  frequency_details jsonb DEFAULT '{}'::jsonb,
  incomplete_action text DEFAULT 'auto-disappear'::text CHECK (incomplete_action = ANY (ARRAY['auto-disappear'::text, 'allow-late'::text, 'auto-reschedule'::text, 'require-decision'::text])),
  reward_type text DEFAULT 'none'::text CHECK (reward_type = ANY (ARRAY['none'::text, 'stars'::text, 'points'::text, 'money'::text, 'privilege'::text, 'family'::text, 'track_performance'::text])),
  reward_details jsonb DEFAULT '{}'::jsonb,
  require_approval boolean DEFAULT false,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'complete'::text, 'overdue'::text, 'skipped'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  ai_optimization_data jsonb DEFAULT '{}'::jsonb,
  target_type text DEFAULT 'family'::text,
  verification_required text DEFAULT 'none'::text,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.family_members(id),
  CONSTRAINT tasks_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT tasks_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.family_members(id)
);

-- Context System Tables
CREATE TABLE public.context_categories (
  family_id uuid,
  category_name text NOT NULL,
  category_type text NOT NULL CHECK (category_type = ANY (ARRAY['personality'::text, 'child_profiles'::text, 'parenting_philosophy'::text, 'education_philosophy'::text, 'projects'::text, 'schedules'::text, 'recent_activity'::text, 'emotional_context'::text, 'external_integrations'::text])),
  display_name text NOT NULL,
  icon text,
  relevance_keywords ARRAY,
  last_used_at timestamp without time zone,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_enabled boolean DEFAULT true,
  priority_order integer DEFAULT 100,
  privacy_level text DEFAULT 'medium'::text CHECK (privacy_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  context_data jsonb DEFAULT '{}'::jsonb,
  usage_count integer DEFAULT 0,
  effectiveness_score double precision DEFAULT 0.5,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT context_categories_pkey PRIMARY KEY (id),
  CONSTRAINT context_categories_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);

-- AI and Persona System
CREATE TABLE public.personas (
  persona_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  category text NOT NULL,
  description text,
  core_philosophy text,
  icon text,
  trigger_keywords ARRAY,
  use_cases ARRAY,
  base_prompt_template text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  context_requirements jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT personas_pkey PRIMARY KEY (id)
);

-- Reward System Tables
CREATE TABLE public.family_rewards (
  family_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  reward_type character varying NOT NULL,
  cost integer NOT NULL,
  category character varying,
  assigned_to uuid,
  contribution_rule character varying,
  contributors jsonb,
  bulk_recipients jsonb,
  max_redemptions integer,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_active boolean DEFAULT true,
  is_redeemable boolean DEFAULT true,
  current_redemptions integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT family_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT family_rewards_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.family_members(id),
  CONSTRAINT family_rewards_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.family_members(id),
  CONSTRAINT family_rewards_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);

-- MindSweep System
CREATE TABLE public.mindsweep_items (
  family_id uuid,
  created_by uuid,
  source text NOT NULL CHECK (source = ANY (ARRAY['telegram'::text, 'app'::text, 'web'::text, 'email'::text, 'voice'::text])),
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['text'::text, 'voice'::text, 'image'::text, 'document'::text])),
  raw_content text NOT NULL,
  ai_category text CHECK (ai_category = ANY (ARRAY['task'::text, 'idea'::text, 'memory'::text, 'reminder'::text, 'question'::text, 'celebration'::text])),
  ai_tags ARRAY,
  ai_summary text,
  assigned_to uuid,
  project_reference uuid,
  due_date date,
  related_context_categories ARRAY,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  processed_content jsonb DEFAULT '{}'::jsonb,
  ai_priority integer DEFAULT 3 CHECK (ai_priority >= 1 AND ai_priority <= 5),
  status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'processing'::text, 'completed'::text, 'archived'::text])),
  generated_context jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT mindsweep_items_pkey PRIMARY KEY (id),
  CONSTRAINT mindsweep_items_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id),
  CONSTRAINT mindsweep_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.family_members(id),
  CONSTRAINT mindsweep_items_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.family_members(id)
);