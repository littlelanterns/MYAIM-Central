-- Migration: Add PIN column to family_members table
-- Date: 2026-01-30
-- Description: Adds a 4-digit PIN column for family member login

ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS pin text;

COMMENT ON COLUMN public.family_members.pin IS '4-digit PIN for family member dashboard login';
