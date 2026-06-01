import type { BaseSessionCompletionEvent } from './base-event-types';

export interface SessionRewardsCalculatedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_rewards_calculated';
  data: {
    baseRewards: {
      experience: number;
      currency: number;
      reputation: number;
      energy: number;
    };
    performanceBonus: {
      multiplier: number;
      bonus: { experience: number; currency: number; reputation: number };
      criteria: string[];
    };
    completionBonus: {
      multiplier: number;
      bonus: { experience: number; currency: number; reputation: number };
      objectives: string[];
    };
    specialRewards: {
      type: string;
      name: string;
      value: number;
      rarity: string;
      condition: string;
    }[];
    totalRewards: {
      experience: number;
      currency: number;
      reputation: number;
      items: unknown[];
    };
  };
}

export interface SessionRewardsClaimedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_rewards_claimed';
  data: {
    claimedAt: Date;
    claimMethod: 'auto' | 'manual' | 'delayed';
    rewards: {
      experience: number;
      currency: number;
      reputation: number;
      items: unknown[];
    };
    multipliers: { active: unknown[]; applied: unknown[]; expired: unknown[] };
    bonuses: {
      streak: unknown;
      performance: unknown;
      completion: unknown;
      special: unknown[];
    };
    inventory: { previous: unknown; current: unknown; overflow: unknown };
  };
}

export interface SessionRewardMultiplierActivatedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_reward_multiplier_activated';
  data: {
    multiplierId: string;
    multiplierType: string;
    multiplierValue: number;
    duration: number;
    activatedAt: Date;
    trigger: { type: string; condition: string; value: unknown };
    scope: { sessions: string[]; rewards: string[]; conditions: unknown[] };
    cost: { type: string; amount: number; source: string };
    benefits: { estimated: number; actual?: number; efficiency: number };
  };
}
