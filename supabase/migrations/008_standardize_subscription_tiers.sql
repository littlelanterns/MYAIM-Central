-- Standardize subscription tiers to: essential, enhanced, full_magic, creator

-- Step 1: Drop existing constraints
ALTER TABLE public.families DROP CONSTRAINT IF EXISTS families_subscription_tier_check;
ALTER TABLE public.archive_folders DROP CONSTRAINT IF EXISTS archive_folders_required_tier_check;

-- Step 2: Update data
UPDATE public.families SET subscription_tier = 'essential' WHERE subscription_tier = 'basic';
UPDATE public.families SET subscription_tier = 'full_magic' WHERE subscription_tier = 'magic';
UPDATE public.archive_folders SET required_tier = 'full_magic' WHERE required_tier = 'magic';

-- Step 3: Add new constraints
ALTER TABLE public.families
  ADD CONSTRAINT families_subscription_tier_check
  CHECK (subscription_tier IN ('essential', 'enhanced', 'full_magic', 'creator'));

ALTER TABLE public.archive_folders
  ADD CONSTRAINT archive_folders_required_tier_check
  CHECK (required_tier IN ('essential', 'enhanced', 'full_magic', 'creator'));

-- Step 4: Update library_items if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'library_items') THEN
    ALTER TABLE public.library_items DROP CONSTRAINT IF EXISTS library_items_required_tier_check;
    UPDATE public.library_items SET required_tier = 'full_magic' WHERE required_tier = 'magic';
    UPDATE public.library_items SET allowed_tiers = array_replace(allowed_tiers, 'magic', 'full_magic') WHERE 'magic' = ANY(allowed_tiers);
    ALTER TABLE public.library_items ADD CONSTRAINT library_items_required_tier_check CHECK (required_tier IN ('essential', 'enhanced', 'full_magic', 'creator'));
  END IF;
END $$;
