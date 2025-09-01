# MyAIM Central Database Schema Reference

This document provides a comprehensive overview of the Supabase database schema for MyAIM Central.

## Core Family System Tables

### families
Primary table for family units in the system.
```sql
- id: uuid (PK)
- wordpress_user_id: bigint (UNIQUE) - Links to WordPress user
- family_name: text - Display name for the family
- subscription_tier: text - 'basic', 'enhanced', 'premium'
- memberpress_level_id: integer - Links to MemberPress subscription
- default_context_settings: jsonb - Family-wide AI context preferences
- context_privacy_level: text - 'minimal', 'medium', 'comprehensive'
- connected_platforms: jsonb - Which AI platforms are connected
- context_usage_patterns: jsonb - Analytics data
- optimization_preferences: jsonb - AI optimization settings
```

### family_members
Individual family member profiles with roles, permissions, and gamification.
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- wordpress_user_id: bigint - Optional link to WordPress user
- heartbeat_profile_id: bigint - Links to external profile system
- name: text - Member's display name
- role: text - 'mom', 'dad', 'child', 'teen', 'guardian'
- age: integer
- personality_traits: jsonb - AI context for personalization
- learning_style: text - How they learn best
- interests: text[] - Array of interests
- challenges: text[] - Current challenges they face
- strengths: text[] - Their strengths
- privacy_level: text - 'private', 'family', 'supervised'
- can_modify_context: boolean - Can edit AI context
- supervised_by: uuid (FK to family_members) - Parent supervision
- dashboard_type: text - 'adult' or 'child' interface
- unique_qr_code: text - QR code for quick access
- points_balance: integer - Current gamification points
- level: integer - Gamification level
- theme_preference: text - UI theme choice
- gamification_level: text - 'minimal', 'standard', 'high'
- content_filter_level: text - 'strict', 'moderate', 'minimal'
- ai_interaction_monitor: boolean - Track AI interactions
- daily_usage_limit_minutes: integer - Time limits
- requires_parent_approval: boolean - Approval needed for actions
- color: text - Personal color theme (hex code)
- avatar: text - Avatar image reference
- badges_earned: text[] - Achievement badges
- permissions: jsonb - Detailed permission settings
```

## Reward System Tables

### family_reward_types
Configurable reward currencies per family (Stars, Points, Money, etc.)
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- reward_type: varchar(50) - 'stars', 'points', 'money', 'privileges', 'family_rewards'
- display_name: varchar(100) - Custom name like "Gold Stars", "House Points"
- icon: varchar(50) - Icon identifier for UI
- color: varchar(7) - Hex color code
- is_active: boolean - Whether this reward type is currently used
```

### family_rewards
Individual rewards/prizes that can be earned by spending reward currencies
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- created_by: uuid (FK to family_members)
- title: varchar(255) - Reward name
- description: text - Details about the reward
- reward_type: varchar(50) - Which currency this costs
- cost: integer - How much of the currency needed
- category: varchar(100) - 'individual', 'family_goal', 'bulk_individual'
- assigned_to: uuid (FK to family_members) - For individual rewards
- contribution_rule: varchar(20) - 'spend_only', 'double_count' for family goals
- contributors: jsonb - Array of family member IDs who can contribute
- bulk_recipients: jsonb - For bulk individual rewards
- is_active: boolean - Available for redemption
- max_redemptions: integer - Usage limit (NULL = unlimited)
- current_redemptions: integer - Times already redeemed
```

### member_reward_balances
Current balances for each member per reward type
```sql
- id: uuid (PK)
- family_member_id: uuid (FK to family_members)
- reward_type: varchar(50) - Type of reward currency
- current_balance: integer - Available to spend
- lifetime_earned: integer - Total ever earned
- lifetime_spent: integer - Total ever spent
- last_updated: timestamp - When balance last changed
```

### reward_transactions
Complete history of earning and spending rewards
```sql
- id: uuid (PK)
- family_member_id: uuid (FK to family_members)
- reward_type: varchar(50) - Currency type
- transaction_type: varchar(20) - 'earned', 'spent', 'bonus', 'penalty'
- amount: integer - Positive for earned, negative for spent
- source_type: varchar(50) - 'task_completion', 'reward_redemption', etc.
- source_id: uuid - Reference to task, reward, etc.
- description: text - Human readable description
- created_by: uuid (FK to family_members) - Who recorded this
```

### reward_redemptions
When rewards are claimed and their approval status
```sql
- id: uuid (PK)
- reward_id: uuid (FK to family_rewards)
- redeemed_by: uuid (FK to family_members)
- amount_spent: integer - Currency amount used
- status: varchar(20) - 'pending', 'approved', 'completed', 'cancelled'
- notes: text - Additional info
- approved_by: uuid (FK to family_members) - Parent who approved
```

### task_rewards
Links tasks to their reward values
```sql
- id: uuid (PK)
- task_id: uuid (FK to tasks)
- reward_type: varchar(50) - Currency to award
- reward_amount: integer - Base amount
- bonus_threshold: decimal(5,2) - Percentage for bonus (e.g., 0.85 = 85%)
- bonus_amount: integer - Extra reward for exceeding threshold
```

## Task Management Tables

### tasks
Main task/opportunity tracking
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- task_name: text - Task title
- description: text - Detailed description
- assignee: text[] - Array of assigned family member names
- status: text - 'pending', 'in_progress', 'complete', 'overdue', 'skipped'
- task_type: text - 'task' or 'opportunity'
- reward_type: text - Which reward currency to give
- reward_amount: text - Amount to award
- reward_details: jsonb - Additional reward configuration
- require_approval: boolean - Needs parent approval
- subtasks: text[] - Array of subtask descriptions
- due_date: timestamp - When task is due
- created_by: uuid (FK to family_members)
- priority: text - 'low', 'medium', 'high'
```

