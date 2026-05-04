import { z } from 'zod';

import { getSupabaseClient } from '../config/supabase';

const postTypeSchema = z.enum([
  'session_complete',
  'level_up',
  'streak_milestone',
  'achievement',
  'duel_result',
  'boss_defeat',
]);
const reactionSchema = z.enum(['fire', 'strong', 'clap', 'mind_blown']);
const feedRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: postTypeSchema,
  content: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.number(),
  profiles: z
    .object({
      display_name: z.string().nullable().optional(),
      avatar_url: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type SocialPostType = z.infer<typeof postTypeSchema>;
export type PostReaction = z.infer<typeof reactionSchema>;
export type FeedRow = z.infer<typeof feedRowSchema>;

const supabase = getSupabaseClient();

export async function insertPost(input: {
  userId: string;
  type: SocialPostType;
  content: string;
  metadata: Record<string, unknown>;
}): Promise<FeedRow> {
  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      user_id: input.userId,
      type: input.type,
      content: input.content,
      metadata: input.metadata,
      created_at: Date.now(),
    })
    .select(
      'id, user_id, type, content, metadata, created_at, profiles:profiles(display_name, avatar_url)',
    )
    .single();
  if (error) {throw error;}
  return feedRowSchema.parse(data);
}

export async function fetchPostById(postId: string): Promise<FeedRow | null> {
  const { data, error } = await supabase
    .from('social_posts')
    .select(
      'id, user_id, type, content, metadata, created_at, profiles:profiles(display_name, avatar_url)',
    )
    .eq('id', postId)
    .maybeSingle();
  if (error) {throw error;}
  return data ? feedRowSchema.parse(data) : null;
}

export async function findSessionPost(
  userId: string,
  sessionId: string,
): Promise<FeedRow | null> {
  const { data, error } = await supabase
    .from('social_posts')
    .select('id, user_id, type, content, metadata, created_at')
    .eq('user_id', userId)
    .eq('type', 'session_complete')
    .contains('metadata', { sessionId })
    .maybeSingle();
  if (error) {throw error;}
  return data ? feedRowSchema.parse(data) : null;
}

export async function fetchFollowedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select('followed_user_id')
    .eq('follower_user_id', userId);
  if (error) {throw error;}
  return (data ?? []).flatMap((row) =>
    typeof row.followed_user_id === 'string' ? [row.followed_user_id] : [],
  );
}

export async function fetchSquadMemberIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('squad_members')
    .select('squad_id')
    .eq('user_id', userId)
    .eq('is_active', true);
  if (error) {throw error;}
  const squadIds = (data ?? []).flatMap((row) =>
    typeof row.squad_id === 'string' ? [row.squad_id] : [],
  );
  if (squadIds.length === 0) {
    return [];
  }
  const members = await supabase
    .from('squad_members')
    .select('user_id')
    .in('squad_id', squadIds)
    .eq('is_active', true);
  if (members.error) {throw members.error;}
  return (members.data ?? []).flatMap((row) =>
    typeof row.user_id === 'string' ? [row.user_id] : [],
  );
}

export async function fetchFeed(
  userIds: string[],
  cursor: number | null,
  limit: number,
): Promise<FeedRow[]> {
  let query = supabase
    .from('social_posts')
    .select(
      'id, user_id, type, content, metadata, created_at, profiles:profiles(display_name, avatar_url)',
    )
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  const { data, error } = await query;
  if (error) {throw error;}
  return z.array(feedRowSchema).parse(data ?? []);
}

export async function fetchSquadFeed(
  squadId: string,
  cursor: number | null,
  limit: number,
): Promise<FeedRow[]> {
  const members = await supabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('is_active', true);
  if (members.error) {throw members.error;}
  const userIds = (members.data ?? []).flatMap((row) =>
    typeof row.user_id === 'string' ? [row.user_id] : [],
  );
  if (userIds.length === 0) {
    return [];
  }
  return fetchFeed(userIds, cursor, limit);
}

export async function upsertReaction(
  userId: string,
  postId: string,
  reaction: PostReaction,
): Promise<void> {
  const { error } = await supabase.from('post_reactions').upsert(
    {
      user_id: userId,
      post_id: postId,
      reaction,
      created_at: Date.now(),
    },
    { onConflict: 'post_id,user_id' },
  );
  if (error) {throw error;}
}

export async function deleteReaction(
  userId: string,
  postId: string,
): Promise<void> {
  const { error } = await supabase
    .from('post_reactions')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) {throw error;}
}

export async function fetchUserReaction(
  userId: string,
  postId: string,
): Promise<PostReaction | null> {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();
  if (error) {throw error;}
  return data ? reactionSchema.parse(data.reaction) : null;
}

export async function fetchReactionCounts(
  postId: string,
): Promise<Record<PostReaction, number>> {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction')
    .eq('post_id', postId);
  if (error) {throw error;}
  const counts: Record<PostReaction, number> = {
    fire: 0,
    strong: 0,
    clap: 0,
    mind_blown: 0,
  };
  for (const row of data ?? []) {
    const reaction = reactionSchema.parse(row.reaction);
    counts[reaction] += 1;
  }
  return counts;
}
