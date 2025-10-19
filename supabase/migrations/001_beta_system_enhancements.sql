-- Beta System Enhancements Migration
-- Adds indexes, policies, triggers, functions, and views to existing beta tables
-- Super admin emails: tenisewertman@gmail.com, aimagicformoms@gmail.com, 3littlelanterns@gmail.com
--
-- STATUS: PENDING - Not yet applied to database
-- WHEN APPLIED: Update MIGRATION_TRACKING.md with success date

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_beta_users_user_id ON beta_users(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_users_status ON beta_users(status);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_user_id ON feedback_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_status ON feedback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created_at ON feedback_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_timestamp ON user_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_session_id ON user_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_user_id ON staff_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_permission_type ON staff_permissions(permission_type);

-- Enable Row Level Security
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;

-- Beta users policies
DROP POLICY IF EXISTS "Users can read own beta status" ON beta_users;
CREATE POLICY "Users can read own beta status"
ON beta_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can manage beta users" ON beta_users;
CREATE POLICY "Super admin can manage beta users"
ON beta_users FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

DROP POLICY IF EXISTS "Staff can read beta users" ON beta_users;
CREATE POLICY "Staff can read beta users"
ON beta_users FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM staff_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type = 'beta_management'
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    )
);

-- Feedback submissions policies
DROP POLICY IF EXISTS "Users can manage own feedback" ON feedback_submissions;
CREATE POLICY "Users can manage own feedback"
ON feedback_submissions FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can read all feedback" ON feedback_submissions;
CREATE POLICY "Super admin can read all feedback"
ON feedback_submissions FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

DROP POLICY IF EXISTS "Super admin can update feedback" ON feedback_submissions;
CREATE POLICY "Super admin can update feedback"
ON feedback_submissions FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

DROP POLICY IF EXISTS "Staff can read feedback" ON feedback_submissions;
CREATE POLICY "Staff can read feedback"
ON feedback_submissions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM staff_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type IN ('feedback_management', 'beta_management')
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    )
);

-- User activity log policies
DROP POLICY IF EXISTS "Users can log own activity" ON user_activity_log;
CREATE POLICY "Users can log own activity"
ON user_activity_log FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own activity" ON user_activity_log;
CREATE POLICY "Users can read own activity"
ON user_activity_log FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can read all activity logs" ON user_activity_log;
CREATE POLICY "Super admin can read all activity logs"
ON user_activity_log FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

DROP POLICY IF EXISTS "Staff can read activity logs" ON user_activity_log;
CREATE POLICY "Staff can read activity logs"
ON user_activity_log FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM staff_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type IN ('analytics_read', 'beta_management')
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    )
);

-- Staff permissions policies
DROP POLICY IF EXISTS "Users can read own permissions" ON staff_permissions;
CREATE POLICY "Users can read own permissions"
ON staff_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can manage staff permissions" ON staff_permissions;
CREATE POLICY "Super admin can manage staff permissions"
ON staff_permissions FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- Trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_beta_users_updated_at ON beta_users;
CREATE TRIGGER update_beta_users_updated_at 
    BEFORE UPDATE ON beta_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_submissions_updated_at ON feedback_submissions;
CREATE TRIGGER update_feedback_submissions_updated_at 
    BEFORE UPDATE ON feedback_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create beta user records
CREATE OR REPLACE FUNCTION handle_beta_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'is_beta_user' = 'true' THEN
        INSERT INTO beta_users (user_id, created_by)
        VALUES (NEW.id, (NEW.raw_user_meta_data->>'created_by_admin')::UUID)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_beta_created ON auth.users;
CREATE TRIGGER on_auth_user_beta_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_beta_user_creation();

-- Views for admin dashboard
DROP VIEW IF EXISTS beta_user_overview;
CREATE VIEW beta_user_overview AS
SELECT
    bu.id,
    bu.user_id,
    u.email,
    bu.status,
    bu.setup_completed,
    bu.last_active,
    bu.created_at,
    bu.notes,
    COALESCE(fm.name, 'Unknown') as user_name,
    f.family_name,
    (SELECT COUNT(*) FROM user_activity_log WHERE user_id = bu.user_id) as total_actions,
    (SELECT COUNT(*) FROM feedback_submissions WHERE user_id = bu.user_id) as feedback_count,
    (SELECT MAX(timestamp) FROM user_activity_log WHERE user_id = bu.user_id) as last_activity_time
FROM beta_users bu
JOIN auth.users u ON bu.user_id = u.id
LEFT JOIN family_members fm ON bu.user_id = fm.auth_user_id  -- FIXED: Changed from wordpress_user_id
LEFT JOIN families f ON fm.family_id = f.id
ORDER BY bu.created_at DESC;

DROP VIEW IF EXISTS feedback_dashboard;
CREATE VIEW feedback_dashboard AS
SELECT
    fs.id,
    fs.user_id,
    u.email,
    COALESCE(fm.name, 'Unknown') as user_name,
    fs.issue_type,
    fs.priority,
    fs.description,
    fs.page_url,
    fs.status,
    fs.admin_response,
    fs.created_at,
    fs.updated_at,
    (
        SELECT COUNT(*)
        FROM feedback_submissions fs2
        WHERE fs2.page_url = fs.page_url
        AND fs2.issue_type = fs.issue_type
        AND fs2.created_at > fs.created_at - INTERVAL '7 days'
    ) as similar_issues_count
FROM feedback_submissions fs
JOIN auth.users u ON fs.user_id = u.id
LEFT JOIN family_members fm ON fs.user_id = fm.auth_user_id  -- FIXED: Changed from wordpress_user_id
LEFT JOIN families f ON fm.family_id = f.id
ORDER BY
    CASE
        WHEN fs.priority = 'blocking' THEN 1
        WHEN fs.priority = 'annoying' THEN 2
        ELSE 3
    END,
    fs.created_at DESC;