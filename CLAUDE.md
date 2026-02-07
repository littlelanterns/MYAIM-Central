# MyAIM-Central - Claude Code Instructions

## CRITICAL BEHAVIOR RULES

1. **ALWAYS ask what I want before writing any code.** Understand my goal first, then propose options for how to accomplish it. Wait for my approval before writing a single line.
2. **NEVER invent table names, column names, or database structures.** Use ONLY the tables and columns documented in this file. If you think a column should exist but it's not listed here, ASK ME before assuming it exists.
3. **When I describe a bug or error**, identify 3-5 possible causes and suggest the best fix options. Do not jump straight to rewriting code.
4. **For changes that touch multiple systems**, map out ALL affected components first and get my approval before making changes.
5. **No emoji icons in adult UI components.** Use text-based buttons and labels. Emojis are only permitted in children's dashboard modes (Play Mode).
6. **Reference the Faith & Ethics Framework** (docs/AIMfM_Faith_Ethics_Framework_Complete.md) when making decisions about AI interactions, content guardrails, user boundaries, or any feature involving LiLa, ThoughtSift, or Inner Oracle.
7. **Mobile-first design always.** All UI components must work on mobile before considering desktop layout.

---

## PROJECT OVERVIEW

**MyAIM-Central** (also known as AIMagicForMoms / AIMfM) is a Family-Aware AI Infrastructure platform.

**Mission:** Empower mothers to effectively leverage AI technology while maintaining family context, values, and human connection. Enhancement, not replacement.

**Tech Stack:**
- Frontend: React 18 + TypeScript, React Router, CSS Variables (20+ themes)
- Backend: Supabase (PostgreSQL + Auth + Storage + Real-time)
- Hosting: Vercel (auto-deploys from GitHub)
- AI: OpenRouter API (various models)
- Dev: VS Code + Claude Code

**Three Pillars:**
1. **Library Vault** (Education Hub) - Netflix-style AI tutorials, tools, templates
2. **Archives System** (Context Engine) - Family context storage with checkbox privacy control
3. **LiLa Optimizer** (AI Enhancement) - Context-aware prompt optimization

---

## AUTHENTICATION FLOW

```
auth.users (Supabase Auth)
  └── families (via auth_user_id)
       └── family_members (via family_id)
            └── Each member has their own: dashboard_configs, tasks, rewards, etc.
```

- Primary parent's `auth_user_id` links to `families.auth_user_id`
- Primary parent also has `auth_user_id` set on their `family_members` record
- Other family members have `auth_user_id: null` unless they have their own login
- Check `src/components/auth/shared/AuthContext.tsx` for auth state
- Family setup: `src/components/auth/ForcedFamilySetup.jsx`

**IMPORTANT: `beta_users` table is NOT part of the auth flow.** It is only used for:
- Showing/hiding the beta feedback button
- Tracking founding family pricing tier
- Enabling beta-specific features (future)

The correct auth flow is:
1. Supabase auth (email/password) → get user ID
2. Query `family_members` WHERE `auth_user_id` = user.id → get family member data
3. That's it. No beta_users lookup needed for login.

Beta user status can be checked separately AFTER login is complete for feature flags.

---

## SUPABASE DATABASE SCHEMA (SOURCE OF TRUTH)

**NEVER create, reference, or query columns/tables not listed below.**
**If you need a column that doesn't exist, tell me and we'll add it properly.**

### Core Family Tables

**families**
id (uuid), family_name (text), subscription_tier (text), default_context_settings (jsonb), context_privacy_level (text), connected_platforms (jsonb), context_usage_patterns (jsonb), optimization_preferences (jsonb), created_at (timestamp), updated_at (timestamp), auth_user_id (uuid), family_login_name (text), is_founding_family (boolean), founding_family_rate (numeric), founding_family_joined_at (timestamp), membership_status (text)

