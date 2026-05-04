/**
 * Social Systems Cross-Integration
 * Wires social features to sessions, competitive results, challenges, feed, and notifications
 */

import { eventBus } from '../../events/EventBus';
import * as Sentry from '@sentry/react-native';

interface SocialActivity {
  userId: string;
  activityType: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'SQUAD' | 'PUBLIC';
  data: Record<string, unknown>;
}

interface CompetitiveResult {
  userId: string;
  leaderboardId: string;
  rank: number;
  score: number;
  previousRank?: number;
  participants: number;
}

interface SquadChallenge {
  squadId: string;
  challengeId: string;
  type: string;
  progress: number;
  target: number;
  contributors: Array<{ userId: string; contribution: number }>;
}

/**
 * Initialize social systems integration
 */
export function initializeSocialFeedIntegration(): () => void {
  const handlers: Array<() => void> = [];

  // Handle social activities
  handlers.push(
    eventBus.subscribe('social:activity', async (event: SocialActivity) => {
      if (!event || !event.userId) {return;}

      try {
        // 1. Create feed entry
        await createFeedEntry(event);

        // 2. Notify relevant users
        await notifyRelevantUsers(event);

        // 3. Update engagement metrics
        await updateEngagementMetrics(event);

        Sentry.addBreadcrumb({
          category: 'social:activity',
          message: `Activity: ${event.activityType}`,
          data: {
            userId: event.userId,
            activityType: event.activityType,
            visibility: event.visibility,
          },
          level: 'info',
        });

      } catch (error) {
        Sentry.captureException(error, {
          tags: { operation: 'social:activity' },
          extra: {
            userId: event.userId,
            activityType: event.activityType,
            visibility: event.visibility,
          },
        });
      }
    })
  );

  // Handle competitive results
  handlers.push(
    eventBus.subscribe('leaderboards:result', async (event: CompetitiveResult) => {
      if (!event || !event.userId) {return;}

      try {
        // 1. Create social post for rank achievements
        if (event.rank <= 3) {
          eventBus.publish('social:activity', {
            userId: event.userId,
            activityType: 'PODIUM_FINISH',
            visibility: 'PUBLIC',
            data: {
              leaderboardId: event.leaderboardId,
              rank: event.rank,
              score: event.score,
              totalParticipants: event.participants,
            },
          });
        }

        // 2. Send push notification for rank changes
        if (event.previousRank && event.rank < event.previousRank) {
          await sendPushNotification(event.userId, {
            title: 'Rank Up! 🏆',
            body: `You climbed from #${event.previousRank} to #${event.rank}!`,
            data: {
              type: 'RANK_UP',
              leaderboardId: event.leaderboardId,
            },
          });
        }

        // 3. Award competition rewards
        await awardCompetitionRewards(event);

        // 4. Update squad standings if squad leaderboard
        if (event.leaderboardId.startsWith('squad:')) {
          eventBus.publish('squads:leaderboard_update', {
            squadId: event.leaderboardId.split(':')[1],
            leaderboardType: 'squad',
            userId: event.userId,
            score: event.score,
          });
        }

      } catch (error) {
        Sentry.captureException(error, {
          tags: { operation: 'leaderboards:result' },
          extra: {
            userId: event.userId,
            leaderboardId: event.leaderboardId,
            rank: event.rank,
            score: event.score,
          },
        });
      }
    })
  );

  // Handle squad challenges
  handlers.push(
    eventBus.subscribe('squads:challenge_update', async (event: SquadChallenge) => {
      if (!event || !event.squadId) {return;}

      try {
        const progressPercent = event.target > 0 ? (event.progress / event.target) * 100 : 0;

        // 1. Broadcast progress to squad
        eventBus.publish('notifications:squad_broadcast', {
          squadId: event.squadId,
          type: 'CHALLENGE_PROGRESS',
          data: {
            challengeId: event.challengeId,
            progress: event.progress,
            target: event.target,
            percentComplete: Math.floor(progressPercent),
          },
        });

        // 2. Check for completion
        if (event.progress >= event.target) {
          // Challenge complete!
          await completeSquadChallenge(event);
        }

        // 3. Individual contributor notifications
        const topContributor = event.contributors[0];
        if (topContributor && event.contributors.length > 1) {
          await sendPushNotification(topContributor.userId, {
            title: 'Top Contributor! 🌟',
            body: `You're leading the squad challenge with ${topContributor.contribution} points!`,
            data: {
              type: 'TOP_CONTRIBUTOR',
              challengeId: event.challengeId,
            },
          });
        }

      } catch (error) {
        Sentry.captureException(error, {
          tags: { operation: 'squads:challenge_update' },
          extra: {
            squadId: event.squadId,
            challengeId: event.challengeId,
            progress: event.progress,
            target: event.target,
          },
        });
      }
    })
  );

  // Handle session completions (feed aggregation)
  handlers.push(
    eventBus.subscribe('sessions:completed', async (event) => {
      if (!event || !event.userId) {return;}

      // Aggregate similar sessions for feed efficiency
      const recentSessions = await getRecentSessions(event.userId, 3600000); // 1 hour

      if (recentSessions.length >= 3) {
        // Create aggregated feed entry instead of individual
        eventBus.publish('social:activity', {
          userId: event.userId,
          activityType: 'SESSION_STREAK',
          visibility: 'FRIENDS',
          data: {
            sessionCount: recentSessions.length,
            totalDuration: recentSessions.reduce((sum, s) => sum + s.duration, 0),
            averageQuality: recentSessions.reduce((sum, s) => sum + s.qualityScore, 0) / recentSessions.length,
          },
        });
      }
    })
  );

  return () => handlers.forEach(unsub => unsub());
}

