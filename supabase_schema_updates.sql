-- Add missing tables and columns for MyAIM Central

-- 1. Create user_permissions table for granular permission system
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL, -- Can be family_member.id or wordpress_user_id
  permissions jsonb NOT NULL DEFAULT '{}',
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT user_permissions_user_id_unique UNIQUE (user_id)
);

-- 2. Create user_preferences table for themes and settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL, -- Can be family_member.id or wordpress_user_id
  preference_type text NOT NULL, -- 'theme', 'dashboard_layout', etc.
  preference_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_unique UNIQUE (user_id, preference_type)
);

-- 3. Add some helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON public.tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id, preference_type);

-- 4. Add Row Level Security (RLS) policies for security
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own permissions/preferences
CREATE POLICY "Users can access own permissions" ON public.user_permissions
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid()::text IN (
    SELECT wordpress_user_id::text FROM public.families WHERE id IN (
      SELECT family_id FROM public.family_members WHERE wordpress_user_id = auth.uid()::bigint
    )
  ));

CREATE POLICY "Users can access own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid()::text = user_id OR auth.uid()::text IN (
    SELECT wordpress_user_id::text FROM public.families WHERE id IN (
      SELECT family_id FROM public.family_members WHERE wordpress_user_id = auth.uid()::bigint
    )
  ));

-- 5. Add some helpful columns to existing tables (optional improvements)
-- Add missing columns to family_members if they don't exist
DO $$ 
BEGIN
  -- Add notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'notes') THEN
    ALTER TABLE public.family_members ADD COLUMN notes text DEFAULT '';
  END IF;
  
  -- Ensure permissions column exists and is jsonb
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'permissions' AND data_type = 'jsonb') THEN
    ALTER TABLE public.family_members ALTER COLUMN permissions TYPE jsonb USING permissions::jsonb;
    ALTER TABLE public.family_members ALTER COLUMN permissions SET DEFAULT '{}';
  END IF;
END $$;

-- 6. Insert default permission definitions (optional - for reference)
INSERT INTO public.user_preferences (user_id, preference_type, preference_value)
VALUES ('system_default', 'permission_definitions', '{
  "family.add_members": {
    "label": "Add Family Members",
    "description": "Add new family members to the household",
    "category": "family_management",
    "level": "intermediate",
    "parentalControl": true
  },
  "family.edit_members": {
    "label": "Edit Member Profiles", 
    "description": "Modify family member information and roles",
    "category": "family_management",
    "level": "intermediate",
    "parentalControl": true
  },
  "tasks.create": {
    "label": "Create Tasks",
    "description": "Create new tasks for family members",
    "category": "task_assignment",
    "level": "basic",
    "parentalControl": false
  },
  "tasks.assign_to_others": {
    "label": "Assign Tasks to Others",
    "description": "Assign tasks to other family members", 
    "category": "task_assignment",
    "level": "intermediate",
    "parentalControl": true
  },
  "settings.manage_permissions": {
    "label": "Manage User Permissions",
    "description": "Control what other family members can access",
    "category": "settings",
    "level": "advanced", 
    "parentalControl": true
  }
}') ON CONFLICT (user_id, preference_type) DO NOTHING;