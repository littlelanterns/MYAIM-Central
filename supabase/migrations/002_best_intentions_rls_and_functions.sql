-- Best Intentions RLS Policies and Helper Functions
-- Adds security policies and helper functions to existing Best Intentions tables
-- 
-- STATUS: PENDING - Not yet applied to database
-- WHEN APPLIED: Update MIGRATION_TRACKING.md with success date

-- Add privacy_level column to best_intentions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'best_intentions' 
                   AND column_name = 'privacy_level') THEN
        ALTER TABLE best_intentions 
        ADD COLUMN privacy_level TEXT DEFAULT 'family' 
        CHECK (privacy_level IN ('private', 'parents_only', 'family'));
    END IF;
END $$;

-- Enable Row Level Security on Best Intentions related tables (if not already enabled)
ALTER TABLE best_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inner_oracle_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lila_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lila_optimization_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lila_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindsweep_items ENABLE ROW LEVEL SECURITY;

-- Best Intentions Policies
-- Creators can always manage their own intentions
DROP POLICY IF EXISTS "Creators can manage own intentions" ON best_intentions;
CREATE POLICY "Creators can manage own intentions"
ON best_intentions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.id = best_intentions.created_by
    )
);

-- Moms can see and manage all family intentions
DROP POLICY IF EXISTS "Moms can manage all family intentions" ON best_intentions;
CREATE POLICY "Moms can manage all family intentions"
ON best_intentions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = best_intentions.family_id
        AND fm.role = 'mom'
    )
);

-- Family members can see intentions based on privacy level
DROP POLICY IF EXISTS "Family members can read intentions by privacy level" ON best_intentions;
CREATE POLICY "Family members can read intentions by privacy level"
ON best_intentions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = best_intentions.family_id
        AND (
            -- Private: only creator can see (handled by creator policy above)
            (best_intentions.privacy_level = 'private' AND fm.id = best_intentions.created_by) OR
            -- Parents only: creator + parents (mom/dad/guardian roles)
            (best_intentions.privacy_level = 'parents_only' AND (fm.id = best_intentions.created_by OR fm.role IN ('mom', 'dad', 'guardian'))) OR
            -- Family: everyone in family can see
            (best_intentions.privacy_level = 'family')
        )
    )
);

DROP POLICY IF EXISTS "Super admin can manage all best intentions" ON best_intentions;
CREATE POLICY "Super admin can manage all best intentions"
ON best_intentions FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- Intention Progress Policies
DROP POLICY IF EXISTS "Family members can manage intention progress" ON intention_progress;
CREATE POLICY "Family members can manage intention progress"
ON intention_progress FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        JOIN best_intentions bi ON bi.family_id = fm.family_id
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND bi.id = intention_progress.intention_id
    )
);

DROP POLICY IF EXISTS "Super admin can read all intention progress" ON intention_progress;
CREATE POLICY "Super admin can read all intention progress"
ON intention_progress FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- Intention Opportunities Policies
DROP POLICY IF EXISTS "Family members can manage intention opportunities" ON intention_opportunities;
CREATE POLICY "Family members can manage intention opportunities"
ON intention_opportunities FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        JOIN best_intentions bi ON bi.family_id = fm.family_id
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND bi.id = intention_opportunities.intention_id
    )
);

-- Inner Oracle Policies
DROP POLICY IF EXISTS "Family members can manage own assessments" ON inner_oracle_assessments;
CREATE POLICY "Family members can manage own assessments"
ON inner_oracle_assessments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.id = inner_oracle_assessments.family_member_id
    )
);

DROP POLICY IF EXISTS "Family members can manage own growth intentions" ON growth_intentions;
CREATE POLICY "Family members can manage own growth intentions"
ON growth_intentions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.id = growth_intentions.family_member_id
    )
);

DROP POLICY IF EXISTS "Family members can manage own reflections" ON reflections;
CREATE POLICY "Family members can manage own reflections"
ON reflections FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.id = reflections.family_member_id
    )
);

-- LiLa System Policies
DROP POLICY IF EXISTS "Family members can manage family lila conversations" ON lila_conversations;
CREATE POLICY "Family members can manage family lila conversations"
ON lila_conversations FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = lila_conversations.family_id
    )
);

DROP POLICY IF EXISTS "Public read for optimization patterns" ON lila_optimization_patterns;
CREATE POLICY "Public read for optimization patterns"
ON lila_optimization_patterns FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admin can manage optimization patterns" ON lila_optimization_patterns;
CREATE POLICY "Super admin can manage optimization patterns"
ON lila_optimization_patterns FOR INSERT, UPDATE, DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

DROP POLICY IF EXISTS "Family members can read own api usage" ON lila_api_usage;
CREATE POLICY "Family members can read own api usage"
ON lila_api_usage FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = lila_api_usage.family_id
    )
);

DROP POLICY IF EXISTS "System can log api usage" ON lila_api_usage;
CREATE POLICY "System can log api usage"
ON lila_api_usage FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = lila_api_usage.family_id
    )
);

-- Mind Sweep Policies
DROP POLICY IF EXISTS "Family members can manage family mindsweep items" ON mindsweep_items;
CREATE POLICY "Family members can manage family mindsweep items"
ON mindsweep_items FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = mindsweep_items.family_id
    )
);

-- Super admin policies for all tables
DROP POLICY IF EXISTS "Super admin can read all inner oracle data" ON inner_oracle_assessments;
CREATE POLICY "Super admin can read all inner oracle data"
ON inner_oracle_assessments FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

DROP POLICY IF EXISTS "Super admin can read all lila data" ON lila_conversations;
CREATE POLICY "Super admin can read all lila data"
ON lila_conversations FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- Helper function for Best Intentions context integration
CREATE OR REPLACE FUNCTION get_family_active_intentions(target_family_id UUID)
RETURNS JSONB AS $$
DECLARE
    intentions JSONB;
BEGIN
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'category', category,
                'title', title,
                'current_state', current_state,
                'desired_state', desired_state,
                'why_it_matters', why_it_matters,
                'priority', priority,
                'related_members', related_members,
                'keywords', keywords
            )
        ),
        '[]'::jsonb
    ) INTO intentions
    FROM best_intentions 
    WHERE family_id = target_family_id 
    AND is_active = true 
    AND is_archived = false
    AND use_as_context = true
    ORDER BY 
        CASE 
            WHEN priority = 'high' THEN 1
            WHEN priority = 'medium' THEN 2
            WHEN priority = 'low' THEN 3
            ELSE 4
        END,
        created_at DESC;
    
    RETURN intentions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for LiLa context optimization
CREATE OR REPLACE FUNCTION update_optimization_pattern_usage(pattern_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE lila_optimization_patterns 
    SET usage_count = usage_count + 1,
        last_used = NOW()
    WHERE id = pattern_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to increment Best Intentions AI reference count
CREATE OR REPLACE FUNCTION increment_intention_ai_reference(intention_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE best_intentions 
    SET ai_reference_count = ai_reference_count + 1,
        last_referenced_at = NOW()
    WHERE id = intention_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's family member record
CREATE OR REPLACE FUNCTION get_user_family_member(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    member_id UUID;
BEGIN
    SELECT id INTO member_id
    FROM family_members 
    WHERE wordpress_user_id::text = target_user_id::text;
    
    RETURN member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;