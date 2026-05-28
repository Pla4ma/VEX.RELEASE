import { eventBus } from "../../events/EventBus";
import * as Sentry from "@sentry/react-native";
import type {
  SocialActivity,
  CompetitiveResult,
  SquadChallenge,
} from "./social-feed-types";

export async function createFeedEntry(
  activity: SocialActivity,
): Promise<void> {
  const feedEntry = {
    id: generateId(),
    userId: activity.userId,
    activityType: activity.activityType,
    visibility: activity.visibility,
    data: activity.data,
    createdAt: Date.now(),
  };
  Sentry.addBreadcrumb({
    category: "social-feed",
    message: `Creating feed entry for ${activity.activityType}`,
    level: "info",
    data: {
      userId: activity.userId,
      activityType: activity.activityType,
      visibility: activity.visibility,
      feedEntryId: feedEntry.id,
    },
  });
  await invalidateFeedCaches(activity);
}

export async function notifyRelevantUsers(
  activity: SocialActivity,
): Promise<void> {
  let targetUserIds: string[] = [];
  switch (activity.visibility) {
    case "FRIENDS":
      targetUserIds = await getFriendIds(activity.userId);
      break;
    case "SQUAD":
      targetUserIds = await getSquadMemberIds(activity.userId);
      break;
    case "PUBLIC":
      return;
  }
  for (const targetUserId of targetUserIds) {
    await sendPushNotification(targetUserId, {
      title: getNotificationTitle(activity),
      body: getNotificationBody(activity),
      data: { type: "SOCIAL_ACTIVITY", activityType: activity.activityType, actorId: activity.userId },
    });
  }
}

export async function awardCompetitionRewards(
  result: CompetitiveResult,
): Promise<void> {
  const rewards: Array<{ type: string; amount: number }> = [];
  if (result.rank === 1) {
    rewards.push({ type: "GEMS", amount: 100 });
    rewards.push({ type: "TITLE", amount: 1 });
  } else if (result.rank === 2) {
    rewards.push({ type: "GEMS", amount: 50 });
  } else if (result.rank === 3) {
    rewards.push({ type: "GEMS", amount: 25 });
  }
  const topTenPercent = Math.ceil(result.participants * 0.1);
  if (result.rank <= topTenPercent && result.rank > 3) {
    rewards.push({ type: "GEMS", amount: 10 });
  }
  for (const reward of rewards) {
    eventBus.publish("economy:grant_reward", {
      userId: result.userId,
      rewardType: reward.type,
      amount: reward.amount,
      source: "COMPETITION",
    });
  }
}

export async function completeSquadChallenge(
  challenge: SquadChallenge,
): Promise<void> {
  const memberIds = await getSquadMemberIds(challenge.squadId);
  for (const memberId of memberIds) {
    eventBus.publish("economy:grant_reward", {
      userId: memberId,
      rewardType: "COINS",
      amount: 500,
      source: "SQUAD_CHALLENGE",
    });
    await sendPushNotification(memberId, {
      title: "Squad Challenge Complete! 🎉",
      body: "Your squad completed the challenge and earned 500 coins each!",
      data: { type: "CHALLENGE_COMPLETE", challengeId: challenge.challengeId },
    });
  }
  eventBus.publish("social:activity", {
    userId: challenge.squadId,
    activityType: "SQUAD_CHALLENGE_COMPLETE",
    visibility: "PUBLIC",
    data: {
      challengeId: challenge.challengeId,
      type: challenge.type,
      contributors: challenge.contributors.length,
    },
  });
}

export async function invalidateFeedCaches(
  activity: SocialActivity,
): Promise<void> {
  Sentry.addBreadcrumb({
    category: "social-feed",
    message: "Invalidating feed caches",
    level: "info",
    data: { userId: activity.userId, visibility: activity.visibility, activityType: activity.activityType },
  });
}

export async function getFriendIds(_userId: string): Promise<string[]> {
  return [];
}

export async function getSquadMemberIds(
  squadIdOrUserId: string,
): Promise<string[]> {
  const squadId = squadIdOrUserId.startsWith("squad:")
    ? squadIdOrUserId
    : await getUserSquadId(squadIdOrUserId);
  return squadId ? [] : [];
}

export async function getUserSquadId(_userId: string): Promise<string | null> {
  return null;
}

export async function getRecentSessions(
  _userId: string,
  _timeWindowMs: number,
): Promise<Array<{ duration: number; qualityScore: number }>> {
  return [];
}

export async function sendPushNotification(
  userId: string,
  notification: { title: string; body: string; data: Record<string, unknown> },
): Promise<void> {
  Sentry.addBreadcrumb({
    category: "social-feed",
    message: `Queueing social push notification: ${notification.title}`,
    level: "info",
    data: { userId, notificationType: notification.data.type, activityType: notification.data.activityType },
  });
}

export async function updateEngagementMetrics(
  activity: SocialActivity,
): Promise<void> {
  Sentry.addBreadcrumb({
    category: "social-feed",
    message: "Updating engagement metrics",
    level: "info",
    data: { userId: activity.userId, activityType: activity.activityType },
  });
}

export function getNotificationTitle(activity: SocialActivity): string {
  const titles: Record<string, string> = {
    STREAK_MILESTONE: "🔥 Streak Milestone!",
    LEVEL_UP: "📈 Level Up!",
    BOSS_DEFEAT: "🏆 Boss Defeated!",
    PODIUM_FINISH: "🥇 Podium Finish!",
    RARE_ITEM_ACQUIRED: "✨ Rare Item!",
  };
  return titles[activity.activityType] || "New Activity";
}

export function getNotificationBody(activity: SocialActivity): string {
  switch (activity.activityType) {
    case "STREAK_MILESTONE":
      return `Reached a ${activity.data.streakDays}-day streak!`;
    case "LEVEL_UP":
      return `Leveled up to ${activity.data.level}!`;
    case "BOSS_DEFEAT":
      return `Defeated ${activity.data.bossName}!`;
    default:
      return "Check out the app for details!";
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