// ============================================================================
// Helper Functions
// ============================================================================

async function createFeedEntry(activity: SocialActivity): Promise<void> {
  // Create feed entry with visibility filtering
  const feedEntry = {
    id: generateId(),
    userId: activity.userId,
    activityType: activity.activityType,
    visibility: activity.visibility,
    data: activity.data,
    createdAt: Date.now(),
  };

  // Persist to feed store
  Sentry.addBreadcrumb({
    category: 'social-feed',
    message: `Creating feed entry for ${activity.activityType}`,
    level: 'info',
    data: {
      userId: activity.userId,
      activityType: activity.activityType,
      visibility: activity.visibility,
      feedEntryId: feedEntry.id,
    },
  });

  // Invalidate feed caches for affected users
  await invalidateFeedCaches(activity);
}

async function notifyRelevantUsers(activity: SocialActivity): Promise<void> {
  let targetUserIds: string[] = [];

  switch (activity.visibility) {
    case 'FRIENDS':
      targetUserIds = await getFriendIds(activity.userId);
      break;
    case 'SQUAD':
      targetUserIds = await getSquadMemberIds(activity.userId);
      break;
    case 'PUBLIC':
      // Public posts don't notify, they appear in discovery
      return;
  }

  // Send notifications in batch
  for (const targetUserId of targetUserIds) {
    await sendPushNotification(targetUserId, {
      title: getNotificationTitle(activity),
      body: getNotificationBody(activity),
      data: {
        type: 'SOCIAL_ACTIVITY',
        activityType: activity.activityType,
        actorId: activity.userId,
      },
    });
  }
}

async function awardCompetitionRewards(result: CompetitiveResult): Promise<void> {
  // Award based on rank
  const rewards = [];

  if (result.rank === 1) {
    rewards.push({ type: 'GEMS', amount: 100 });
      rewards.push({ type: 'TITLE', amount: 1, itemId: 'champion' });
  } else if (result.rank === 2) {
    rewards.push({ type: 'GEMS', amount: 50 });
  } else if (result.rank === 3) {
    rewards.push({ type: 'GEMS', amount: 25 });
  }

  // Top 10% get participation gems
  const topTenPercent = Math.ceil(result.participants * 0.1);
  if (result.rank <= topTenPercent && result.rank > 3) {
    rewards.push({ type: 'GEMS', amount: 10 });
  }

  // Grant rewards
  for (const reward of rewards) {
    eventBus.publish('economy:grant_reward', {
      userId: result.userId,
      rewardType: reward.type,
      amount: reward.amount,
      source: 'COMPETITION',
    });
  }
}

