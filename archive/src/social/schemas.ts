/**
 * Social System - Validation Schemas
 *
 * Comprehensive Zod schemas for the social feature.
 */

import { z } from 'zod';

// Reaction types
export const ReactionTypeSchema = z.enum([
  'fire',
  'strong',
  'clap',
  'mind_blown',
  'heart',
  'celebrate',
]);

// Post types
export const PostTypeSchema = z.enum([
  'session_complete',
  'level_up',
  'streak_milestone',
  'achievement',
  'duel_result',
  'boss_defeat',
  'challenge_complete',
  'mastery_rank_up',
  'squad_war_result',
  'season_rank',
  'friend_milestone',
  'custom',
]);

// Friendship status
export const FriendshipStatusSchema = z.enum([
  'none',
  'pending_sent',
  'pending_received',
  'friends',
  'blocked',
  'following',
]);

// Error codes
export const SocialErrorCodeSchema = z.enum([
  'NETWORK_ERROR',
  'AUTH_ERROR',
  'NOT_FOUND',
  'PERMISSION_DENIED',
  'RATE_LIMITED',
  'ALREADY_EXISTS',
  'INVALID_DATA',
  'SERVER_ERROR',
  'OFFLINE',
  'TIMEOUT',
  'UNKNOWN',
]);

// Network status
export const SocialNetworkStatusSchema = z.enum([
  'connected',
  'disconnected',
  'degraded',
  'offline',
  'reconnecting',
]);

// Reaction counts
export const ReactionCountsSchema = z.object({
  fire: z.number().min(0).default(0),
  strong: z.number().min(0).default(0),
  clap: z.number().min(0).default(0),
  mind_blown: z.number().min(0).default(0),
  heart: z.number().min(0).default(0),
  celebrate: z.number().min(0).default(0),
});

// Social post schema
export const SocialPostSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: PostTypeSchema,
  content: z.string().min(1).max(1000),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  displayName: z.string(),
  avatarUrl: z.string().nullable().default(null),
  reactionCounts: ReactionCountsSchema.default({}),
  userReaction: ReactionTypeSchema.nullable().default(null),
  commentCount: z.number().min(0).default(0),
  viewCount: z.number().min(0).default(0),
  isPublic: z.boolean().default(true),
  squadId: z.string().optional(),
  relatedEntityId: z.string().optional(), // sessionId, achievementId, etc.
  mediaUrls: z.array(z.string()).optional(),
});

// Social user schema
export const SocialUserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable().default(null),
  level: z.number().min(1).default(1),
  currentStreak: z.number().min(0).default(0),
  longestStreak: z.number().min(0).default(0),
  isPremium: z.boolean().default(false),
  lastActiveAt: z.number().optional(),
  bio: z.string().max(500).optional(),
  joinedAt: z.number(),
  privacySettings: z.object({
    profileVisible: z.boolean().default(true),
    activityVisible: z.boolean().default(true),
    allowFriendRequests: z.boolean().default(true),
    allowFollowers: z.boolean().default(true),
  }).default({}),
});

// Friend relationship schema
export const FriendRelationshipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  friendId: z.string(),
  status: FriendshipStatusSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  following: z.boolean().default(false),
  notificationEnabled: z.boolean().default(true),
  customName: z.string().optional(),
});

// Social activity schema
export const SocialActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  actorAvatar: z.string().nullable().default(null),
  type: z.enum([
    'reacted_to_post',
    'commented_on_post',
    'followed_you',
    'friend_request',
    'accepted_friend',
    'mentioned_you',
    'achieved_milestone',
    'beat_your_score',
    'joined_squad',
  ]),
  postId: z.string().optional(),
  postPreview: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  read: z.boolean().default(false),
  createdAt: z.number(),
});

// Social error schema
export const SocialErrorSchema = z.object({
  code: SocialErrorCodeSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  recoverable: z.boolean().default(false),
  retryAfter: z.number().optional(), // seconds
  requestId: z.string().optional(),
  timestamp: z.number().default(() => Date.now()),
});

// Action queue item schema
export const SocialActionQueueItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  action: z.enum([
    'create_post',
    'react',
    'send_friend_request',
    'accept_friend_request',
    'follow_user',
    'unfollow_user',
    'update_profile',
    'delete_post',
  ]),
  payload: z.record(z.unknown()),
  retryCount: z.number().min(0).default(0),
  maxRetries: z.number().min(0).default(3),
  createdAt: z.number(),
  lastAttemptAt: z.number().optional(),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  status: z.enum(['pending', 'processing', 'failed', 'completed']).default('pending'),
  error: SocialErrorSchema.optional(),
});

