/**
 * Social Activity Feed Services
 */

import { eventBus } from '../../../events/EventBus';
import type { ActivityFeedItem } from '../types';

export interface CreateActivityParams {
  actorId: string;
  type: ActivityFeedItem['type'];
  action: string;
  visibility: ActivityFeedItem['visibility'];
  data?: Record<string, unknown>;
}

/**
 * Create a new activity feed item
 */
export async function createActivityFeedItem(
  params: CreateActivityParams
): Promise<ActivityFeedItem> {
  const { actorId, type, action, visibility, data = {} } = params;

  const item: ActivityFeedItem = {
    id: `activity-${Date.now()}`,
    userId: actorId,
    actorId,
    actorName: '', // Would be populated from user profile
    type,
    action,
    timestamp: Date.now(),
    visibility,
    data,
    likes: 0,
    comments: 0,
    reactionCounts: {},
    userReaction: undefined,
  };

  // In production: save to database
  // await repository.saveActivityItem(item);

  // Publish to followers' feeds
  eventBus.publish('social:activity-created', {
    userId: actorId,
    activityType: 'POST_CREATED',
    data: {},
  });

  return item;
}

/**
 * Get activity feed for user
 */
export async function getActivityFeed(
  userId: string,
  page: number = 1
): Promise<ActivityFeedItem[]> {
  // In production: fetch from database with pagination
  return [];
}

/**
 * Like an activity item
 */
export async function likeActivityItem(
  userId: string,
  itemId: string
): Promise<void> {
  // In production: save like to database
  // await repository.createLike(itemId, userId);

  eventBus.publish('social:activity-liked', {
    userId,
    itemId,
    timestamp: Date.now(),
  });
}
