import {
  StoryGeneratedEvent,
  StoryStartedEvent,
  StoryChoiceMadeEvent,
  StoryAchievementUnlockedEvent,
  EventMetadata,
  DeviceInfo,
} from "./types";

export function createStoryGeneratedEvent(
  userId: string,
  sessionId: string,
  storyId: string,
  generationType: "manual" | "automatic" | "hybrid" | "template",
  narrative: StoryGeneratedEvent['data']['narrative'],
  structure: StoryGeneratedEvent['data']['structure'],
  personalization: StoryGeneratedEvent['data']['personalization'],
): StoryGeneratedEvent {
  return {
    id: generateEventId(),
    type: "story_generated",
    userId,
    sessionId,
    storyId,
    timestamp: new Date(),
    data: {
      storyId,
      generationType,
      generatedAt: new Date(),
      generationTime: 0,
      narrative,
      structure,
      personalization,
    },
    metadata: createEventMetadata("session-story"),
  };
}
export function createStoryStartedEvent(
  userId: string,
  sessionId: string,
  storyId: string,
  startType: "preview" | "beginning" | "resume" | "jump_in",
  chapter: number,
  scene: number,
  context: StoryStartedEvent['data']['context'],
): StoryStartedEvent {
  return {
    id: generateEventId(),
    type: "story_started",
    userId,
    sessionId,
    storyId,
    timestamp: new Date(),
    data: {
      storyId,
      startedAt: new Date(),
      startType,
      chapter,
      scene,
      context,
      expectations: {
        estimatedDuration: 30,
        difficulty: "medium",
        engagement: "high",
        outcomes: [],
      },
    },
    metadata: createEventMetadata("session-story"),
  };
}
export function createStoryChoiceMadeEvent(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  optionId: string,
  decisionTime: number,
  reasoning: StoryChoiceMadeEvent['data']['reasoning'],
  context: StoryChoiceMadeEvent['data']['context'],
  confidence: StoryChoiceMadeEvent['data']['confidence'],
): StoryChoiceMadeEvent {
  return {
    id: generateEventId(),
    type: "story_choice_made",
    userId,
    sessionId,
    storyId,
    timestamp: new Date(),
    data: {
      storyId,
      choiceId,
      optionId,
      madeAt: new Date(),
      decisionTime,
      reasoning,
      context,
      confidence,
    },
    metadata: createEventMetadata("session-story"),
  };
}
export function createStoryAchievementUnlockedEvent(
  userId: string,
  sessionId: string,
  storyId: string,
  achievementId: string,
  achievementName: string,
  achievementType:
    | "discovery"
    | "mastery"
    | "relationship"
    | "choice"
    | "exploration"
    | "completion",
  progress: StoryAchievementUnlockedEvent['data']['progress'],
  criteria: StoryAchievementUnlockedEvent['data']['criteria'],
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary",
  points: number,
  rewards: StoryAchievementUnlockedEvent['data']['rewards'],
): StoryAchievementUnlockedEvent {
  return {
    id: generateEventId(),
    type: "story_achievement_unlocked",
    userId,
    sessionId,
    storyId,
    timestamp: new Date(),
    data: {
      achievementId,
      achievementName,
      achievementType,
      unlockedAt: new Date(),
      storyId,
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
    },
    metadata: createEventMetadata("session-story"),
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
