import type { SessionStory } from './schemas';

export function initializeSessionStoryEngine(): () => void {
  return () => {};
}

export async function getStoryForSession(
  _sessionId: string,
  _userId: string,
): Promise<SessionStory | null> {
  return null;
}

export async function getStoriesForUser(_userId: string): Promise<SessionStory[]> {
  return [];
}

export async function markStoryBeatViewed(
  _storyId: string,
  _beatId: string,
): Promise<void> {}

export async function shareStory(_storyId: string): Promise<void> {}
