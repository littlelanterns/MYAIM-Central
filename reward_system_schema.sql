-- MyAIM Central Reward System Database Schema
-- Phase 1: Core reward system tables

-- 1. Family reward types (configurable per family)
CREATE TABLE family_reward_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL, -- 'stars', 'points', 'money', 'privileges', 'family_rewards'
  display_name VARCHAR(100) NOT NULL, -- Custom display name (e.g., "Gold Stars", "House Points")
  icon VARCHAR(50), -- Icon identifier for UI
  color VARCHAR(7), -- Hex color code
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, reward_type)
);

-- 2. Individual rewards/prizes that can be earned
CREATE TABLE family_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES family_members(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_type VARCHAR(50) NOT NULL, -- references family_reward_types.reward_type
  cost INTEGER NOT NULL, -- amount needed to earn this reward
  category VARCHAR(100), -- 'individual', 'family_goal', 'bulk_individual'
  
  -- Individual rewards: specific to one person
  assigned_to UUID REFERENCES family_members(id), -- NULL for family goals or bulk rewards
  
  -- Family goal settings
  contribution_rule VARCHAR(20), -- 'spend_only', 'double_count' (for family goals)
  contributors JSONB, -- Array of family member IDs who can contribute
  
  -- Bulk individual settings (same reward for multiple kids)
  bulk_recipients JSONB, -- Array of family member IDs for bulk rewards
  
  is_active BOOLEAN DEFAULT true,
  is_redeemable BOOLEAN DEFAULT true,
  max_redemptions INTEGER, -- NULL = unlimited
  current_redemptions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Member reward balances (current earned amounts per reward type)
CREATE TABLE member_reward_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  current_balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_member_id, reward_type)
);

-- 4. Reward transactions (earning and spending history)
CREATE TABLE reward_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'earned', 'spent', 'bonus', 'penalty'
  amount INTEGER NOT NULL, -- positive for earned, negative for spent
  source_type VARCHAR(50), -- 'task_completion', 'reward_redemption', 'manual_adjustment', 'bonus'
  source_id UUID, -- task_id, reward_id, etc.
  description TEXT,
  created_by UUID REFERENCES family_members(id), -- who recorded this transaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reward redemptions (when rewards are claimed)
CREATE TABLE reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES family_rewards(id) ON DELETE CASCADE,
  redeemed_by UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  amount_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'cancelled'
  notes TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES family_members(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Family goal progress (for family rewards that require group contribution)
CREATE TABLE family_goal_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES family_rewards(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  contributed_amount INTEGER DEFAULT 0,
  last_contribution TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reward_id, contributor_id)
);

-- 7. Task reward assignments (linking tasks to their reward values)
CREATE TABLE task_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL, -- Will reference tasks table when it exists
  reward_type VARCHAR(50) NOT NULL,
  reward_amount INTEGER NOT NULL,
  bonus_threshold DECIMAL(5,2), -- Percentage for bonus (e.g., 0.85 for 85%)
  bonus_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_family_reward_types_family_id ON family_reward_types(family_id);
CREATE INDEX idx_family_rewards_family_id ON family_rewards(family_id);
CREATE INDEX idx_family_rewards_assigned_to ON family_rewards(assigned_to);
CREATE INDEX idx_member_reward_balances_member_id ON member_reward_balances(family_member_id);
CREATE INDEX idx_reward_transactions_member_id ON reward_transactions(family_member_id);
CREATE INDEX idx_reward_transactions_created_at ON reward_transactions(created_at DESC);
CREATE INDEX idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX idx_reward_redemptions_redeemed_by ON reward_redemptions(redeemed_by);
CREATE INDEX idx_family_goal_progress_reward_id ON family_goal_progress(reward_id);

-- Insert default reward types for existing families (if any exist)
INSERT INTO family_reward_types (family_id, reward_type, display_name, icon, color)
SELECT 
  id as family_id,
  'stars' as reward_type,
  'Gold Stars' as display_name,
  'star' as icon,
  '#FFD700' as color
FROM families
WHERE NOT EXISTS (
  SELECT 1 FROM family_reward_types 
  WHERE family_id = families.id AND reward_type = 'stars'
);

INSERT INTO family_reward_types (family_id, reward_type, display_name, icon, color)
SELECT 
  id as family_id,
  'points' as reward_type,
  'House Points' as display_name,
  'trophy' as icon,
  '#4CAF50' as color
FROM families
WHERE NOT EXISTS (
  SELECT 1 FROM family_reward_types 
  WHERE family_id = families.id AND reward_type = 'points'
);

INSERT INTO family_reward_types (family_id, reward_type, display_name, icon, color)
SELECT 
  id as family_id,
  'money' as reward_type,
  'Allowance Money' as display_name,
  'dollar-sign' as icon,
  '#2E7D32' as color
FROM families
WHERE NOT EXISTS (
  SELECT 1 FROM family_reward_types 
  WHERE family_id = families.id AND reward_type = 'money'
);

INSERT INTO family_reward_types (family_id, reward_type, display_name, icon, color)
SELECT 
  id as family_id,
  'privileges' as reward_type,
  'Special Privileges' as display_name,
  'crown' as icon,
  '#9C27B0' as color
FROM families
WHERE NOT EXISTS (
  SELECT 1 FROM family_reward_types 
  WHERE family_id = families.id AND reward_type = 'privileges'
);

INSERT INTO family_reward_types (family_id, reward_type, display_name, icon, color)
SELECT 
  id as family_id,
  'family_rewards' as reward_type,
  'Family Activities' as display_name,
  'users' as icon,
  '#FF5722' as color
FROM families
WHERE NOT EXISTS (
  SELECT 1 FROM family_reward_types 
  WHERE family_id = families.id AND reward_type = 'family_rewards'
);

-- Create triggers to automatically update balances and timestamps
CREATE OR REPLACE FUNCTION update_reward_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update or insert balance record
    INSERT INTO member_reward_balances (family_member_id, reward_type, current_balance, lifetime_earned, lifetime_spent, last_updated)
    VALUES (NEW.family_member_id, NEW.reward_type, 
      CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END,
      NOW())
    ON CONFLICT (family_member_id, reward_type)
    DO UPDATE SET
      current_balance = member_reward_balances.current_balance + NEW.amount,
      lifetime_earned = CASE WHEN NEW.amount > 0 
        THEN member_reward_balances.lifetime_earned + NEW.amount 
        ELSE member_reward_balances.lifetime_earned END,
      lifetime_spent = CASE WHEN NEW.amount < 0 
        THEN member_reward_balances.lifetime_spent + ABS(NEW.amount)
        ELSE member_reward_balances.lifetime_spent END,
      last_updated = NOW();
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_reward_balance
  AFTER INSERT ON reward_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_reward_balance();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables with updated_at columns
CREATE TRIGGER update_family_reward_types_updated_at
  BEFORE UPDATE ON family_reward_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_rewards_updated_at
  BEFORE UPDATE ON family_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();