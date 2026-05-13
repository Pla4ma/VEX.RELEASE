import { SessionStoryEvent } from "./types";


export function createStoryGeneratedEvent(userId: string, sessionId: string, storyId: string, generationType: 'manual' | 'automatic' | 'hybrid' | 'template', narrative: DynamicValue, structure: DynamicValue, personalization: DynamicValue): StoryGeneratedEvent {
  return {
    id: generateEventId(),
    type: 'story_generated',
    userId,
    sessionId,
    storyId,
    timestamp: new Date(),
    data: {
      storyId,
      generationType,
      generatedAt: new Date(),
      generationTime: 0, // would be calculated
      narrative,
      structure,
      personalization,
    },
    metadata: createEventMetadata('session-story'),
  };
}

export function createStoryStartedEvent(userId: string, sessionId: string, storyId: string, startType: 'preview' | 'beginning' | 'resume' | 'jump_in', chapter: number, scene: number, context: DynamicValue): StoryStartedEvent {
  return {
    id: generateEventId(),
    type: 'story_started',
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
        difficulty: 'medium',
        engagement: 'high',
        outcomes: [],
      },
    },
    metadata: createEventMetadata('session-story'),
  };
}

export function createStoryChoiceMadeEvent(userId: string, sessionId: string, storyId: string, choiceId: string, optionId: string, decisionTime: number, reasoning: DynamicValue, context: DynamicValue, confidence: DynamicValue): StoryChoiceMadeEvent {
  return {
    id: generateEventId(),
    type: 'story_choice_made',
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
    metadata: createEventMetadata('session-story'),
  };
}

export function createStoryAchievementUnlockedEvent(userId: string, sessionId: string, storyId: string, achievementId: string, achievementName: string, achievementType: 'discovery' | 'mastery' | 'relationship' | 'choice' | 'exploration' | 'completion', progress: DynamicValue, criteria: DynamicValue[], rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary', points: number, rewards: DynamicValue): StoryAchievementUnlockedEvent {
  return {
    id: generateEventId(),
    type: 'story_achievement_unlocked',
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
        public: rarity === 'legendary' || rarity === 'epic',
      },
    },
    metadata: createEventMetadata('session-story'),
  };
}

export function validateSessionStoryEvent(event: SessionStoryEventType): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'story_generated':
      return validateStoryGeneratedEvent(event as StoryGeneratedEvent);
    case 'story_started':
      return validateStoryStartedEvent(event as StoryStartedEvent);
    case 'story_choice_made':
      return validateStoryChoiceMadeEvent(event as StoryChoiceMadeEvent);
    case 'story_achievement_unlocked':
      return validateStoryAchievementUnlockedEvent(event as StoryAchievementUnlockedEvent);
    default:
      return true;
  }
}

export function serializeSessionStoryEvent(event: SessionStoryEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeSessionStoryEvent(data: string): SessionStoryEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}