/**
 * Session Story Repository
 *
 * Persistence layer for session stories.
 * Stores generated narratives for replay and analytics.
 */

import { getSupabaseClient } from '@/config/supabase';
import { RepositoryError } from '@/lib/repository/base';
import { createDebugger } from '@/utils/debug';
import * as Sentry from '@sentry/react-native';
import type { SessionStory, StorySessionRow } from './schemas';
import { StorySessionRowSchema } from './schemas';

const debug = createDebugger('session-story:repository');
const supabase = getSupabaseClient();

// ============================================================================
// Serialization
// ============================================================================

function serializeStory(story: SessionStory): string {
  return JSON.stringify(story);
}

function deserializeStory(json: string): SessionStory {
  return JSON.parse(json) as SessionStory;
}

function parseStoryRow(row: unknown): SessionStory {
  const parsed = StorySessionRowSchema.safeParse(row);
  if (!parsed.success) {
    throw new RepositoryError('parseStoryRow', new Error('Invalid story row format'));
  }

  return deserializeStory(parsed.data.story_data);
}

// ============================================================================
// CRUD Operations
// ============================================================================

export async function saveStory(story: SessionStory): Promise<void> {
  const row: Omit<StorySessionRow, 'created_at'> & { created_at: number } = {
    id: story.id,
    session_id: story.sessionId,
    user_id: story.userId,
    story_data: serializeStory(story),
    viewed: false,
    viewed_at: null,
    completion_rate: 0,
    created_at: story.createdAt,
  };

  const { error } = await supabase.from('session_stories').upsert(row, { onConflict: 'session_id' });

  if (error) {
    debug.error('Failed to save story', error);
    throw new RepositoryError('saveStory', error);
  }

  debug.info('Story saved: %s', story.id);
}

export async function fetchStoryById(storyId: string): Promise<SessionStory | null> {
  const { data, error } = await supabase.from('session_stories').select('*').eq('id', storyId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchStoryById', error);
  }

  return parseStoryRow(data);
}

export async function fetchStoryBySessionId(sessionId: string, userId: string): Promise<SessionStory | null> {
  const { data, error } = await supabase.from('session_stories').select('*').eq('session_id', sessionId).eq('user_id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchStoryBySessionId', error);
  }

  return parseStoryRow(data);
}

export async function fetchStoriesForUser(userId: string, limit: number = 10): Promise<SessionStory[]> {
  const { data, error } = await supabase.from('session_stories').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);

  if (error) {
    throw new RepositoryError('fetchStoriesForUser', error);
  }

  return (data ?? []).map(parseStoryRow);
}

export async function fetchUnviewedStories(userId: string): Promise<SessionStory[]> {
  const { data, error } = await supabase.from('session_stories').select('*').eq('user_id', userId).eq('viewed', false).order('created_at', { ascending: false });

  if (error) {
    throw new RepositoryError('fetchUnviewedStories', error);
  }

  return (data ?? []).map(parseStoryRow);
}

// ============================================================================
// Update Operations
// ============================================================================

export async function markStoryViewed(storyId: string, completionRate: number): Promise<void> {
  const { error } = await supabase
    .from('session_stories')
    .update({
      viewed: true,
      viewed_at: Date.now(),
      completion_rate: completionRate,
    })
    .eq('id', storyId);

  if (error) {
    throw new RepositoryError('markStoryViewed', error);
  }

  debug.info('Story marked viewed: %s (%.0f%%)', storyId, completionRate);
}

export async function markStoryShared(storyId: string): Promise<void> {
  // Update the story data JSON to set sharedAt
  const story = await fetchStoryById(storyId);
  if (!story) {
    throw new RepositoryError('markStoryShared', new Error('Story not found'));
  }

  const updatedStory: SessionStory = {
    ...story,
    sharedAt: Date.now(),
  };

  const { error } = await supabase
    .from('session_stories')
    .update({
      story_data: serializeStory(updatedStory),
    })
    .eq('id', storyId);

  if (error) {
    throw new RepositoryError('markStoryShared', error);
  }
}

export async function updateStoryCompletionRate(storyId: string, completionRate: number): Promise<void> {
  const { error } = await supabase.from('session_stories').update({ completion_rate: completionRate }).eq('id', storyId);

  if (error) {
    throw new RepositoryError('updateStoryCompletionRate', error);
  }
}

// ============================================================================
// Analytics Queries
// ============================================================================

export async function getStoryEngagementStats(
  userId: string,
  daysBack: number = 30,
): Promise<{
  totalStories: number;
  viewedStories: number;
  averageCompletionRate: number;
  mostEngagingBeatType: string | null;
}> {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;

  const { data, error } = await supabase.from('session_stories').select('viewed, completion_rate, story_data').eq('user_id', userId).gte('created_at', cutoff);

  if (error) {
    throw new RepositoryError('getStoryEngagementStats', error);
  }

  const stories = data ?? [];
  const totalStories = stories.length;
  const viewedStories = stories.filter((s: { viewed: boolean }) => s.viewed).length;
  const avgCompletion = totalStories > 0 ? stories.reduce((sum: number, s: { completion_rate?: number }) => sum + (s.completion_rate ?? 0), 0) / totalStories : 0;

  // Find most engaging beat type
  const beatTypeCounts: Record<string, number> = {};
  for (const row of stories) {
    try {
      const story: SessionStory = JSON.parse(row.story_data);
      for (const beat of story.beats) {
        beatTypeCounts[beat.type] = (beatTypeCounts[beat.type] ?? 0) + 1;
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'session-story', operation: 'parseStoryRow' },
      });
    }
  }

  const mostEngagingBeatType = Object.entries(beatTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalStories,
    viewedStories,
    averageCompletionRate: avgCompletion,
    mostEngagingBeatType,
  };
}
