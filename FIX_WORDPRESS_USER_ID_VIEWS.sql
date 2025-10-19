-- Fix wordpress_user_id References in Database Views
-- Run this in your Supabase SQL Editor to fix Beta Admin loading issue
-- Date: October 19, 2025

-- FIXED: Beta User Overview View (using auth_user_id instead of wordpress_user_id)
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

-- FIXED: Feedback Dashboard View (using auth_user_id instead of wordpress_user_id)
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