// Social state schema
export const SocialStateSchema = z.object({
  userId: z.string(),
  feed: z.array(SocialPostSchema).default([]),
  activities: z.array(SocialActivitySchema).default([]),
  friends: z.array(FriendRelationshipSchema).default([]),
  followers: z.array(SocialUserSchema).default([]),
  following: z.array(SocialUserSchema).default([]),
  suggestions: z.array(SocialUserSchema).default([]),
  notifications: z.array(z.unknown()).default([]), // Use SocialNotification type
  stats: z.object({
    followerCount: z.number().default(0),
    followingCount: z.number().default(0),
    postCount: z.number().default(0),
    totalReactions: z.number().default(0),
  }).default({}),
  networkStatus: SocialNetworkStatusSchema.default('connected'),
  offlineQueue: z.array(SocialActionQueueItemSchema).default([]),
  lastSyncAt: z.number().optional(),
  isDegraded: z.boolean().default(false),
  // UI state
  feedLoading: z.boolean().default(false),
  feedError: SocialErrorSchema.nullable().default(null),
  feedHasMore: z.boolean().default(false),
  friendsLoading: z.boolean().default(false),
  friendsError: SocialErrorSchema.nullable().default(null),
  notificationsLoading: z.boolean().default(false),
  notificationsError: SocialErrorSchema.nullable().default(null),
});

// Feed filter schema
export const FeedFilterSchema = z.object({
  postTypes: z.array(PostTypeSchema).optional(),
  fromUsers: z.array(z.string()).optional(),
  fromSquads: z.array(z.string()).optional(),
  minDate: z.number().optional(),
  maxDate: z.number().optional(),
  hasReactions: z.boolean().optional(),
  hasComments: z.boolean().optional(),
});

// Pagination schema
export const PaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.number().nullable().default(null),
  direction: z.enum(['forward', 'backward']).default('forward'),
});

// Analytics event schema
export const SocialAnalyticsEventSchema = z.enum([
  'social_post_created',
  'social_post_viewed',
  'social_post_shared',
  'social_post_deleted',
  'social_reaction_added',
  'social_reaction_removed',
  'social_comment_added',
  'social_friend_request_sent',
  'social_friend_request_accepted',
  'social_friend_removed',
  'social_follow_added',
  'social_follow_removed',
  'social_profile_viewed',
  'social_feed_refreshed',
  'social_feed_load_more',
  'social_error_occurred',
  'social_offline_mode_activated',
  'social_degraded_mode_activated',
]);

// Request/response schemas
export const CreatePostRequestSchema = z.object({
  type: PostTypeSchema,
  content: z.string().min(1).max(1000),
  metadata: z.record(z.unknown()).optional(),
  isPublic: z.boolean().default(true),
  squadId: z.string().optional(),
  relatedEntityId: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

export const ReactRequestSchema = z.object({
  postId: z.string().uuid(),
  reaction: ReactionTypeSchema,
});

export const FriendRequestSchema = z.object({
  toUserId: z.string(),
  message: z.string().max(500).optional(),
});

export const RespondToFriendRequestSchema = z.object({
  requestId: z.string().uuid(),
  accept: z.boolean(),
});

export const UpdateProfileRequestSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().optional(),
  privacySettings: z.object({
    profileVisible: z.boolean().optional(),
    activityVisible: z.boolean().optional(),
    allowFriendRequests: z.boolean().optional(),
    allowFollowers: z.boolean().optional(),
  }).optional(),
});

// Cache configuration
export const SocialCacheConfigSchema = z.object({
  feedTTL: z.number().default(2 * 60 * 1000), // 2 minutes
  profileTTL: z.number().default(5 * 60 * 1000), // 5 minutes
  friendsTTL: z.number().default(10 * 60 * 1000), // 10 minutes
  notificationsTTL: z.number().default(60 * 1000), // 1 minute
  maxCachedFeeds: z.number().default(10),
  maxCachedProfiles: z.number().default(50),
});

// Service configuration
export const SocialServiceConfigSchema = z.object({
  retryAttempts: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(100).default(1000),
  enableOfflineQueue: z.boolean().default(true),
  maxQueueSize: z.number().min(1).max(1000).default(100),
  enableAnalytics: z.boolean().default(true),
  degradedModeTimeout: z.number().min(1000).default(30000),
  cache: SocialCacheConfigSchema.default({}),
});
