/**
 * Social Notifications Service
 *
 * Handles push notifications for social interactions:
 * - Feed reactions
 * - Comments
 * - New followers
 * - Squad invites
 *
 * @phase 10.1
 */

import * as Notifications from 'expo-notifications';
import { createDebugger } from '../../utils/debug';
import { getSupabaseClient } from '../../config/supabase';

const debug = createDebugger('notifications:social');

// ============================================================================
// Types
// ============================================================================

export type SocialNotificationType =
  | 'FEED_REACTION'
  | 'FEED_COMMENT'
  | 'NEW_FOLLOWER'
  | 'SQUAD_INVITE'
  | 'RIVAL_CHALLENGE'
  | 'ACHIEVEMENT_UNLOCKED';

export interface SocialNotification {
  type: SocialNotificationType;
  recipientUserId: string;
  actorUserId: string;
  actorName: string;
  data: Record<string, unknown>;
}

// ============================================================================
// Notification Templates
// ============================================================================

const NOTIFICATION_TEMPLATES: Record<
  SocialNotificationType,
  (data: Record<string, unknown>, actorName: string) => { title: string; body: string }
> = {
  FEED_REACTION: (data, actorName) => ({
    title: `${actorName} reacted ${data.reactionEmoji || '💪'}`,
    body: `To your post: "${String(data.postPreview || '').substring(0, 40)}${String(data.postPreview || '').length > 40 ? '...' : ''}"`,
  }),
  FEED_COMMENT: (data, actorName) => ({
    title: `${actorName} commented`,
    body: `"${String(data.commentPreview || '').substring(0, 50)}${String(data.commentPreview || '').length > 50 ? '...' : ''}"`,
  }),
  NEW_FOLLOWER: (_data, actorName) => ({
    title: 'New Follower!',
    body: `${actorName} started following you`,
  }),
  SQUAD_INVITE: (data, actorName) => ({
    title: 'Squad Invite',
    body: `${actorName} invited you to join ${String(data.squadName || 'their squad')}`,
  }),
  RIVAL_CHALLENGE: (data, actorName) => ({
    title: 'Rival Challenge!',
    body: `${actorName} challenged you to a ${String(data.challengeType || 'focus duel')}`,
  }),
  ACHIEVEMENT_UNLOCKED: (data, _actorName) => ({
    title: '🏆 Achievement Unlocked!',
    body: `You earned: ${String(data.achievementName || 'New Achievement')}`,
  }),
};

// ============================================================================
// Push Token Retrieval
// ============================================================================

/**
 * Get user's push tokens from Supabase
 */
async function getUserPushTokens(userId: string): Promise<string[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('user_push_tokens')
      .select('expo_push_token')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      debug.warn('Failed to fetch push tokens', error);
      return [];
    }

    return (data ?? [])
      .map((row) => row.expo_push_token)
      .filter((token): token is string => Boolean(token));
  } catch (error) {
    debug.warn('Error fetching push tokens', error);
    return [];
  }
}

// ============================================================================
// Notification Dispatch
// ============================================================================

/**
 * Send push notification via Expo
 */
async function sendExpoPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<boolean> {
  try {
    // In production, this would call the Expo Push API
    // For now, we use local notifications for testing
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Show immediately
    });

    debug.info('Sent notification', { title, to: pushToken.slice(0, 10) + '...' });
    return true;
  } catch (error) {
    debug.warn('Failed to send push notification', error);
    return false;
  }
}

/**
 * Dispatch social notification to recipient
 */
export async function dispatchSocialNotification(
  notification: SocialNotification
): Promise<{ success: boolean; sentCount: number }> {
  try {
    const { type, recipientUserId, actorName, data } = notification;

    // Don't notify if actor is the same as recipient
    if (notification.actorUserId === recipientUserId) {
      return { success: true, sentCount: 0 };
    }

    // Get notification content
    const template = NOTIFICATION_TEMPLATES[type];
    const { title, body } = template(data, actorName);

    // Get recipient's push tokens
    const pushTokens = await getUserPushTokens(recipientUserId);

    if (pushTokens.length === 0) {
      debug.info('No push tokens found for user', { recipientUserId });
      return { success: true, sentCount: 0 };
    }

    // Send to all devices
    let sentCount = 0;
    for (const token of pushTokens) {
      const sent = await sendExpoPushNotification(token, title, body, {
        type,
        ...data,
        actorUserId: notification.actorUserId,
        actorName,
      });
      if (sent) {sentCount++;}
    }

    // Log to analytics
    debug.info('Social notification dispatched', {
      type,
      recipientUserId,
      actorName,
      sentCount,
    });

    return { success: sentCount > 0, sentCount };
  } catch (error) {
    debug.warn('Failed to dispatch social notification', error);
    return { success: false, sentCount: 0 };
  }
}

/**
 * Batch dispatch notifications (for squad broadcasts, etc.)
 */
export async function batchDispatchSocialNotifications(
  notifications: SocialNotification[]
): Promise<{ success: boolean; totalSent: number }> {
  let totalSent = 0;

  for (const notification of notifications) {
    const result = await dispatchSocialNotification(notification);
    totalSent += result.sentCount;
  }

  return { success: totalSent > 0, totalSent };
}

// ============================================================================
// Notification Settings
// ============================================================================

/**
 * Check if user has enabled notifications for a specific type
 */
export async function isNotificationEnabled(
  userId: string,
  notificationType: SocialNotificationType
): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('user_notification_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();

    if (error || !data?.settings) {
      // Default: all notifications enabled
      return true;
    }

    const settings = data.settings as Record<string, boolean>;
    return settings[notificationType] ?? true;
  } catch (error) {
    debug.warn('Error checking notification settings', error);
    return true; // Default to enabled on error
  }
}

/**
 * Update user's notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<Record<SocialNotificationType, boolean>>
): Promise<void> {
  try {
    await getSupabaseClient()
      .from('user_notification_settings')
      .upsert(
        {
          user_id: userId,
          settings,
          updated_at: Date.now(),
        },
        { onConflict: 'user_id' }
      );
  } catch (error) {
    debug.warn('Failed to update notification settings', error);
    throw error;
  }
}
