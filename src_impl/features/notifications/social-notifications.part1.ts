import * as Notifications from "expo-notifications";
import { createDebugger } from "../../utils/debug";
import { getSupabaseClient } from "../../config/supabase";


export async function dispatchSocialNotification(notification: SocialNotification): Promise<{ success: boolean; sentCount: number }> {
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
      if (sent) {
        sentCount++;
      }
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

export async function batchDispatchSocialNotifications(notifications: SocialNotification[]): Promise<{ success: boolean; totalSent: number }> {
  let totalSent = 0;

  for (const notification of notifications) {
    const result = await dispatchSocialNotification(notification);
    totalSent += result.sentCount;
  }

  return { success: totalSent > 0, totalSent };
}

export async function isNotificationEnabled(userId: string, notificationType: SocialNotificationType): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient().from('user_notification_settings').select('settings').eq('user_id', userId).single();

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

export async function updateNotificationSettings(userId: string, settings: Partial<Record<SocialNotificationType, boolean>>): Promise<void> {
  try {
    await getSupabaseClient().from('user_notification_settings').upsert(
      {
        user_id: userId,
        settings,
        updated_at: Date.now(),
      },
      { onConflict: 'user_id' },
    );
  } catch (error) {
    debug.warn('Failed to update notification settings', error);
    throw error;
  }
}