**family_members**
id (uuid), family_id (uuid), heartbeat_profile_id (bigint), name (text), role (text), age (integer), personality_traits (jsonb), learning_style (text), interests (ARRAY), challenges (ARRAY), strengths (ARRAY), privacy_level (text), can_modify_context (boolean), supervised_by (uuid), created_at (timestamp), updated_at (timestamp), dashboard_type (text), unique_qr_code (text), points_balance (integer), level (integer), theme_preference (text), background_image (text), gamification_level (text), use_emojis (boolean), content_filter_level (text), ai_interaction_monitor (boolean), daily_usage_limit_minutes (integer), requires_parent_approval (boolean), color (text), status (text), avatar (text), current_challenges (ARRAY), motivators (ARRAY), badges_earned (ARRAY), permissions (jsonb), birthday (date), nicknames (ARRAY), relationship_level (text), access_level (text), custom_role (text), in_household (boolean), contact_frequency (text), spouse_name (text), family_notes (text), is_teacher_coach (boolean), display_title (text), is_primary_parent (boolean), pin (text), auth_user_id (uuid), dashboard_mode (varchar), week_start_preference (varchar), member_color (varchar), avatar_url (text)

**family_context**
id (uuid), family_member_id (uuid), context_type (varchar), context_data (jsonb), source (varchar), confidence_score (numeric), approved_by_user (boolean), is_active (boolean), created_at (timestamp), updated_at (timestamp)

### Archives System Tables

**archive_folders**
id (uuid), family_id (uuid), parent_folder_id (uuid), folder_name (text), folder_type (text), member_id (uuid), icon (text), cover_photo_url (text), color_hex (text), description (text), is_active (boolean), required_tier (text), sort_order (integer), created_at (timestamp with time zone), updated_at (timestamp with time zone), is_master (boolean)

**archive_context_items**
id (uuid), folder_id (uuid), context_field (text), context_value (text), context_type (text), use_for_context (boolean), added_by (text), conversation_reference (uuid), suggested_by_lila (boolean), suggestion_accepted (boolean), suggestion_reasoning (text), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**archive_inheritance_rules**
id (uuid), child_folder_id (uuid), parent_folder_id (uuid), inherit_all (boolean), inherit_fields (ARRAY), allow_override (boolean), created_at (timestamp with time zone)

### Best Intentions System Tables

**best_intentions**
id (uuid), family_id (uuid), created_by (uuid), title (text), current_state (text), desired_state (text), why_it_matters (text), category (varchar), priority (varchar), is_active (boolean), is_archived (boolean), archived_reason (varchar), related_members (ARRAY), keywords (ARRAY), ai_reference_count (integer), last_referenced_at (timestamp), progress_notes (jsonb), use_as_context (boolean), created_at (timestamp), updated_at (timestamp), privacy_level (text), category_id (uuid), show_in_quick_actions (boolean), show_in_command_center (boolean), show_in_archives (boolean), linked_archive_folder_id (uuid)

**intention_categories**
id (uuid), family_id (uuid), category_name (text), display_name (text), description (text), icon (text), color_hex (text), sort_order (integer), category_type (text), source_type (text), source_id (uuid), is_active (boolean), created_at (timestamp), updated_at (timestamp)

**intention_progress**
id (uuid), intention_id (uuid), entry_type (varchar), content (text), created_by (uuid), created_at (timestamp)

**intention_opportunities**
id (uuid), intention_id (uuid), opportunity_context (text), ai_suggestion (text), was_accepted (boolean), user_feedback (text), created_at (timestamp)

### Task System Tables

