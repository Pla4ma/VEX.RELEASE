/**
 * Session Story Feature - Barrel Export
 *
 * Post-session cinematic narrative system.
 */

// Schemas & Types
export * from './schemas';

// Core Engine
export {
  initializeSessionStoryEngine,
  buildStoryContext,
  getStoryForSession,
  getStoriesForUser,
  markStoryBeatViewed,
  shareStory,
} from './SessionStoryEngine';

// Story Generator (manual invocation only)
export { generateStoryForCompletedSession } from './StoryGenerator';
export type { StoryGeneratorContext } from './StoryGenerator';

// Story Calculator
export { calculateStory, BEAT_TEMPLATES } from './StoryBeatCalculator';

// Repository
export * from './repository';

// Hooks
export { useSessionStory } from './hooks/useSessionStory';

// UI Components
export { StoryMoment } from './components/StoryMoment';
