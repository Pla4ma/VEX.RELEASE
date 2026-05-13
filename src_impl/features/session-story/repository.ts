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
// ============================================================================
// Update Operations
// ============================================================================
// ============================================================================
// Analytics Queries
// ============================================================================
export * from "./repository.part1";
