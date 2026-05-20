import {
  StoryGeneratedEvent,
  StoryStartedEvent,
  StoryChoiceMadeEvent,
  StoryAchievementUnlockedEvent,
  SessionStoryEventType,
} from "./types";

export function validateSessionStoryEvent(
  event: SessionStoryEventType,
): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }
  if (!event.type || !event.data || !event.metadata) {
    return false;
  }
  switch (event.type) {
    case "story_generated":
      return validateStoryGeneratedEvent(event as StoryGeneratedEvent);
    case "story_started":
      return validateStoryStartedEvent(event as StoryStartedEvent);
    case "story_choice_made":
      return validateStoryChoiceMadeEvent(event as StoryChoiceMadeEvent);
    case "story_achievement_unlocked":
      return validateStoryAchievementUnlockedEvent(
        event as StoryAchievementUnlockedEvent,
      );
    default:
      return true;
  }
}
function validateStoryGeneratedEvent(event: StoryGeneratedEvent): boolean {
  const { data } = event;
  return !!(
    data.storyId &&
    data.generationType &&
    data.generatedAt &&
    data.narrative &&
    data.structure &&
    data.personalization
  );
}
function validateStoryStartedEvent(event: StoryStartedEvent): boolean {
  const { data } = event;
  return !!(
    data.storyId &&
    data.startedAt &&
    data.startType &&
    typeof data.chapter === "number" &&
    typeof data.scene === "number" &&
    data.context &&
    data.expectations
  );
}
function validateStoryChoiceMadeEvent(event: StoryChoiceMadeEvent): boolean {
  const { data } = event;
  return !!(
    data.storyId &&
    data.choiceId &&
    data.optionId &&
    data.madeAt &&
    typeof data.decisionTime === "number" &&
    data.reasoning &&
    data.context &&
    data.confidence
  );
}
function validateStoryAchievementUnlockedEvent(
  event: StoryAchievementUnlockedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.achievementId &&
    data.achievementName &&
    data.achievementType &&
    data.unlockedAt &&
    data.storyId &&
    data.progress &&
    data.criteria &&
    data.rarity &&
    typeof data.points === "number" &&
    data.rewards &&
    data.recognition
  );
}
export function serializeSessionStoryEvent(
  event: SessionStoryEventType,
): string {
  return JSON.stringify({ ...event, timestamp: event.timestamp.toISOString() });
}
export function deserializeSessionStoryEvent(
  data: string,
): SessionStoryEventType {
  const parsed = JSON.parse(data);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}
