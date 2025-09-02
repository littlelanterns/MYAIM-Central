-- Missing Reward System Tables for MyAIM Central
-- Add these to complete the reward system functionality

-- 1. Family reward types (configurable per family)
CREATE TABLE IF NOT EXISTS family_reward_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, reward_type)
);

-- 2. Member reward balances (current earned amounts per reward type)
CREATE TABLE IF NOT EXISTS member_reward_balances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  current_balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_member_id, reward_type)
);

-- 3. Reward transactions (earning and spending history)
CREATE TABLE IF NOT EXISTS reward_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_member_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  source_type VARCHAR(50),
  source_id uuid,
  description TEXT,
  created_by uuid REFERENCES family_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reward redemptions (when rewards are claimed)
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id uuid NOT NULL REFERENCES family_rewards(id) ON DELETE CASCADE,
  redeemed_by uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  amount_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by uuid REFERENCES family_members(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Family goal progress (for family rewards that require group contribution)
CREATE TABLE IF NOT EXISTS family_goal_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id uuid NOT NULL REFERENCES family_rewards(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  contributed_amount INTEGER DEFAULT 0,
  last_contribution TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reward_id, contributor_id)
);

-- 6. Task reward assignments (linking tasks to their reward values)
CREATE TABLE IF NOT EXISTS task_rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL,
  reward_amount INTEGER NOT NULL,
  bonus_threshold DECIMAL(5,2),
  bonus_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_reward_types_family_id ON family_reward_types(family_id);
CREATE INDEX IF NOT EXISTS idx_member_reward_balances_member_id ON member_reward_balances(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_member_id ON reward_transactions(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_created_at ON reward_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_redeemed_by ON reward_redemptions(redeemed_by);
CREATE INDEX IF NOT EXISTS idx_family_goal_progress_reward_id ON family_goal_progress(reward_id);
CREATE INDEX IF NOT EXISTS idx_task_rewards_task_id ON task_rewards(task_id);

-- Function to automatically update reward balances
CREATE OR REPLACE FUNCTION update_reward_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
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

-- Trigger to automatically update reward balances
DROP TRIGGER IF EXISTS trigger_update_reward_balance ON reward_transactions;
CREATE TRIGGER trigger_update_reward_balance
  AFTER INSERT ON reward_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_reward_balance();

-- Insert default reward types for existing families
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

SELECT 'Missing reward system tables have been added successfully!' as status;