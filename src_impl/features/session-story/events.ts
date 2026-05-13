/**
 * Session Story Feature Events
 *
 * Event definitions for narrative generation, storytelling, and session chronicles features.
 */

import { SessionStoryEvent } from './types';

// Base Event Interface
// Story Lifecycle Events
// Narrative Events
// Choice Events
// Character Events
// World Events
// Achievement Events
// Analytics Events
// System Events
// Union Type for All Session Story Events
// Event Factory Functions
// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

// Event Validation

function validateStoryGeneratedEvent(event: StoryGeneratedEvent): boolean {
  const { data } = event;
  return !!(data.storyId && data.generationType && data.generatedAt && data.narrative && data.structure && data.personalization);
}

function validateStoryStartedEvent(event: StoryStartedEvent): boolean {
  const { data } = event;
  return !!(data.storyId && data.startedAt && data.startType && typeof data.chapter === 'number' && typeof data.scene === 'number' && data.context && data.expectations);
}

function validateStoryChoiceMadeEvent(event: StoryChoiceMadeEvent): boolean {
  const { data } = event;
  return !!(data.storyId && data.choiceId && data.optionId && data.madeAt && typeof data.decisionTime === 'number' && data.reasoning && data.context && data.confidence);
}

function validateStoryAchievementUnlockedEvent(event: StoryAchievementUnlockedEvent): boolean {
  const { data } = event;
  return !!(data.achievementId && data.achievementName && data.achievementType && data.unlockedAt && data.storyId && data.progress && data.criteria && data.rarity && typeof data.points === 'number' && data.rewards && data.recognition);
}

// Event Serialization
export * from "./events.types";
export * from "./events.part1";
