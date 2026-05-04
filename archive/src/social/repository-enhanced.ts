import { captureSilentFailure } from '../utils/silent-failure';
/**
 * Social System - Enhanced Repository
 *
 * Production-grade repository with:
 * - Comprehensive error handling
 * - Retry logic with exponential backoff
 * - Offline queue support
 * - Cache management
 * - Degraded mode support
 */

import { z } from 'zod';
import { getSupabaseClient } from '../config/supabase';
import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { createDebugger } from '../utils/debug';
import { eventBus } from '../events';
import {
  SocialPostSchema,
  SocialUserSchema,
  FriendRelationshipSchema,
  SocialActionQueueItemSchema,
  SocialErrorSchema,
  SocialErrorCodeSchema,
} from './schemas';
import type {
  SocialPost,
  SocialUser,
  FriendRelationship,
  SocialActionQueueItem,
  SocialError,
  FeedFilter,
  Pagination,
  RepositoryResult,
  PaginatedRepositoryResult,
} from './types';

const debug = createDebugger('social:repository');

// Storage keys
const STORAGE_KEYS = {
  offlineQueue: (userId: string) => `social:queue:${userId}`,
  cache: (userId: string, key: string) => `social:cache:${userId}:${key}`,
  state: (userId: string) => `social:state:${userId}`,
  lastSync: (userId: string) => `social:lastSync:${userId}`,
};

// Cache manager
class SocialCache {
  private storage = getMMKVStorageAdapter();

  async get<T>(userId: string, key: string): Promise<{ data: T; timestamp: number } | null> {
    const cached = await this.storage.getItem(STORAGE_KEYS.cache(userId, key));
    if (!cached) {return null;}
    try {
      return JSON.parse(cached);
    } catch (error) { captureSilentFailure(error, { feature: 'social', operation: 'network-fallback', type: 'network' });
      return null;
    }
  }

  async set<T>(userId: string, key: string, data: T, ttlMs: number): Promise<void> {
    const entry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    await this.storage.setItem(STORAGE_KEYS.cache(userId, key), JSON.stringify(entry));
  }

  async invalidate(userId: string, pattern?: string): Promise<void> {
    // MMKV doesn't support pattern deletion, so we'd need to track keys
    // For now, we'll clear specific known keys
    const keysToClear = [
      'feed',
      'friends',
      'profile',
      'notifications',
      'activities',
    ];
    for (const key of keysToClear) {
      await this.storage.removeItem(STORAGE_KEYS.cache(userId, key));
    }
  }
}

// Error categorization
function categorizeError(error: unknown): SocialError {
  if (error instanceof z.ZodError) {
    return SocialErrorSchema.parse({
      code: 'INVALID_DATA',
      message: 'Validation failed',
      details: { issues: error.issues },
      recoverable: false,
    });
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
      return SocialErrorSchema.parse({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        recoverable: true,
      });
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return SocialErrorSchema.parse({
        code: 'TIMEOUT',
        message: 'Request timed out',
        recoverable: true,
        retryAfter: 5,
      });
    }

    if (message.includes('unauthorized') || message.includes('auth')) {
      return SocialErrorSchema.parse({
        code: 'AUTH_ERROR',
        message: 'Authentication required',
        recoverable: false,
      });
    }

    if (message.includes('not found') || message.includes('404')) {
      return SocialErrorSchema.parse({
        code: 'NOT_FOUND',
        message: 'Resource not found',
        recoverable: false,
      });
    }

    if (message.includes('permission') || message.includes('forbidden')) {
      return SocialErrorSchema.parse({
        code: 'PERMISSION_DENIED',
        message: 'Permission denied',
        recoverable: false,
      });
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return SocialErrorSchema.parse({
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded',
        recoverable: true,
        retryAfter: 60,
      });
    }
  }

  return SocialErrorSchema.parse({
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Unknown error',
    recoverable: false,
  });
}

// Retry logic with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<{ success: true; data: T } | { success: false; error: SocialError }> {
  let lastError: SocialError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      lastError = categorizeError(error);

      if (!lastError.recoverable || attempt === maxRetries) {
        return { success: false, error: lastError };
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        30000,
      );

      debug.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: lastError! };
}

// Enhanced repository class
export class SocialRepository {
  private cache = new SocialCache();
  private storage = getMMKVStorageAdapter();

  // ========== POST OPERATIONS ==========

