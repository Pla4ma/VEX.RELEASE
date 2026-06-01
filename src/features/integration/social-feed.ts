import { eventBus } from '../../events/EventBus';
import * as Sentry from '@sentry/react-native';
import type { SocialActivity, CompetitiveResult, SquadChallenge } from './social-feed-types';
import {
  createFeedEntry,
  notifyRelevantUsers,
  updateEngagementMetrics,
  awardCompetitionRewards,
  sendPushNotification,
  completeSquadChallenge,
  getRecentSessions,
  getSquadMemberIds,
} from './social-feed-helpers';

export { getNotificationTitle, getNotificationBody, generateId } from './social-feed-helpers';
export type { SocialActivity, CompetitiveResult, SquadChallenge } from './social-feed-types';

export function initializeSocialFeedIntegration(): () => void {
  const handlers: Array<() => void> = [];

  handlers.push(
    eventBus.subscribe('social:activity', async (event: SocialActivity) => {
      if (!event || !event.userId) {
        return;
      }
      try {
        await createFeedEntry(event);
        await notifyRelevantUsers(event);
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
    }),
  );

  handlers.push(
    eventBus.subscribe('leaderboards:result', async (rawData) => {
      const event = rawData as CompetitiveResult;
      if (!event || !event.userId) {
        return;
      }
      try {
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
        if (event.previousRank && event.rank < event.previousRank) {
          await sendPushNotification(event.userId, {
            title: 'Rank Up! 🏆',
            body: `You climbed from #${event.previousRank} to #${event.rank}!`,
            data: { type: 'RANK_UP', leaderboardId: event.leaderboardId },
          });
        }
        await awardCompetitionRewards(event);
        if (event.leaderboardId.startsWith('squad:')) {
          eventBus.publish('squads:leaderboard_update', {
            squadId: event.leaderboardId.split(':')[1]!,
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
    }),
  );

  handlers.push(
    eventBus.subscribe(
      'squads:challenge_update',
      async (event: SquadChallenge) => {
        if (!event || !event.squadId) {
          return;
        }
        try {
          const progressPercent =
            event.target > 0 ? (event.progress / event.target) * 100 : 0;
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
          if (event.progress >= event.target) {
            await completeSquadChallenge(event);
          }
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
      },
    ),
  );

  handlers.push(
    eventBus.subscribe('sessions:completed', async (event) => {
      if (!event || !event.userId) {
        return;
      }
      const recentSessions = await getRecentSessions(event.userId, 3600000);
      if (recentSessions.length >= 3) {
        eventBus.publish('social:activity', {
          userId: event.userId,
          activityType: 'SESSION_STREAK',
          visibility: 'FRIENDS',
          data: {
            sessionCount: recentSessions.length,
            totalDuration: recentSessions.reduce(
              (sum, s) => sum + s.duration,
              0,
            ),
            averageQuality:
              recentSessions.reduce((sum, s) => sum + s.qualityScore, 0) /
              recentSessions.length,
          },
        });
      }
    }),
  );

  return () => handlers.forEach((unsub) => unsub());
}
