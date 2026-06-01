import { capture } from '../../shared/analytics/analytics-service';

export function trackSessionMilestoneReached(
  userId: string,
  sessionId: string,
  milestoneId: string,
  milestoneType:
    | 'score'
    | 'streak'
    | 'accuracy'
    | 'speed'
    | 'completion'
    | 'special',
  milestoneName: string,
  value: number,
  target: number,
  previousRecord: number,
  improvement: number,
  significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time',
  recognition: {
    badge: string;
    title: string;
    celebration: boolean;
    shareable: boolean;
  },
  rewards: {
    experience: number;
    currency: number;
    items: unknown[];
    unlocks: string[];
  },
): void {
  capture('session_completion_milestone_reached', {
    user_id: userId,
    session_id: sessionId,
    milestone_id: milestoneId,
    milestone_type: milestoneType,
    milestone_name: milestoneName,
    value,
    target,
    previous_record: previousRecord,
    improvement,
    significance,
    recognition,
    rewards,
  });
}

export function trackSessionRecordBroken(
  userId: string,
  sessionId: string,
  recordType: string,
  recordCategory: 'personal' | 'session' | 'daily' | 'weekly' | 'global',
  previousRecord: number,
  newRecord: number,
  improvement: number,
  recordDate: Date,
  previousRecordDate: Date,
  timeSincePrevious: number,
  significance: {
    rarity: number;
    difficulty: number;
    achievement: number;
  },
  celebration: {
    message: string;
    effects: string[];
    duration: number;
    public: boolean;
  },
): void {
  capture('session_completion_record_broken', {
    user_id: userId,
    session_id: sessionId,
    record_type: recordType,
    record_category: recordCategory,
    previous_record: previousRecord,
    new_record: newRecord,
    improvement,
    record_date: recordDate.toISOString(),
    previous_record_date: previousRecordDate.toISOString(),
    time_since_previous: timeSincePrevious,
    significance,
    celebration,
  });
}

// ============================================================================
// REWARDS ANALYTICS
// ============================================================================

export function trackSessionRewardsCalculated(
  userId: string,
  sessionId: string,
  baseRewards: {
    experience: number;
    currency: number;
    reputation: number;
    energy: number;
  },
  performanceBonus: {
    multiplier: number;
    bonus: {
      experience: number;
      currency: number;
      reputation: number;
    };
    criteria: string[];
  },
  completionBonus: {
    multiplier: number;
    bonus: {
      experience: number;
      currency: number;
      reputation: number;
    };
    objectives: string[];
  },
  specialRewards: {
    type: string;
    name: string;
    value: number;
    rarity: string;
    condition: string;
  }[],
  totalRewards: {
    experience: number;
    currency: number;
    reputation: number;
    items: unknown[];
  },
): void {
  capture('session_completion_rewards_calculated', {
    user_id: userId,
    session_id: sessionId,
    base_rewards: baseRewards,
    performance_bonus: performanceBonus,
    completion_bonus: completionBonus,
    special_rewards: specialRewards,
    total_rewards: totalRewards,
  });
}

export function trackSessionRewardsClaimed(
  userId: string,
  sessionId: string,
  claimedAt: Date,
  claimMethod: 'auto' | 'manual' | 'delayed',
  rewards: {
    experience: number;
    currency: number;
    reputation: number;
    items: unknown[];
  },
  multipliers: {
    active: unknown[];
    applied: unknown[];
    expired: unknown[];
  },
  bonuses: {
    streak: unknown;
    performance: unknown;
    completion: unknown;
    special: unknown[];
  },
  inventory: {
    previous: unknown;
    current: unknown;
    overflow: unknown;
  },
): void {
  capture('session_completion_rewards_claimed', {
    user_id: userId,
    session_id: sessionId,
    claimed_at: claimedAt.toISOString(),
    claim_method: claimMethod,
    rewards,
    multipliers,
    bonuses,
    inventory,
  });
}