**tasks**
id (uuid), family_id (uuid), task_name (text), description (text), duration (text), task_image_url (text), task_type (text), assignee (ARRAY), frequency_details (jsonb), incomplete_action (text), reward_type (text), reward_amount (text), reward_details (jsonb), require_approval (boolean), subtasks (ARRAY), status (text), qr_code_url (text), created_at (timestamp), updated_at (timestamp), due_date (timestamp), completed_at (timestamp), approved_by (uuid), approved_at (timestamp), context_categories_used (ARRAY), ai_optimization_data (jsonb), task_frequency (text), task_category (text), opportunity_type (text), points_value (integer), ai_subtasks (jsonb), completion_photo_local (text), photo_processed (boolean), created_by (uuid), priority (text), pipedream_processed (boolean), ai_insights (jsonb), difficulty_level (integer), completion_photo (text), completion_note (text), parent_approved (boolean), target_type (text), verification_required (text)

**task_subtasks**
id (uuid), task_id (uuid), title (text), completed (boolean)

**task_completions**
id (uuid), task_id (uuid), family_id (uuid), completed_by (uuid), completion_method (text), completion_quality_score (double precision), completion_time_minutes (integer), completion_notes (text), context_at_completion (jsonb), created_at (timestamp)

**task_templates**
id (uuid), family_id (uuid), template_name (text), task_name (text), description (text), duration (text), task_image_url (text), task_type (text), default_assignee (ARRAY), frequency (text), frequency_details (jsonb), incomplete_action (text), reward_type (text), reward_amount (text), reward_details (jsonb), require_approval (boolean), subtasks (ARRAY), is_active (boolean), created_at (timestamp), updated_at (timestamp), created_by (uuid), usage_count (integer), last_used_at (timestamp), context_categories_suggested (ARRAY)

**task_rewards**
id (uuid), task_id (uuid), reward_type (varchar), reward_amount (integer), bonus_threshold (numeric), bonus_amount (integer), created_at (timestamp with time zone)

### Dashboard & UI Tables

**dashboard_configs**
id (uuid), family_member_id (uuid), dashboard_type (varchar), dashboard_mode (varchar), widgets (jsonb), layout (jsonb), is_personal (boolean), created_at (timestamp with time zone), updated_at (timestamp with time zone), gamification_system (varchar), selected_theme (varchar), widget_layout (varchar), victory_settings (jsonb)

**widget_permissions**
id (uuid), dashboard_config_id (uuid), widget_id (varchar), visible_to (varchar), editable_by (varchar), created_at (timestamp with time zone)

**quick_action_usage**
id (uuid), family_member_id (uuid), action_name (text), click_count (integer), last_used_at (timestamp with time zone), created_at (timestamp with time zone), updated_at (timestamp with time zone)

### LiLa & AI Tables

**lila_conversations**
id (uuid), family_id (uuid), user_id (uuid), original_prompt (text), optimized_prompt (text), intentions_used (ARRAY), context_used (jsonb), optimization_method (varchar), ai_model_used (varchar), was_accepted (boolean), user_feedback (text), tokens_used (integer), cost_usd (numeric), created_at (timestamp)

**lila_context_suggestions**
id (uuid), family_id (uuid), conversation_reference (uuid), suggested_context_field (text), suggested_context_value (text), suggested_folder_id (uuid), suggestion_type (text), reasoning (text), confidence_score (numeric), detected_pattern (text), status (text), mom_modified_value (text), responded_at (timestamp with time zone), responded_by (uuid), created_at (timestamp with time zone)

**lila_api_usage**
id (uuid), family_id (uuid), api_provider (varchar), model_used (varchar), tokens_used (integer), cost_usd (numeric), request_type (varchar), created_at (timestamp)

**lila_optimization_patterns**
id (uuid), prompt_type (varchar), pattern_template (text), success_rate (numeric), usage_count (integer), created_at (timestamp), last_used (timestamp)

**personal_prompt_library**
id (uuid), family_id (uuid), created_by (uuid), prompt_title (text), prompt_description (text), original_request (text), optimized_prompt (text), category (text), tags (ARRAY), context_snapshot (jsonb), folders_used (ARRAY), target_platform (text), times_used (integer), last_used_at (timestamp with time zone), is_favorite (boolean), is_public (boolean), share_code (text), created_at (timestamp with time zone), updated_at (timestamp with time zone)

