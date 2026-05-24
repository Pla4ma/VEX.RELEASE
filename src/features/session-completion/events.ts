import { SessionCompletedEvent, SessionPerformanceCalculatedEvent, SessionMilestoneReachedEvent, SessionRewardsCalculatedEvent, SessionAchievementUnlockedEvent, EventMetadata, DeviceInfo } from "./types";

export function createSessionCompletedEvent(userId: string, sessionId: string, completionType: "natural" | "forced" | "abandoned" | "timeout" | "achievement", duration: number, objectives: SessionCompletedEvent["data"]["objectives"], performance: SessionCompletedEvent["data"]["performance"], conditions: SessionCompletedEvent["data"]["conditions"]): SessionCompletedEvent {
  return {
    id: generateEventId(),
    type: "session_completed",
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
    metadata: createEventMetadata("session-completion"),
  };
}
export function createSessionPerformanceCalculatedEvent(userId: string, sessionId: string, performanceMetrics: SessionPerformanceCalculatedEvent["data"]["performanceMetrics"], benchmarks: SessionPerformanceCalculatedEvent["data"]["benchmarks"], analysis: SessionPerformanceCalculatedEvent["data"]["analysis"]): SessionPerformanceCalculatedEvent {
  return {
    id: generateEventId(),
    type: "session_performance_calculated",
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      performanceMetrics,
      benchmarks,
      analysis,
    },
    metadata: createEventMetadata("session-completion"),
  };
}
export function createSessionRewardsCalculatedEvent(userId: string, sessionId: string, baseRewards: SessionRewardsCalculatedEvent["data"]["baseRewards"], performanceBonus: SessionRewardsCalculatedEvent["data"]["performanceBonus"], completionBonus: SessionRewardsCalculatedEvent["data"]["completionBonus"], specialRewards: SessionRewardsCalculatedEvent["data"]["specialRewards"]): SessionRewardsCalculatedEvent {
  return {
    id: generateEventId(),
    type: "session_rewards_calculated",
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
    metadata: createEventMetadata("session-completion"),
  };
}
export function createSessionAchievementUnlockedEvent(userId: string, sessionId: string, achievementId: string, achievementName: string, achievementType: "streak" | "completion" | "special" | "performance" | "hidden", progress: SessionAchievementUnlockedEvent["data"]["progress"], criteria: SessionAchievementUnlockedEvent["data"]["criteria"], rarity: string, points: number, rewards: SessionAchievementUnlockedEvent["data"]["rewards"]): SessionAchievementUnlockedEvent {
  return {
    id: generateEventId(),
    type: "session_achievement_unlocked",
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
        public: rarity === "legendary" || rarity === "epic",
      },
      firstTime: true,
    },
    metadata: createEventMetadata("session-completion"),
  };
}
export function createSessionMilestoneReachedEvent(userId: string, sessionId: string, milestoneId: string, milestoneType: "score" | "streak" | "accuracy" | "speed" | "completion" | "special", milestoneName: string, value: number, target: number, previousRecord: number, significance: "personal" | "session" | "daily" | "weekly" | "all_time"): SessionMilestoneReachedEvent {
  return {
    id: generateEventId(),
    type: "session_milestone_reached",
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
    metadata: createEventMetadata("session-completion"),
  };
}
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function createEventMetadata(source: string): EventMetadata {
  return { source, version: "1.0.0", platform: getPlatform() };
}
function getPlatform(): string {
  if (typeof window !== "undefined") {
    return "web";
  }
  return "unknown";
}