### task_subtasks
Individual subtasks within a main task
```sql
- id: uuid (PK)
- task_id: uuid (FK to tasks)
- title: text - Subtask description
- completed: boolean - Whether finished
```

### achievements
Gamification achievements earned by family members
```sql
- id: uuid (PK)
- member_id: uuid (FK to family_members)
- achievement_type: text - Type of achievement
- points_awarded: integer - Points earned
- earned_at: timestamp - When achieved
```

## AI Context and Personalization Tables

### context_categories
Organizational categories for AI context data
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- category_name: text - Name of the context category
```

### context_items
Individual pieces of context information for AI personalization
```sql
- id: uuid (PK)
- category_id: uuid (FK to context_categories)
- family_id: uuid (FK to families)
- item_name: text - Context item identifier
- item_type: text - Type of context data
- content: jsonb - The actual context content
- relevance_score: double precision - How relevant this context is
- usage_frequency: integer - How often it's used
- keywords: text[] - Search keywords
- summary: text - Brief description
```

### personas
AI persona templates for different interaction styles
```sql
- id: uuid (PK)
- persona_name: text (UNIQUE) - Internal identifier
- display_name: text - User-friendly name
- category: text - Persona category
- description: text - What this persona does
- core_philosophy: text - Guiding principles
- icon: text - UI icon reference
- trigger_keywords: text[] - When to activate this persona
- use_cases: text[] - Common usage scenarios
- base_prompt_template: text - Core AI prompt structure
```

### conversation_sessions
AI conversation session tracking and optimization
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- creator_id: uuid (FK to family_members)
- session_name: text - User-defined name
- platforms_used: text[] - Which AI platforms used
- context_snapshot: jsonb - Context data used
- original_prompt: text - Initial user input
- optimized_prompt: text - AI-enhanced version
- context_categories_used: text[] - Categories included
- optimization_reasoning: text - Why changes were made
- allowed_family_members: text[] - Who can access this session
- privacy_level: text - 'private', 'family', 'shared'
```

## Integration and External Data Tables

### external_integrations
Connections to external services (Google, Notion, etc.)
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- service_name: text - 'notion', 'google_drive', 'google_calendar', 'gmail'
- connection_status: text - 'active', 'inactive', 'error', 'expired'
- service_config: jsonb - Service-specific configuration
- sync_settings: jsonb - How to sync data
- last_sync_at: timestamp - Last successful sync
- context_category_mapping: jsonb - How to categorize imported data
```

### mindsweep_items
Quick capture of ideas, tasks, and thoughts for later processing
```sql
- id: uuid (PK)
- family_id: uuid (FK to families)
- created_by: uuid (FK to family_members)
- source: text - 'telegram', 'app', 'web', 'email', 'voice'
- content_type: text - 'text', 'voice', 'image', 'document'
- raw_content: text - Original captured content
- processed_content: jsonb - AI-enhanced version
- ai_category: text - AI-determined category
- ai_priority: integer - AI-suggested priority (1-5)
- ai_tags: text[] - AI-generated tags
- assigned_to: uuid (FK to family_members)
- status: text - 'new', 'processing', 'completed', 'archived'
```

## System Configuration Tables

### user_preferences
User-specific app preferences and settings
```sql
- id: uuid (PK)
- user_id: text - User identifier
- preference_type: text - Category of preference
- preference_value: jsonb - Preference data
```

### user_permissions
Role-based access control permissions
```sql
- id: uuid (PK)
- user_id: text (UNIQUE) - User identifier  
- permissions: jsonb - Permission settings
```

## Database Functions and Triggers

### update_reward_balance()
Automatically updates member reward balances when transactions are inserted.

### update_updated_at_column()
Automatically updates the `updated_at` timestamp on record changes.

## Important Relationships

- Each family can have multiple members
- Members can have multiple reward balances (one per reward type)
- Tasks can have multiple reward assignments
- Rewards can be individual, family goals, or bulk individual
- Context data is hierarchically organized by categories
- AI sessions track context usage and optimization
- External integrations sync data into context categories

## Usage Notes

1. **Reward System**: Supports 5 reward types with automatic balance tracking
2. **Family Goals**: Allow multiple members to contribute rewards toward shared goals
3. **AI Context**: Comprehensive personalization system for AI interactions
4. **Task Management**: Supports both tasks and opportunities with flexible rewards
5. **Gamification**: Points, levels, badges, and achievements for engagement
6. **Privacy**: Granular privacy controls for different family members
7. **Integration**: External service connections with automatic context generation

This schema supports the full MyAIM Central ecosystem including family management, reward systems, AI personalization, task tracking, and external integrations.