### Library System Tables

**library_items**
id (uuid), title (text), description (text), short_description (text), category (text), subcategory (text), difficulty_level (text), estimated_time_minutes (integer), content_type (text), required_tier (text), content_url (text), thumbnail_url (text), preview_image_url (text), tags (ARRAY), prerequisites (ARRAY), learning_outcomes (ARRAY), tools_mentioned (ARRAY), is_featured (boolean), is_new (boolean), sort_order (integer), view_count (integer), bookmark_count (integer), average_rating (numeric), created_at (timestamp), updated_at (timestamp), created_by (uuid), status (text), engagement_likes (integer), engagement_favorites (integer), engagement_comments (integer), tool_type (text), tool_url (text), embedding_method (text), portal_description (text), portal_tips (ARRAY), prerequisites_text (text), requires_auth (boolean), auth_provider (text), first_seen_tracking (boolean), new_badge_duration_days (integer), seasonal_tags (ARRAY), gift_idea_tags (ARRAY), seasonal_priority (integer), allowed_tiers (ARRAY), enable_usage_limits (boolean), usage_limit_type (text), usage_limit_amount (integer), usage_limit_notes (text), session_timeout_minutes (integer)

**library_categories**
id (text), display_name (text), description (text), icon_name (text), color_hex (text), sort_order (integer), is_active (boolean), created_at (timestamp)

**user_library_progress**
id (uuid), user_id (uuid), library_item_id (uuid), status (text), progress_percent (integer), last_accessed (timestamp), time_spent_minutes (integer), notes (text), completed_at (timestamp)

**user_library_bookmarks**
id (uuid), user_id (uuid), library_item_id (uuid), created_at (timestamp)

### Rewards & Gamification Tables

**family_rewards**
id (uuid), family_id (uuid), created_by (uuid), title (varchar), description (text), reward_type (varchar), cost (integer), category (varchar), assigned_to (uuid), contribution_rule (varchar), contributors (jsonb), bulk_recipients (jsonb), is_active (boolean), is_redeemable (boolean), max_redemptions (integer), current_redemptions (integer), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**family_reward_types**
id (uuid), family_id (uuid), reward_type (varchar), display_name (varchar), icon (varchar), color (varchar), is_active (boolean), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**member_reward_balances**
id (uuid), family_member_id (uuid), reward_type (varchar), current_balance (integer), lifetime_earned (integer), lifetime_spent (integer), last_updated (timestamp with time zone)

**reward_transactions**
id (uuid), family_member_id (uuid), reward_type (varchar), transaction_type (varchar), amount (integer), source_type (varchar), source_id (uuid), description (text), created_by (uuid), created_at (timestamp with time zone)

**reward_redemptions**
id (uuid), reward_id (uuid), redeemed_by (uuid), amount_spent (integer), status (varchar), notes (text), redeemed_at (timestamp with time zone), approved_by (uuid), approved_at (timestamp with time zone), completed_at (timestamp with time zone)

**gamification_progress**
id (uuid), family_member_id (uuid), theme (varchar), level (integer), points (integer), points_to_next_level (integer), items (jsonb), achievements (jsonb), current_streak (integer), longest_streak (integer), last_activity_date (date), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**achievements**
id (uuid), member_id (uuid), achievement_type (text), points_awarded (integer), earned_at (timestamp)

### Victory & Reflection Tables

**victories**
id (uuid), family_member_id (uuid), description (text), category (varchar), celebration_message (text), voice_url (text), tags (ARRAY), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**victory_celebrations**
id (uuid), victory_id (uuid), celebration_text (text), voice_provider (varchar), voice_id (varchar), playback_count (integer), last_played_at (timestamp with time zone), created_at (timestamp with time zone)

**reflections**
id (uuid), family_member_id (uuid), prompt (text), response (text), reflection_date (date), mood (varchar), tags (ARRAY)