  async createPost(
    userId: string,
    post: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RepositoryResult<SocialPost>> {
    const supabase = getSupabaseClient();

    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          type: post.type,
          content: post.content,
          metadata: post.metadata,
          is_public: post.isPublic,
          squad_id: post.squadId,
          related_entity_id: post.relatedEntityId,
          media_urls: post.mediaUrls,
        })
        .select('*')
        .single();

      if (error) {throw new Error(error.message);}

      const created = SocialPostSchema.parse({
        ...data,
        userId: data.user_id,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : undefined,
        displayName: data.display_name || 'Unknown',
        avatarUrl: data.avatar_url,
        reactionCounts: data.reaction_counts || {},
        userReaction: null,
        commentCount: data.comment_count || 0,
        viewCount: data.view_count || 0,
      });

      return created;
    });

    if (result.success) {
      // Invalidate feed cache
      await this.cache.invalidate(userId, 'feed');
      eventBus.publish('social:post_created', { post: result.data, userId });
    }

    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }

  async getFeed(
    userId: string,
    filter?: FeedFilter,
    pagination?: Pagination,
  ): Promise<PaginatedRepositoryResult<SocialPost>> {
    const cacheKey = `feed:${JSON.stringify(filter)}:${JSON.stringify(pagination)}`;

    // Try cache first
    const cached = await this.cache.get<SocialPost[]>(userId, cacheKey);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) {
      return {
        success: true,
        data: cached.data,
        hasMore: cached.data.length === (pagination?.limit || 20),
        fromCache: true,
      };
    }

    const supabase = getSupabaseClient();
    const limit = pagination?.limit || 20;

    const result = await withRetry(async () => {
      let query = supabase
        .from('social_posts')
        .select('*, profiles:user_id (display_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (pagination?.cursor) {
        query = query.lt('created_at', new Date(pagination.cursor).toISOString());
      }

      if (filter?.postTypes?.length) {
        query = query.in('type', filter.postTypes);
      }

      if (filter?.fromUsers?.length) {
        query = query.in('user_id', filter.fromUsers);
      }

      const { data, error } = await query;

      if (error) {throw new Error(error.message);}

      return data.map((row: any) =>
        SocialPostSchema.parse({
          ...row,
          userId: row.user_id,
          createdAt: new Date(row.created_at).getTime(),
          displayName: row.profiles?.display_name || 'Unknown',
          avatarUrl: row.profiles?.avatar_url || null,
          reactionCounts: row.reaction_counts || {},
          userReaction: null,
        }),
      );
    });

    if (result.success) {
      // Cache the result
      await this.cache.set(userId, cacheKey, result.data, 2 * 60 * 1000);

      return {
        success: true,
        data: result.data,
        hasMore: result.data.length === limit,
        nextCursor: result.data.length > 0
          ? result.data[result.data.length - 1].createdAt
          : null,
      };
    }

    // Return cached data if available as fallback
    if (cached) {
      return {
        success: true,
        data: cached.data,
        hasMore: false,
        fromCache: true,
        error: result.error,
      };
    }

    return { success: false, error: result.error, hasMore: false };
  }

  async getPostById(postId: string, viewerId?: string): Promise<RepositoryResult<SocialPost>> {
    const supabase = getSupabaseClient();

    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, profiles:user_id (display_name, avatar_url)')
        .eq('id', postId)
        .single();

      if (error) {throw new Error(error.message);}

      let userReaction = null;
      if (viewerId) {
        const { data: reaction } = await supabase
          .from('social_reactions')
          .select('reaction_type')
          .eq('post_id', postId)
          .eq('user_id', viewerId)
          .single();
        if (reaction) {userReaction = reaction.reaction_type;}
      }

      return SocialPostSchema.parse({
        ...data,
        userId: data.user_id,
        createdAt: new Date(data.created_at).getTime(),
        displayName: data.profiles?.display_name || 'Unknown',
        avatarUrl: data.profiles?.avatar_url || null,
        reactionCounts: data.reaction_counts || {},
        userReaction,
      });
    });

    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }

  // ========== REACTION OPERATIONS ==========

  async addReaction(
    userId: string,
    postId: string,
    reaction: string,
  ): Promise<RepositoryResult<void>> {
    const supabase = getSupabaseClient();

    const result = await withRetry(async () => {
      const { error } = await supabase.from('social_reactions').upsert({
        user_id: userId,
        post_id: postId,
        reaction_type: reaction,
        created_at: new Date().toISOString(),
      });

      if (error) {throw new Error(error.message);}
    });

    if (result.success) {
      eventBus.publish('social:reaction_added', { userId, postId, reaction });
    }

    return result.success
      ? { success: true, data: undefined }
      : { success: false, error: result.error };
  }

  async removeReaction(userId: string, postId: string): Promise<RepositoryResult<void>> {
    const supabase = getSupabaseClient();

    const result = await withRetry(async () => {
      const { error } = await supabase
        .from('social_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {throw new Error(error.message);}
    });

    if (result.success) {
      eventBus.publish('social:reaction_removed', { userId, postId });
    }

    return result.success
      ? { success: true, data: undefined }
      : { success: false, error: result.error };
  }

  // ========== FRIEND OPERATIONS ==========

  async getFriends(userId: string): Promise<RepositoryResult<FriendRelationship[]>> {
    const cacheKey = 'friends';
    const cached = await this.cache.get<FriendRelationship[]>(userId, cacheKey);

    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return { success: true, data: cached.data, fromCache: true };
    }

    const supabase = getSupabaseClient();

    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('friend_relationships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'friends');

      if (error) {throw new Error(error.message);}

      return data.map((row: any) =>
        FriendRelationshipSchema.parse({
          ...row,
          userId: row.user_id,
          friendId: row.friend_id,
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
        }),
      );
    });

    if (result.success) {
      await this.cache.set(userId, cacheKey, result.data, 10 * 60 * 1000);
      return { success: true, data: result.data };
    }

    if (cached) {
      return { success: true, data: cached.data, fromCache: true, error: result.error };
    }

    return { success: false, error: result.error };
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string,
  ): Promise<RepositoryResult<FriendRelationship>> {
    const supabase = getSupabaseClient();

    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('friend_relationships')
        .insert({
          user_id: fromUserId,
          friend_id: toUserId,
          status: 'pending_sent',
          message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {throw new Error(error.message);}

      return FriendRelationshipSchema.parse({
        ...data,
        userId: data.user_id,
        friendId: data.friend_id,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      });
    });

    if (result.success) {
      eventBus.publish('social:friend_request_sent', {
        fromUserId,
        toUserId,
        relationship: result.data,
      });
    }

    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error };
  }

  // ========== OFFLINE QUEUE ==========

  async getOfflineQueue(userId: string): Promise<SocialActionQueueItem[]> {
    const data = await this.storage.getItem(STORAGE_KEYS.offlineQueue(userId));
    if (!data) {return [];}
    try {
      const items = JSON.parse(data);
      return items.map((item: unknown) => SocialActionQueueItemSchema.parse(item));
    } catch (error) { captureSilentFailure(error, { feature: 'social', operation: 'network-fallback', type: 'network' });
      return [];
    }
  }

  async addToQueue(userId: string, action: Omit<SocialActionQueueItem, 'id' | 'createdAt'>): Promise<SocialActionQueueItem> {
    const queue = await this.getOfflineQueue(userId);
    const newItem = SocialActionQueueItemSchema.parse({
      ...action,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    });

    queue.push(newItem);
    await this.storage.setItem(STORAGE_KEYS.offlineQueue(userId), JSON.stringify(queue));

    return newItem;
  }

  async removeFromQueue(userId: string, itemId: string): Promise<void> {
    const queue = await this.getOfflineQueue(userId);
    const filtered = queue.filter((item) => item.id !== itemId);
    await this.storage.setItem(STORAGE_KEYS.offlineQueue(userId), JSON.stringify(filtered));
  }

  async clearQueue(userId: string): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.offlineQueue(userId));
  }

  // ========== SYNC ==========

  async getLastSyncTime(userId: string): Promise<number | null> {
    const data = await this.storage.getItem(STORAGE_KEYS.lastSync(userId));
    return data ? parseInt(data, 10) : null;
  }

  async setLastSyncTime(userId: string, timestamp: number): Promise<void> {
    await this.storage.setItem(STORAGE_KEYS.lastSync(userId), timestamp.toString());
  }
}

// Singleton instance
let repositoryInstance: SocialRepository | null = null;

export function getSocialRepository(): SocialRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SocialRepository();
  }
  return repositoryInstance;
}

export { SocialCache, categorizeError, withRetry };
