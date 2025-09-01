# Database Documentation

This directory contains database schema documentation and references for MyAIM Central.

## Files

- `supabase_schema.md` - Complete database schema documentation with table structures, relationships, and usage notes
- `complete_supabase_schema.sql` - Original SQL schema file for setting up the database

## Quick Reference

### Core Tables
- **families** - Family units with subscription and settings
- **family_members** - Individual family member profiles and permissions
- **tasks** - Task and opportunity management
- **family_rewards** - Reward system with 5 currency types
- **context_items** - AI personalization context data

### Key Relationships
- Family → Members (1:many)
- Members → Reward Balances (1:many per reward type)
- Tasks → Task Rewards (1:many)
- Context Categories → Context Items (1:many)

### For Developers

When working on features, always reference the schema documentation to understand:
1. Table structures and relationships
2. Data types and constraints
3. Foreign key relationships
4. Automatic triggers and functions

This ensures consistent database usage across the application.