**growth_intentions**
id (uuid), family_member_id (uuid), intention (text), category (varchar), date_set (timestamp), is_active (boolean)

### Calendar & Events Tables

**calendar_events**
id (uuid), title (varchar), description (text), location (varchar), start_time (timestamp with time zone), end_time (timestamp with time zone), is_all_day (boolean), event_type (varchar), category (varchar), priority (varchar), color (varchar), source (varchar), external_id (varchar), is_recurring (boolean), recurrence_type (varchar), recurrence_interval (integer), recurrence_end_date (timestamp with time zone), recurrence_days (jsonb), recurrence_count (integer), created_by (uuid), family_id (uuid), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**event_attendees**
id (uuid), event_id (uuid), family_member_id (uuid), can_edit (boolean), can_view (boolean), rsvp_status (varchar), added_at (timestamp with time zone)

### Context & Learning Tables

**context_categories**
id (uuid), family_id (uuid), category_name (text), category_type (text), display_name (text), icon (text), is_enabled (boolean), priority_order (integer), privacy_level (text), context_data (jsonb), relevance_keywords (ARRAY), usage_count (integer), last_used_at (timestamp), effectiveness_score (double precision), created_at (timestamp), updated_at (timestamp)

**context_items**
id (uuid), category_id (uuid), family_id (uuid), item_name (text), item_type (text), content (jsonb), relevance_score (double precision), usage_frequency (integer), last_accessed (timestamp), keywords (ARRAY), summary (text), created_at (timestamp), updated_at (timestamp)

**context_effectiveness**
id (uuid), family_id (uuid), category_id (uuid), times_included (integer), times_helpful (integer), times_ignored (integer), user_corrections (integer), session_satisfaction_sum (double precision), session_count (integer), avg_satisfaction (double precision), last_effectiveness_update (timestamp), trend_direction (text), created_at (timestamp), updated_at (timestamp)

**conversation_sessions**
id (uuid), family_id (uuid), creator_id (uuid), session_name (text), platforms_used (ARRAY), context_snapshot (jsonb), original_prompt (text), optimized_prompt (text), context_categories_used (ARRAY), optimization_reasoning (text), allowed_family_members (ARRAY), privacy_level (text), expires_at (timestamp), is_active (boolean), created_at (timestamp), updated_at (timestamp)

**family_learning_patterns**
id (uuid), family_id (uuid), pattern_type (text), pattern_data (jsonb), confidence_score (double precision), occurrence_count (integer), last_observed (timestamp), is_active (boolean), applied_automatically (boolean), created_at (timestamp), updated_at (timestamp)

**vector_embeddings**
id (uuid), family_id (uuid), source_type (text), source_id (uuid), content_chunk (text), embedding (USER-DEFINED), content_category (text), relevance_keywords (ARRAY), family_member_relevance (ARRAY), created_at (timestamp)

### MindSweep Table

**mindsweep_items**
id (uuid), family_id (uuid), created_by (uuid), source (text), content_type (text), raw_content (text), processed_content (jsonb), ai_category (text), ai_priority (integer), ai_tags (ARRAY), ai_summary (text), assigned_to (uuid), project_reference (uuid), due_date (date), status (text), related_context_categories (ARRAY), generated_context (jsonb), created_at (timestamp), updated_at (timestamp)

### Persona & Prompt Tables

**personas**
id (uuid), persona_name (text), display_name (text), category (text), description (text), core_philosophy (text), icon (text), trigger_keywords (ARRAY), use_cases (ARRAY), base_prompt_template (text), context_requirements (jsonb), is_active (boolean), created_at (timestamp)

**mini_personas**
id (uuid), parent_persona_id (uuid), mini_persona_name (text), display_name (text), purpose (text), trigger_conditions (jsonb), priority_level (integer), created_at (timestamp)

