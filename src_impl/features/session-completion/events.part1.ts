

export function createSessionCompletedEvent(userId: string, sessionId: string, completionType: 'natural' | 'forced' | 'abandoned' | 'timeout' | 'achievement', duration: number, objectives: DynamicValue, performance: DynamicValue, conditions: DynamicValue): SessionCompletedEvent {
  return {
    id: generateEventId(),
    type: 'session_completed',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      completionType,
      completionTime: new Date(),
      duration,
      objectives,
      performance,
      conditions,
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionPerformanceCalculatedEvent(userId: string, sessionId: string, performanceMetrics: DynamicValue, benchmarks: DynamicValue, analysis: DynamicValue): SessionPerformanceCalculatedEvent {
  return {
    id: generateEventId(),
    type: 'session_performance_calculated',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      performanceMetrics,
      benchmarks,
      analysis,
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionRewardsCalculatedEvent(userId: string, sessionId: string, baseRewards: DynamicValue, performanceBonus: DynamicValue, completionBonus: DynamicValue, specialRewards: DynamicValue[]): SessionRewardsCalculatedEvent {
  return {
    id: generateEventId(),
    type: 'session_rewards_calculated',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      baseRewards,
      performanceBonus,
      completionBonus,
      specialRewards,
      totalRewards: {
        experience: baseRewards.experience + performanceBonus.bonus.experience + completionBonus.bonus.experience,
        currency: baseRewards.currency + performanceBonus.bonus.currency + completionBonus.bonus.currency,
        reputation: baseRewards.reputation + performanceBonus.bonus.reputation + completionBonus.bonus.reputation,
        items: specialRewards,
      },
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionAchievementUnlockedEvent(userId: string, sessionId: string, achievementId: string, achievementName: string, achievementType: 'streak' | 'completion' | 'special' | 'performance' | 'hidden', progress: DynamicValue, criteria: DynamicValue[], rarity: string, points: number, rewards: DynamicValue): SessionAchievementUnlockedEvent {
  return {
    id: generateEventId(),
    type: 'session_achievement_unlocked',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      achievementId,
      achievementName,
      achievementType,
      unlockedAt: new Date(),
      progress,
      criteria,
      rarity,
      points,
      rewards,
      recognition: {
        badge: `${achievementId}_badge`,
        celebration: true,
        shareable: true,
        public: rarity === 'legendary' || rarity === 'epic',
      },
      firstTime: true,
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function createSessionMilestoneReachedEvent(userId: string, sessionId: string, milestoneId: string, milestoneType: 'score' | 'streak' | 'accuracy' | 'speed' | 'completion' | 'special', milestoneName: string, value: number, target: number, previousRecord: number, significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time'): SessionMilestoneReachedEvent {
  return {
    id: generateEventId(),
    type: 'session_milestone_reached',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      milestoneId,
      milestoneType,
      milestoneName,
      achievedAt: new Date(),
      value,
      target,
      previousRecord,
      improvement: value - previousRecord,
      significance,
      recognition: {
        badge: `${milestoneId}_badge`,
        title: `${milestoneName} Achiever`,
        celebration: true,
        shareable: true,
      },
      rewards: {
        experience: Math.floor((value / target) * 100),
        currency: Math.floor((value / target) * 50),
        items: [],
        unlocks: [],
      },
    },
    metadata: createEventMetadata('session-completion'),
  };
}

export function validateSessionCompletionEvent(event: SessionCompletionEventType): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'session_completed':
      return validateSessionCompletedEvent(event as SessionCompletedEvent);
    case 'session_performance_calculated':
      return validateSessionPerformanceCalculatedEvent(event as SessionPerformanceCalculatedEvent);
    case 'session_rewards_calculated':
      return validateSessionRewardsCalculatedEvent(event as SessionRewardsCalculatedEvent);
    case 'session_achievement_unlocked':
      return validateSessionAchievementUnlockedEvent(event as SessionAchievementUnlockedEvent);
    case 'session_milestone_reached':
      return validateSessionMilestoneReachedEvent(event as SessionMilestoneReachedEvent);
    default:
      return true;
  }
}

export function serializeSessionCompletionEvent(event: SessionCompletionEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeSessionCompletionEvent(data: string): SessionCompletionEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}