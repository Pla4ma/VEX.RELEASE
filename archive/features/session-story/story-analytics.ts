import { eventBus } from '@/events';
import { createDebugger } from '@/utils/debug';
import { StoryAnalyticsEventSchema, type StoryAnalyticsEvent } from './schemas';

const debug = createDebugger('session-story:analytics');

export function trackStoryEvent(
  event: Omit<StoryAnalyticsEvent, 'timestamp'> & { timestamp: number },
): void {
  const validated = StoryAnalyticsEventSchema.safeParse(event);
  if (!validated.success) {
    debug.warn('Invalid analytics event:', validated.error);
    return;
  }
  eventBus.publish('session:story:analytics', validated.data);
  eventBus.publish('analytics:track', {
    event: `session_story_${event.eventType.toLowerCase()}`,
    properties: {
      storyId: event.storyId,
      userId: event.userId,
      beatType: event.beatType,
      ...event.metadata,
    },
  });
}