**prompt_templates**
id (uuid), mini_persona_id (uuid), template_name (text), template_version (integer), role_template (text), task_template (text), input_variables (jsonb), output_format (text), constraints (jsonb), capabilities (jsonb), reminders (text), required_context_categories (ARRAY), optional_context_categories (ARRAY), family_context_variables (jsonb), usage_count (integer), success_rate (double precision), user_satisfaction (double precision), is_active (boolean), created_at (timestamp), updated_at (timestamp)

### User & Admin Tables

**beta_users**
id (uuid), user_id (uuid), status (text), beta_tier (text), setup_completed (boolean), last_active (timestamp with time zone), total_sessions (integer), total_feedback_submissions (integer), beta_code (text), invited_by (uuid), created_at (timestamp with time zone), updated_at (timestamp with time zone), notes (text), features_enabled (jsonb)

**user_permissions**
id (uuid), user_id (text), permissions (jsonb), created_at (timestamp), updated_at (timestamp)

**user_preferences**
id (uuid), user_id (text), preference_type (text), preference_value (jsonb), created_at (timestamp), updated_at (timestamp)

**staff_permissions**
id (uuid), user_id (uuid), permission_type (text), is_active (boolean), expires_at (timestamp with time zone), granted_by (uuid), granted_at (timestamp with time zone), notes (text), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**subscription_tiers**
tier_name (text), display_name (text), tier_level (integer), monthly_price (numeric), description (text), created_at (timestamp)

### Feedback & Activity Tables

**feedback_submissions**
id (uuid), user_id (uuid), page_url (text), issue_type (text), priority (text), description (text), screenshot_url (text), context_data (jsonb), status (text), admin_response (text), admin_id (uuid), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**user_activity_log**
id (uuid), user_id (uuid), page_visited (text), action_taken (text), session_id (text), timestamp (timestamp with time zone), metadata (jsonb)

### Play Mode Tables

**play_mode_activities**
id (uuid), family_member_id (uuid), title (varchar), emoji (varchar), image_url (text), time_of_day (varchar), is_recurring (boolean), recurrence_pattern (varchar), points (integer), is_active (boolean), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**daily_activity_completions**
id (uuid), family_member_id (uuid), activity_id (uuid), completion_date (date), completed_at (timestamp with time zone), points_earned (integer), celebration_triggered (boolean)

### Content & Community Tables

**articles**
id (uuid), slug (text), title (text), excerpt (text), content (text), featured_image_url (text), category (text), author_id (uuid), published_at (timestamp), status (text), view_count (integer), created_at (timestamp), updated_at (timestamp)

**testimonials**
id (uuid), image_url (text), testimonial_text (text), display_title (text), name (text), family_description (text), status (text), display_order (integer), created_at (timestamp), updated_at (timestamp)

### Vault Content & Comments Tables

**vc_comments**
id (uuid), vault_content_id (uuid), parent_comment_id (uuid), user_id (uuid), author_name (text), content (text), depth_level (integer), moderation_status (text), sentiment_score (numeric), flagged_keywords (ARRAY), report_count (integer), created_at (timestamp with time zone), updated_at (timestamp with time zone)

**vc_engagement**
id (uuid), vault_content_id (uuid), user_id (uuid), engagement_type (text), created_at (timestamp with time zone)

### Access & Security Tables

**pin_attempt_log**
id (uuid), family_member_id (uuid), attempted_at (timestamp with time zone), was_successful (boolean), ip_address (inet), user_agent (text), created_at (timestamp with time zone)

**qr_access_logs**
id (uuid), member_id (uuid), accessed_at (timestamp), device_info (text), ip_address (inet)

**tool_sessions**
id (uuid), user_id (uuid), library_item_id (uuid), session_token (text), started_at (timestamp), expires_at (timestamp), last_activity (timestamp), ended_at (timestamp), usage_count_today (integer)

### External Integration Tables

**external_integrations**
id (uuid), family_id (uuid), service_name (text), connection_status (text), service_config (jsonb), sync_settings (jsonb), last_sync_at (timestamp), next_sync_at (timestamp), sync_frequency_hours (integer), context_category_mapping (jsonb), created_at (timestamp), updated_at (timestamp)

