# Claude Code Instructions for MyAIM Central

This file contains project-specific instructions for Claude Code when working on this codebase.

## Project Overview

MyAIM Central is a family productivity platform with AI assistants (LiLa). Built with:
- **Frontend**: React 19 + TypeScript + Vite 7
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Inline styles (no Tailwind/CSS modules)

## Database Change Rules

**IMPORTANT**: When making ANY database changes, follow these steps:

### 1. Create a Migration File
```
Location: supabase/migrations/XXX_descriptive_name.sql
```
- Number sequentially (check existing files for next number)
- Use descriptive names like `027_add_user_preferences.sql`
- Include comments explaining what and why

### 2. Update TypeScript Types
After creating the migration, remind the user:
```
"Don't forget to update src/types/database.ts with the new fields/tables"
```

### 3. Migration Best Practices
- Always use `IF NOT EXISTS` for CREATE TABLE/INDEX
- Always use `IF EXISTS` for DROP operations
- Use `ADD COLUMN IF NOT EXISTS` for new columns
- Wrap risky operations in DO $$ blocks with existence checks
- Never use foreign keys to `auth.users` (causes issues during signup)

### 4. Schema Documentation
Keep `SCHEMA.md` updated when adding new tables or significant columns.

## Code Conventions

### File Structure
- Pages: `src/pages/`
- Components: `src/components/`
- Hooks: `src/hooks/`
- Services/API: `src/lib/`
- Types: `src/types/`

### Naming Conventions
- Database columns: `snake_case`
- TypeScript/React: `camelCase` for variables, `PascalCase` for components/types
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities

### Styling
- Use inline styles (this project doesn't use Tailwind or CSS modules)
- Brand color (sage teal): `#68a395`

## Key Tables Reference

Core family structure:
- `families` - Main family account (has `auth_user_id` linking to Supabase auth)
- `family_members` - Individual people in each family

Task system:
- `tasks` - Active tasks
- `task_templates` - Reusable task definitions
- `task_completions` - Completion history

See `SCHEMA.md` for complete database documentation.

## Common Gotchas

1. **Foreign keys to auth.users**: Don't create FK constraints to `auth.users` - they fail during signup. Store the UUID without the FK constraint.

2. **Required fields in family_members**: The `name` and `role` columns are NOT NULL. Always provide these when inserting.

3. **Family login flow**:
   - `families.auth_user_id` = the primary parent's Supabase auth ID
   - `families.family_login_name` = unique identifier for PIN-based family member login

4. **Timestamps**: Most tables use `timestamp without time zone`. Some newer ones use `timestamp with time zone`. Be consistent within related tables.

## Supabase Project

- **Project ID**: `vrouxykpyzsdqoxestdm`
- **Generate types**: `npm run db:types`
