import type { BaseSessionCompletionEvent } from './base-event-types';

export interface SessionMilestoneReachedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_milestone_reached';
  data: {
    milestoneId: string;
    milestoneType:
      | 'score'
      | 'streak'
      | 'accuracy'
      | 'speed'
      | 'completion'
      | 'special';
    milestoneName: string;
    achievedAt: Date;
    value: number;
    target: number;
    previousRecord: number;
    improvement: number;
    significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time';
    recognition: {
      badge: string;
      title: string;
      celebration: boolean;
      shareable: boolean;
    };
    rewards: {
      experience: number;
      currency: number;
      items: unknown[];
      unlocks: string[];
    };
  };
}

export interface SessionRecordBrokenEvent extends BaseSessionCompletionEvent {
  type: 'session_record_broken';
  data: {
    recordType: string;
    recordCategory: 'personal' | 'session' | 'daily' | 'weekly' | 'global';
    previousRecord: number;
    newRecord: number;
    improvement: number;
    recordDate: Date;
    previousRecordDate: Date;
    timeSincePrevious: number;
    significance: { rarity: number; difficulty: number; achievement: number };
    celebration: {
      message: string;
      effects: string[];
      duration: number;
      public: boolean;
    };
  };
}

export interface SessionAchievementUnlockedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_achievement_unlocked';
  data: {
    achievementId: string;
    achievementName: string;
    achievementType:
      | 'completion'
      | 'performance'
      | 'streak'
      | 'special'
      | 'hidden';
    unlockedAt: Date;
    progress: { current: number; required: number; percentage: number };
    criteria: {
      type: string;
      condition: string;
      value: unknown;
      met: boolean;
    }[];
    rarity: string;
    points: number;
    rewards: {
      experience: number;
      currency: number;
      items: unknown[];
      titles: string[];
    };
    recognition: {
      badge: string;
      celebration: boolean;
      shareable: boolean;
      public: boolean;
    };
    firstTime: boolean;
    chainProgress?: {
      chainId: string;
      current: number;
      total: number;
      next: string;
    };
  };
}

export interface SessionAchievementProgressUpdatedEvent
  extends BaseSessionCompletionEvent {
  type: 'session_achievement_progress_updated';
  data: {
    achievementId: string;
    previousProgress: number;
    currentProgress: number;
    requiredProgress: number;
    increment: number;
    contributingAction: string;
    context: { sessionId: string; objective: string; performance: unknown };
    nextMilestone?: { progress: number; reward: unknown; celebration: boolean };
    estimatedCompletion?: {
      sessions: number;
      timeframe: number;
      confidence: number;
    };
  };
}