**platform_responses**
id (uuid), session_id (uuid), platform_name (text), model_used (text), prompt_sent (text), response_received (text), response_time_ms (integer), token_count_estimate (integer), user_satisfaction (integer), copied_to_clipboard (boolean), saved_to_notepad (boolean), sent_to_mindsweep (boolean), created_at (timestamp)

### Inner Oracle Tables

**inner_oracle_assessments**
id (uuid), family_member_id (uuid), assessment_type (varchar), results (jsonb), insights (text), uploaded_date (timestamp), last_updated (timestamp), is_active (boolean), file_url (text)

### Views (Read-Only - Do Not INSERT/UPDATE)

**active_admins** - Shows active admin users
**active_beta_testers** - Shows active beta testers
**beta_user_overview** - Combined beta user info
**feedback_dashboard** - Combined feedback info

---

## KEY DATA RELATIONSHIPS

```
families.auth_user_id → auth.users.id (one family per auth user)
family_members.family_id → families.id (many members per family)
family_members.auth_user_id → auth.users.id (optional, for members with own login)
family_members.supervised_by → family_members.id (parent oversight)

best_intentions.family_id → families.id
best_intentions.created_by → family_members.id
best_intentions.category_id → intention_categories.id
best_intentions.related_members → family_members.id[] (ARRAY of UUIDs)

tasks.family_id → families.id
tasks.assignee → family_members.id[] (ARRAY of UUIDs)
tasks.created_by → family_members.id
tasks.approved_by → family_members.id

archive_folders.family_id → families.id
archive_folders.member_id → family_members.id
archive_folders.parent_folder_id → archive_folders.id (self-referencing)
archive_context_items.folder_id → archive_folders.id

dashboard_configs.family_member_id → family_members.id
victories.family_member_id → family_members.id
reflections.family_member_id → family_members.id
gamification_progress.family_member_id → family_members.id
member_reward_balances.family_member_id → family_members.id

lila_conversations.family_id → families.id
lila_conversations.user_id → auth.users.id

library_items.category → library_categories.id
user_library_progress.library_item_id → library_items.id

calendar_events.family_id → families.id
calendar_events.created_by → family_members.id
event_attendees.family_member_id → family_members.id
```

---

## COMPONENT ARCHITECTURE

### Key Source Files

**Authentication:**
- `src/components/auth/shared/AuthContext.tsx` - Auth state management
- `src/components/auth/ForcedFamilySetup.jsx` - Initial family setup
- `src/components/auth/AuthUI.tsx` - Login/signup interface

**Family Management:**
- `src/components/family/shared/FamilyContext.tsx` - Family state (React Context)
- `src/components/family/FamilySettings/index.tsx` - Family settings interface
- `src/components/family/FamilyMemberForm.tsx` - Add/edit member form

**Dashboards:**
- Dashboard types: Play (young children), Guided (elementary), Independent (teens/adults)
- `src/components/dashboard/` - Dashboard components
- Widget system with drag-and-drop layout

**Best Intentions:**
- `src/components/intentions/` - Intention CRUD components
- Categories: 4 system defaults + custom per family

**Archives:**
- `src/components/archives/FamilyArchiveSystem.tsx` - Main archive UI
- Bublup-style folder organization
- Checkbox-controlled context sharing

**LiLa Optimizer:**
- `src/components/global/LilaOptimizer.js` - Main optimizer
- Reads: family_context (active), best_intentions (active)
- Outputs: Optimized prompts for external AI platforms

**Library:**
- `src/components/Library/` - Netflix-style browsing
- Tool embedding via iframes
- Progress tracking per user

**Tasks:**
- `src/components/tasks/TaskCreationModal.tsx` - Task creation
- `src/components/tasks/TaskCard.tsx` - Task display
- Completion flow: pending → pending_approval (if required) → complete

