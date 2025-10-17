-- Comprehensive AIM System Update Migration
-- Includes: Best Intentions, Inner Oracle, Enhanced Family Context, LiLa Optimizer, Mind Sweep Integration
-- 
-- STATUS: PENDING - Not yet applied to database
-- WHEN APPLIED: Update MIGRATION_TRACKING.md with success date

-- Best Intentions System Tables
CREATE TABLE IF NOT EXISTS best_intentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('family_relationships', 'personal_growth', 'household_culture', 'spiritual_development')),
    title TEXT NOT NULL,
    description TEXT,
    context JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS intention_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intention_id UUID REFERENCES best_intentions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    progress_note TEXT,
    milestone TEXT,
    reflection JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intention_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intention_id UUID REFERENCES best_intentions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    opportunity_context TEXT NOT NULL,
    ai_suggestion TEXT,
    was_acted_upon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inner Oracle/Self-Discovery System
CREATE TABLE IF NOT EXISTS inner_oracle_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assessment_type TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]',
    responses JSONB NOT NULL DEFAULT '{}',
    insights JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_intentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    area_of_growth TEXT NOT NULL,
    current_state TEXT,
    desired_outcome TEXT,
    action_steps JSONB DEFAULT '[]',
    progress_markers JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reflections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reflection_type TEXT NOT NULL,
    prompt TEXT,
    response TEXT,
    insights JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Family Context Storage
CREATE TABLE IF NOT EXISTS family_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    context_type TEXT NOT NULL,
    context_data JSONB NOT NULL DEFAULT '{}',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LiLa Optimizer System
CREATE TABLE IF NOT EXISTS lila_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_thread_id TEXT,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    context_used JSONB DEFAULT '{}',
    optimization_score INTEGER CHECK (optimization_score >= 1 AND optimization_score <= 10),
    user_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lila_optimization_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pattern_type TEXT NOT NULL,
    pattern_data JSONB NOT NULL DEFAULT '{}',
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lila_api_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT NOT NULL,
    request_data JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mind Sweep Integration
CREATE TABLE IF NOT EXISTS mindsweep_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_text TEXT NOT NULL,
    category TEXT,
    ai_classification JSONB DEFAULT '{}',
    potential_intention BOOLEAN DEFAULT false,
    intention_id UUID REFERENCES best_intentions(id) ON DELETE SET NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_best_intentions_user_id ON best_intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_best_intentions_type ON best_intentions(type);
CREATE INDEX IF NOT EXISTS idx_best_intentions_is_active ON best_intentions(is_active);
CREATE INDEX IF NOT EXISTS idx_intention_progress_intention_id ON intention_progress(intention_id);
CREATE INDEX IF NOT EXISTS idx_intention_progress_user_id ON intention_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_intention_opportunities_intention_id ON intention_opportunities(intention_id);
CREATE INDEX IF NOT EXISTS idx_intention_opportunities_user_id ON intention_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_inner_oracle_assessments_user_id ON inner_oracle_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_intentions_user_id ON growth_intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_family_context_family_id ON family_context(family_id);
CREATE INDEX IF NOT EXISTS idx_lila_conversations_user_id ON lila_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_lila_optimization_patterns_user_id ON lila_optimization_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_lila_api_usage_user_id ON lila_api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_mindsweep_items_user_id ON mindsweep_items(user_id);
CREATE INDEX IF NOT EXISTS idx_mindsweep_items_processed ON mindsweep_items(processed);

-- Enable Row Level Security
ALTER TABLE best_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inner_oracle_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE lila_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lila_optimization_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lila_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindsweep_items ENABLE ROW LEVEL SECURITY;