async function completeSquadChallenge(challenge: SquadChallenge): Promise<void> {
  // Award all squad members
  const memberIds = await getSquadMemberIds(challenge.squadId);

  for (const memberId of memberIds) {
    eventBus.publish('economy:grant_reward', {
      userId: memberId,
      rewardType: 'COINS',
      amount: 500,
      source: 'SQUAD_CHALLENGE',
    });

    await sendPushNotification(memberId, {
      title: 'Squad Challenge Complete! 🎉',
      body: 'Your squad completed the challenge and earned 500 coins each!',
      data: {
        type: 'CHALLENGE_COMPLETE',
        challengeId: challenge.challengeId,
      },
    });
  }

  // Social post
  eventBus.publish('social:activity', {
    userId: challenge.squadId,
    activityType: 'SQUAD_CHALLENGE_COMPLETE',
    visibility: 'PUBLIC',
    data: {
      challengeId: challenge.challengeId,
      type: challenge.type,
      contributors: challenge.contributors.length,
    },
  });
}

async function invalidateFeedCaches(activity: SocialActivity): Promise<void> {
  // Invalidate feed caches for affected users
  Sentry.addBreadcrumb({
    category: 'social-feed',
    message: 'Invalidating feed caches',
    level: 'info',
    data: {
      userId: activity.userId,
      visibility: activity.visibility,
      activityType: activity.activityType,
    },
  });
}

async function getFriendIds(userId: string): Promise<string[]> {
  // Fetch friend IDs from social graph
  return [];
}

async function getSquadMemberIds(squadIdOrUserId: string): Promise<string[]> {
  // If starts with 'squad:', treat as squad ID, else get user's squad
  const squadId = squadIdOrUserId.startsWith('squad:')
    ? squadIdOrUserId
    : await getUserSquadId(squadIdOrUserId);

  if (!squadId) {return [];}

  // Fetch squad member IDs
  return [];
}

async function getUserSquadId(userId: string): Promise<string | null> {
  return null;
}

async function getRecentSessions(userId: string, timeWindowMs: number): Promise<Array<{ duration: number; qualityScore: number }>> {
  // Fetch recent sessions
  return [];
}

async function sendPushNotification(userId: string, notification: { title: string; body: string; data: Record<string, unknown> }): Promise<void> {
  // Send push notification
  Sentry.addBreadcrumb({
    category: 'social-feed',
    message: `Queueing social push notification: ${notification.title}`,
    level: 'info',
    data: {
      userId,
      notificationType: notification.data.type,
      activityType: notification.data.activityType,
    },
  });
}

async function updateEngagementMetrics(activity: SocialActivity): Promise<void> {
  // Update user engagement score
  Sentry.addBreadcrumb({
    category: 'social-feed',
    message: 'Updating engagement metrics',
    level: 'info',
    data: {
      userId: activity.userId,
      activityType: activity.activityType,
    },
  });
}

function getNotificationTitle(activity: SocialActivity): string {
  const titles: Record<string, string> = {
    'STREAK_MILESTONE': '🔥 Streak Milestone!',
    'LEVEL_UP': '📈 Level Up!',
    'BOSS_DEFEAT': '🏆 Boss Defeated!',
    'PODIUM_FINISH': '🥇 Podium Finish!',
    'RARE_ITEM_ACQUIRED': '✨ Rare Item!',
  };
  return titles[activity.activityType] || 'New Activity';
}

function getNotificationBody(activity: SocialActivity): string {
  switch (activity.activityType) {
    case 'STREAK_MILESTONE':
      return `Reached a ${activity.data.streakDays}-day streak!`;
    case 'LEVEL_UP':
      return `Leveled up to ${activity.data.level}!`;
    case 'BOSS_DEFEAT':
      return `Defeated ${activity.data.bossName}!`;
    default:
      return 'Check out the app for details!';
  }
}

function generateId(): string {
  return crypto.randomUUID();
}