---

## FAMILY MEMBER DATA FLOWS

Family members are central to almost every system. When working on any feature, consider:

- **Dashboards** read from: family_members (dashboard_type, dashboard_mode, theme_preference)
- **Tasks** reference: family_members.id in assignee ARRAY and created_by
- **Best Intentions** reference: family_members.id in related_members ARRAY and created_by
- **Archives** reference: family_members.id in archive_folders.member_id
- **Rewards** track per member: member_reward_balances.family_member_id
- **Victories** belong to: family_members.id
- **Gamification** tracks per member: gamification_progress.family_member_id
- **Calendar** events link to members via: event_attendees.family_member_id
- **Context** is stored per member: family_context.family_member_id
- **Play Mode** activities belong to: play_mode_activities.family_member_id

---

## COMMON SUPABASE QUERIES

**Get family for logged-in user:**
```typescript
const { data: family } = await supabase
  .from('families')
  .select('*, family_members(*)')
  .eq('auth_user_id', user.id)
  .single();
```

**Get tasks for a family member:**
```typescript
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('family_id', familyId)
  .contains('assignee', [memberId])
  .eq('status', 'pending')
  .order('due_date', { ascending: true });
```

**Get active Best Intentions:**
```typescript
const { data: intentions } = await supabase
  .from('best_intentions')
  .select('*, intention_categories(category_name, display_name, icon)')
  .eq('family_id', familyId)
  .eq('is_active', true);
```

**Get active context for LiLa:**
```typescript
const { data: context } = await supabase
  .from('family_context')
  .select('*')
  .eq('family_member_id', memberId)
  .eq('is_active', true);
```

---

## DESIGN PRINCIPLES

1. **Enhancement, not replacement** - AI amplifies mom's wisdom, doesn't replace it
2. **Human-in-the-Mix** - Every AI output has Edit, Approve, Regenerate, Reject options
3. **Mom-centric control** - Primary parent has full control over all family data
4. **Portable context** - Build family info once, use across any AI platform
5. **Faith-aware & pluralistic** - Respects all faith traditions (see Faith & Ethics Framework)
6. **Processing partner, not companion** - LiLa helps think through problems, redirects to human connection
7. **Privacy by design** - Checkbox-controlled context sharing, granular permissions
8. **Mobile-first** - All features must work on mobile devices
9. **No emoji in adult interfaces** - Text-based buttons and labels for adult dashboards
10. **Capability-based access** - Access levels based on capability, not age labels

---

## FUTURE: ACCESS LEVEL vs DASHBOARD TYPE CLEANUP

These three fields on family_members currently overlap and need consolidation in a future session:
- **dashboard_type**: What the user picks (play/guided/independent) - controls visual style and routing. THIS IS THE PRIMARY FIELD RIGHT NOW.
- **dashboard_mode**: Duplicate of dashboard_type, added later. Should be consolidated.
- **access_level**: Originally meant for PERMISSIONS, not visual style. Future use: when mom clicks a family member in Family Settings, she can set granular permissions for what that member can do (create their own intentions, set goals, create tasks, edit their own profile, etc.). This is a separate concept from dashboard visual style and should NOT be confused with dashboard_type. Implementation is down the road.

For now, dashboard_type drives everything. access_level will become the permissions system later.

---

## DEVELOPMENT WORKFLOW

1. Edit code in VS Code
2. Test locally with `npm run dev`
3. Check browser console for errors
4. Commit: `git add . → git commit -m "description" → git push`
5. Vercel auto-deploys from GitHub
6. Test on live site

**Environment variables** are in `.env` (local) and Vercel dashboard (production).
**Never commit .env files to GitHub.**

---

## WHEN IN DOUBT

- Check the Supabase schema in this file before writing any query
- Check existing components before building new ones
- Ask me before creating new database tables or columns
- Reference the Faith & Ethics Framework for AI interaction decisions
- Test on mobile viewport first
