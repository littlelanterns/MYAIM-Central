/**
 * Gamification Type Definitions
 * Points, badges, rewards, and achievement tracking
 */

export interface Points {
  id: string;
  family_member_id: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  last_updated: string;
}

export interface PointsTransaction {
  id: string;
  family_member_id: string;
  points: number; // positive for earning, negative for spending
  reason: string;
  category: PointCategory;
  created_at: string;
  related_victory_id?: string;
  related_task_id?: string;
}

export type PointCategory =
  | 'task_completion'
  | 'victory_recorded'
  | 'streak_bonus'
  | 'helping_others'
  | 'reward_redeemed'
  | 'bonus'
  | 'other';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  criteria: string;
  points_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type BadgeCategory =
  | 'tasks'
  | 'victories'
  | 'streaks'
  | 'helping'
  | 'learning'
  | 'special';

export interface EarnedBadge {
  id: string;
  family_member_id: string;
  badge_id: string;
  badge: Badge;
  earned_at: string;
  is_new: boolean; // For showing "NEW!" indicator
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_cost: number;
  category: RewardCategory;
  requires_approval: boolean;
  created_by_id: string; // Family member who created this reward
  is_active: boolean;
}

export type RewardCategory =
  | 'screen_time'
  | 'treats'
  | 'activities'
  | 'privileges'
  | 'purchases'
  | 'custom';

export interface RewardRedemption {
  id: string;
  family_member_id: string;
  reward_id: string;
  reward: Reward;
  points_spent: number;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  requested_at: string;
  approved_at?: string;
  approved_by_id?: string;
  fulfilled_at?: string;
}

export interface Streak {
  id: string;
  family_member_id: string;
  streak_type: StreakType;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export type StreakType =
  | 'daily_victories'
  | 'task_completion'
  | 'best_intentions'
  | 'helping_others';

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'first-victory',
    name: 'First Victory',
    description: 'Record your first victory',
    icon: '🏆',
    category: 'victories',
    criteria: 'Record 1 victory',
    points_value: 10,
    rarity: 'common'
  },
  {
    id: 'victory-streak-7',
    name: 'Week Warrior',
    description: 'Record victories for 7 days straight',
    icon: '🔥',
    category: 'streaks',
    criteria: '7 day victory streak',
    points_value: 50,
    rarity: 'rare'
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '✅',
    category: 'tasks',
    criteria: 'Complete 100 tasks',
    points_value: 100,
    rarity: 'epic'
  },
  {
    id: 'helper',
    name: 'Family Helper',
    description: 'Help other family members 10 times',
    icon: '🤝',
    category: 'helping',
    criteria: 'Help others 10 times',
    points_value: 75,
    rarity: 'rare'
  }
];