-- Best Intentions Policies
DROP POLICY IF EXISTS "Users can manage own best intentions" ON best_intentions;
CREATE POLICY "Users can manage own best intentions"
ON best_intentions FOR ALL
TO authenticated
USING (user_id = auth.uid());

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
DROP POLICY IF EXISTS "Users can manage own intention progress" ON intention_progress;
CREATE POLICY "Users can manage own intention progress"
ON intention_progress FOR ALL
TO authenticated
USING (user_id = auth.uid());

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
DROP POLICY IF EXISTS "Users can manage own intention opportunities" ON intention_opportunities;
CREATE POLICY "Users can manage own intention opportunities"
ON intention_opportunities FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Inner Oracle Policies
DROP POLICY IF EXISTS "Users can manage own assessments" ON inner_oracle_assessments;
CREATE POLICY "Users can manage own assessments"
ON inner_oracle_assessments FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own growth intentions" ON growth_intentions;
CREATE POLICY "Users can manage own growth intentions"
ON growth_intentions FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own reflections" ON reflections;
CREATE POLICY "Users can manage own reflections"
ON reflections FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Family Context Policies
DROP POLICY IF EXISTS "Family members can read family context" ON family_context;
CREATE POLICY "Family members can read family context"
ON family_context FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = family_context.family_id
    )
);

DROP POLICY IF EXISTS "Family members can insert family context" ON family_context;
CREATE POLICY "Family members can insert family context"
ON family_context FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.wordpress_user_id::text = auth.uid()::text 
        AND fm.family_id = family_context.family_id
    )
);

DROP POLICY IF EXISTS "Context creators can update own context" ON family_context;
CREATE POLICY "Context creators can update own context"
ON family_context FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- LiLa System Policies
DROP POLICY IF EXISTS "Users can manage own lila conversations" ON lila_conversations;
CREATE POLICY "Users can manage own lila conversations"
ON lila_conversations FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own optimization patterns" ON lila_optimization_patterns;
CREATE POLICY "Users can manage own optimization patterns"
ON lila_optimization_patterns FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own api usage" ON lila_api_usage;
CREATE POLICY "Users can read own api usage"
ON lila_api_usage FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can log api usage" ON lila_api_usage;
CREATE POLICY "System can log api usage"
ON lila_api_usage FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Mind Sweep Policies
DROP POLICY IF EXISTS "Users can manage own mindsweep items" ON mindsweep_items;
CREATE POLICY "Users can manage own mindsweep items"
ON mindsweep_items FOR ALL
TO authenticated
USING (user_id = auth.uid());

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

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_best_intentions_updated_at ON best_intentions;
CREATE TRIGGER update_best_intentions_updated_at 
    BEFORE UPDATE ON best_intentions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_intention_opportunities_updated_at ON intention_opportunities;
CREATE TRIGGER update_intention_opportunities_updated_at 
    BEFORE UPDATE ON intention_opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inner_oracle_assessments_updated_at ON inner_oracle_assessments;
CREATE TRIGGER update_inner_oracle_assessments_updated_at 
    BEFORE UPDATE ON inner_oracle_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_growth_intentions_updated_at ON growth_intentions;
CREATE TRIGGER update_growth_intentions_updated_at 
    BEFORE UPDATE ON growth_intentions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_context_updated_at ON family_context;
CREATE TRIGGER update_family_context_updated_at 
    BEFORE UPDATE ON family_context 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lila_optimization_patterns_updated_at ON lila_optimization_patterns;
CREATE TRIGGER update_lila_optimization_patterns_updated_at 
    BEFORE UPDATE ON lila_optimization_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mindsweep_items_updated_at ON mindsweep_items;
CREATE TRIGGER update_mindsweep_items_updated_at 
    BEFORE UPDATE ON mindsweep_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function for Best Intentions context integration
CREATE OR REPLACE FUNCTION get_user_active_intentions(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    intentions JSONB;
BEGIN
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'type', type,
                'title', title,
                'description', description,
                'context', context,
                'priority', priority
            )
        ),
        '[]'::jsonb
    ) INTO intentions
    FROM best_intentions 
    WHERE user_id = target_user_id 
    AND is_active = true 
    AND archived_at IS NULL
    ORDER BY priority DESC, created_at DESC;
    
    RETURN intentions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for LiLa context optimization
CREATE OR REPLACE FUNCTION update_optimization_pattern_usage(pattern_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE lila_optimization_patterns 
    SET usage_count = usage_count + 1,
        last_used = NOW(),
        updated_at = NOW()
    WHERE id = pattern_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;