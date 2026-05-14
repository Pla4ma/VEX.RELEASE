import { capture } from '../../shared/analytics/analytics-service';

export function trackWorldStateChanged(
  userId: string,
  sessionId: string,
  storyId: string,
  stateId: string,
  changeType: 'environmental' | 'political' | 'social' | 'magical' | 'technological' | 'temporal',
  changedAt: Date,
  change: {
    description: string;
    magnitude: string;
    scope: string;
    permanence: string;
  },
  causes: {
    events: string[];
    choices: string[];
    characters: string[];
    natural: string[];
  },
  effects: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    cascading: string[];
  },
  playerImpact: {
    access: string[];
    restrictions: string[];
    opportunities: string[];
    dangers: string[];
  },
): void {
  capture('session_story_world_state_changed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    state_id: stateId,
    change_type: changeType,
    changed_at: changedAt.toISOString(),
    change,
    causes,
    effects,
    playerImpact,
  });
}

// ============================================================================
// ACHIEVEMENT ANALYTICS
// ============================================================================

export function trackStoryAchievementUnlocked(
  userId: string,
  sessionId: string,
  storyId: string,
  achievementId: string,
  achievementName: string,
  achievementType: 'completion' | 'exploration' | 'choice' | 'relationship' | 'discovery' | 'mastery',
  progress: {
    current: number;
    required: number;
    percentage: number;
  },
  criteria: {
    type: string;
    condition: string;
    value: unknown;
    met: boolean;
  }[],
  rarity: string,
  points: number,
  rewards: {
    experience: number;
    currency: number;
    items: unknown[];
    titles: string[];
    unlocks: string[];
  },
  recognition: {
    badge: string;
    celebration: boolean;
    shareable: boolean;
    public: boolean;
  },
): void {
  capture('session_story_achievement_unlocked', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    achievement_id: achievementId,
    achievement_name: achievementName,
    achievement_type: achievementType,
    progress,
    criteria,
    rarity,
    points,
    rewards,
    recognition,
  });
}

export function trackStoryMilestoneReached(
  userId: string,
  sessionId: string,
  storyId: string,
  milestoneId: string,
  milestoneType: 'chapter' | 'plot' | 'character' | 'world' | 'choice' | 'time',
  milestoneName: string,
  value: number,
  target: number,
  previousRecord: number,
  improvement: number,
  significance: 'personal' | 'story' | 'session' | 'global',
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
  capture('session_story_milestone_reached', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
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

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

