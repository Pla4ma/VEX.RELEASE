import { z } from 'zod';

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import {
  type FeedRow,
  type PostReaction,
  type SocialPostType,
  deleteReaction,
  fetchFeed,
  fetchFollowedUserIds,
  fetchPostById,
  fetchReactionCounts,
  fetchSquadFeed,
  fetchSquadMemberIds,
  fetchUserReaction,
  findSessionPost,
  insertPost,
  upsertReaction,
} from './repository';

const debug = createDebugger('social');
const metadataSchema = z.record(z.unknown()).default({});
const autoPostSchema = z.object({
  userId: z.string(),
  type: z.enum(['level_up']),
  content: z.string(),
  metadata: metadataSchema,
});

export const SocialPostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    'session_complete',
    'level_up',
    'streak_milestone',
    'achievement',
    'duel_result',
    'boss_defeat',
  ]),
  content: z.string(),
  metadata: metadataSchema,
  createdAt: z.number(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  reactionCounts: z.object({
    fire: z.number(),
    strong: z.number(),
    clap: z.number(),
    mind_blown: z.number(),
  }),
  userReaction: z.enum(['fire', 'strong', 'clap', 'mind_blown']).nullable(),
});

export type SocialPost = z.infer<typeof SocialPostSchema>;

const subscriptions: Array<() => void> = [];
let initialized = false;

function mapPost(
  row: FeedRow,
  counts: SocialPost['reactionCounts'],
  userReaction: PostReaction | null,
): SocialPost {
  return SocialPostSchema.parse({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    content: row.content,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    displayName: row.profiles?.display_name ?? 'Unknown',
    avatarUrl: row.profiles?.avatar_url ?? null,
    reactionCounts: counts,
    userReaction,
  });
}

async function enrichPost(
  row: FeedRow,
  viewerId?: string,
): Promise<SocialPost> {
  const [counts, userReaction] = await Promise.all([
    fetchReactionCounts(row.id),
    viewerId ? fetchUserReaction(viewerId, row.id) : Promise.resolve(null),
  ]);
  return mapPost(row, counts, userReaction);
}

function ensureInitialized(): void {
  if (initialized) {return;}
  initialized = true;
  subscriptions.push(
    eventBus.subscribe('social:post_auto', (payload) => {
      void (async () => {
        const validated = autoPostSchema.parse(payload);
        try {
          await createPost(
            validated.userId,
            validated.type,
            validated.content,
            validated.metadata,
          );
        } catch (error) {
          debug.error('Failed to auto-create social post', error as Error);
        }
      })();
    }),
  );
}

export async function createPost(
  userId: string,
  type: SocialPostType,
  content: string,
  metadata: Record<string, unknown> = {},
): Promise<SocialPost> {
  ensureInitialized();
  const created = await insertPost({
    userId,
    type,
    content,
    metadata: metadataSchema.parse(metadata),
  });
  return enrichPost(created, userId);
}

export async function getFeed(
  userId: string,
  cursor: number | null = null,
  limit = 20,
): Promise<{ items: SocialPost[]; nextCursor: number | null }> {
  ensureInitialized();
  const [followedIds, squadIds] = await Promise.all([
    fetchFollowedUserIds(userId),
    fetchSquadMemberIds(userId),
  ]);
  const rows = await fetchFeed(
    Array.from(new Set([userId, ...followedIds, ...squadIds])),
    cursor,
    limit,
  );
  const items = await Promise.all(rows.map((row) => enrichPost(row, userId)));
  const lastItem = items.length > 0 ? items[items.length - 1] : null;
  return {
    items,
    nextCursor: items.length === limit ? (lastItem?.createdAt ?? null) : null,
  };
}

export async function getSquadFeed(
  squadId: string,
  userId?: string,
  cursor: number | null = null,
  limit = 20,
): Promise<{ items: SocialPost[]; nextCursor: number | null }> {
  ensureInitialized();
  const rows = await fetchSquadFeed(squadId, cursor, limit);
  const items = await Promise.all(rows.map((row) => enrichPost(row, userId)));
  const lastItem = items.length > 0 ? items[items.length - 1] : null;
  return {
    items,
    nextCursor: items.length === limit ? (lastItem?.createdAt ?? null) : null,
  };
}

export async function reactToPost(
  userId: string,
  postId: string,
  reaction: PostReaction,
): Promise<void> {
  ensureInitialized();
  await upsertReaction(userId, postId, reaction);
}

export async function removeReaction(
  userId: string,
  postId: string,
): Promise<void> {
  ensureInitialized();
  await deleteReaction(userId, postId);
}

export async function getReactionCounts(
  postId: string,
): Promise<SocialPost['reactionCounts']> {
  return fetchReactionCounts(postId);
}

export async function getPost(
  postId: string,
  viewerId?: string,
): Promise<SocialPost | null> {
  const row = await fetchPostById(postId);
  return row ? enrichPost(row, viewerId) : null;
}

export async function autoCreateSessionCompletePost(input: {
  userId: string;
  sessionId: string;
  duration: number;
  score: number;
}): Promise<SocialPost | null> {
  const existing = await findSessionPost(input.userId, input.sessionId);
  if (existing) {
    return null;
  }
  return createPost(
    input.userId,
    'session_complete',
    `Completed a high-scoring session with ${input.score} focus score.`,
    input,
  );
}

export function initializeSocialService(): void {
  ensureInitialized();
}

export function cleanupSocialService(): void {
  while (subscriptions.length > 0) {
    const unsubscribe = subscriptions.pop();
    unsubscribe?.();
  }
  initialized = false;
}
