import { eventBus } from '../events';
import * as Sentry from '@sentry/react-native';
import { createDebugger } from '../utils/debug';
import {
  trackSessionCompleted,
  trackBossEncounter,
  trackItemCrafted,
} from '../features/analytics/integration';
import { getAnalyticsService } from '../analytics/AnalyticsService';
const debug = createDebugger('integration:feature-wiring');
interface SessionCompletedEvent {
  sessionId: string;
  userId: string;
  summary: {
    duration: number;
    xpEarned: number;
    coinsEarned: number;
    streakDay: number;
    quality: number;
    bossActive: boolean;
    bossDamage?: number;
    itemsCrafted?: number;
    challengeIds?: string[];
    squadId?: string;
    guildId?: string;
  };
  timestamp: number;
  duration: number;
}
export function wireSessionIntegration(): () => void {
  const unsubscribe = eventBus.subscribe(
    'session:completed',
    async (rawEvent) => {
      const event = rawEvent as SessionCompletedEvent;
      debug.info(
        '[FeatureWiring] Session completed, triggering cross-system updates:',
        event.sessionId,
      );
      const s = event.summary;
      try {
        await trackSessionCompleted(event.userId, {
          sessionId: event.sessionId,
          duration: s.duration,
          xpEarned: s.xpEarned,
          quality: s.quality,
          streakDay: s.streakDay,
          bossActive: s.bossActive,
          bossDamage: s.bossDamage,
          itemsCrafted: s.itemsCrafted,
        });
        eventBus.publish('progression:xp_earned', {
          userId: event.userId,
          xp: s.xpEarned,
          source: 'session',
          sessionId: event.sessionId,
        });
        eventBus.publish('economy:grant', {
          userId: event.userId,
          currency: 'coins',
          amount: s.coinsEarned,
          source: 'session',
          sourceId: event.sessionId,
        });
        eventBus.publish('streak:session_completed', {
          userId: event.userId,
          streakDay: s.streakDay,
          sessionId: event.sessionId,
        });
        if (s.challengeIds && s.challengeIds.length > 0) {
          eventBus.publish('challenges:check_progress', {
            userId: event.userId,
            challengeIds: s.challengeIds,
            progress: {
              sessionsCompleted: 1,
              duration: s.duration,
              xpEarned: s.xpEarned,
            },
          });
        }
        if (s.squadId) {
          eventBus.publish('social:squad_activity', {
            userId: event.userId,
            squadId: s.squadId,
            activity: {
              type: 'session_completed',
              duration: s.duration,
              xpEarned: s.xpEarned,
            },
          });
        }
        if (s.guildId) {
          eventBus.publish('social:guild_activity', {
            userId: event.userId,
            guildId: s.guildId,
            activity: {
              type: 'session_completed',
              duration: s.duration,
              xpEarned: s.xpEarned,
            },
          });
        }
        eventBus.publish('season:check_objectives', {
          userId: event.userId,
          eventType: 'session_completed',
          data: { duration: s.duration, xpEarned: s.xpEarned },
        });
        eventBus.publish('notification:send', {
          userId: event.userId,
          type: 'session_complete',
          title: 'Session Complete!',
          body: `You earned ${s.xpEarned} XP and ${s.coinsEarned} coins`,
          data: { sessionId: event.sessionId },
        });
        eventBus.publish('coach:session_feedback', {
          userId: event.userId,
          sessionId: event.sessionId,
          duration: s.duration,
          quality: s.quality,
          streakDay: s.streakDay,
        });
        Sentry.addBreadcrumb({
          category: 'feature_wiring',
          message: 'Session completion wired to all systems',
          level: 'info',
          data: {
            userId: event.userId,
            sessionId: event.sessionId,
            xpEarned: s.xpEarned,
            coinsEarned: s.coinsEarned,
          },
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: 'session_wiring' },
          extra: { event },
        });
      }
    },
  );
  return unsubscribe;
}
interface EconomyTransactionEvent {
  userId: string;
  currency: string;
  amount: number;
  type: 'earn' | 'spend';
  source: string;
  itemId?: string;
}
export function wireEconomyIntegration(): () => void {
  const unsubscribe = eventBus.subscribe(
    'economy:transaction',
    async (rawEvent) => {
      const event = rawEvent as EconomyTransactionEvent;
      try {
        eventBus.publish('progression:economy_activity', {
          userId: event.userId,
          currency: event.currency,
          amount: event.amount,
          type: event.type,
          source: event.source,
        });
        eventBus.publish('challenges:check_economy', {
          userId: event.userId,
          currency: event.currency,
          amount: event.amount,
          type: event.type,
        });
        eventBus.publish('season:currency_earned', {
          userId: event.userId,
          currency: event.currency,
          amount: event.type === 'earn' ? event.amount : -event.amount,
        });
        eventBus.publish('analytics:economy_event', {
          userId: event.userId,
          currency: event.currency,
          amount: event.amount,
          type: event.type,
          source: event.source,
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: 'economy_wiring' },
          extra: { event },
        });
      }
    },
  );
  return unsubscribe;
}
interface SocialActivityEvent {
  userId: string;
  activityType: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'SQUAD' | 'PUBLIC';
  data: Record<string, unknown>;
}
export function wireSocialIntegration(): () => void {
  const unsubscribe = eventBus.subscribe(
    'social:activity',
    async (rawEvent) => {
      const event = rawEvent as SocialActivityEvent;
      try {
        const activityType = event.activityType;
        const data = event.data;
        switch (activityType) {
          case 'challenge_invite':
            const targetUserId = data.targetUserId as string;
            const challengeId = data.challengeId as string;
            if (targetUserId && challengeId) {
              eventBus.publish('notification:send', {
                userId: targetUserId,
                type: 'challenge_invite',
                title: 'New Challenge!',
                body: 'Someone invited you to a challenge',
                data: { challengeId, fromUserId: event.userId },
              });
            }
            break;
          case 'duel_challenge':
            const duelTargetId = data.targetUserId as string;
            const duelId = data.duelId as string;
            if (duelTargetId && duelId) {
              eventBus.publish('notification:send', {
                userId: duelTargetId,
                type: 'duel_challenge',
                title: 'Duel Challenge!',
                body: 'Someone challenged you to a duel',
                data: { duelId, fromUserId: event.userId },
              });
            }
            break;
          case 'squad_join':
            const squadId = data.squadId as string;
            if (squadId) {
              eventBus.publish('squad:member_joined', {
                userId: event.userId,
                squadId,
                role: 'member',
              });
            }
            break;
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: 'social_wiring' },
          extra: { event },
        });
      }
    },
  );
  return unsubscribe;
}
interface BossDefeatedEvent {
  userId: string;
  bossId: string;
  damageDealt: number;
  won: boolean;
  rewards: { xp: number; coins: number; items?: string[] };
  participants?: string[];
}
export function wireBossIntegration(): () => void {
  const unsubscribe = eventBus.subscribe(
    'boss:defeated',
    async (event: BossDefeatedEvent) => {
      try {
        await trackBossEncounter(event.userId, {
          bossId: event.bossId,
          damageDealt: event.damageDealt,
          won: event.won,
          duration: 0,
        });
        if (event.won) {
          eventBus.publish('economy:grant', {
            userId: event.userId,
            currency: 'coins',
            amount: event.rewards.coins,
            source: 'boss_defeat',
            sourceId: event.bossId,
          });
          eventBus.publish('progression:xp_earned', {
            userId: event.userId,
            xp: event.rewards.xp,
            source: 'boss',
            bossId: event.bossId,
          });
          if (event.rewards.items) {
            for (const itemId of event.rewards.items) {
              eventBus.publish('inventory:add_item', {
                userId: event.userId,
                itemId,
                rarity: 'rare',
                source: 'boss_drop',
              });
            }
          }
          eventBus.publish('social:feed_post', {
            userId: event.userId,
            type: 'boss_defeated',
            content: `Defeated ${event.bossId}!`,
            metadata: { bossId: event.bossId, damage: event.damageDealt },
          });
          if (event.participants) {
            for (const participantId of event.participants) {
              if (participantId !== event.userId) {
                eventBus.publish('notification:send', {
                  userId: participantId,
                  type: 'boss_defeated_team',
                  title: 'Boss Defeated!',
                  body: 'Your squad defeated the boss!',
                  data: { bossId: event.bossId },
                });
              }
            }
          }
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: 'boss_wiring' },
          extra: { event },
        });
      }
    },
  );
  return unsubscribe;
}
interface ItemCraftedEvent {
  userId: string;
  itemId: string;
  itemType: string;
  rarity: string;
  materialsUsed: Record<string, number>;
  coinsSpent: number;
}
export function wireCraftingIntegration(): () => void {
  const unsubscribe = eventBus.subscribe(
    'crafting:item_crafted',
    async (event: ItemCraftedEvent) => {
      try {
        await trackItemCrafted(event.userId, {
          itemId: event.itemId,
          rarity: event.rarity,
          coinsSpent: event.coinsSpent,
        });
        eventBus.publish('challenges:check_crafting', {
          userId: event.userId,
          itemType: event.itemType,
          rarity: event.rarity,
        });
        eventBus.publish('achievements:check', {
          userId: event.userId,
          type: 'crafting',
          data: { itemRarity: event.rarity, itemType: event.itemType },
        });
        if (['epic', 'legendary'].includes(event.rarity)) {
          eventBus.publish('social:feed_post', {
            userId: event.userId,
            type: 'rare_craft',
            content: `Crafted a ${event.rarity} item!`,
            metadata: { itemId: event.itemId, rarity: event.rarity },
          });
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: 'crafting_wiring' },
          extra: { event },
        });
      }
    },
  );
  return unsubscribe;
}
interface CoachTriggerEvent {
  userId: string;
  trigger: string;
  data?: Record<string, unknown>;
}
export function wireCoachIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('coach:trigger', async (rawEvent) => {
    const event = rawEvent as CoachTriggerEvent;
    try {
      switch (event.trigger) {
        case 'streak_at_risk':
          eventBus.publish('notification:send', {
            userId: event.userId,
            type: 'streak_reminder',
            title: 'Streak in Danger!',
            body: 'Complete a session today to keep your streak alive',
            data: { urgency: 'high' },
          });
          break;
        case 'session_abandoned':
          eventBus.publish('notification:send', {
            userId: event.userId,
            type: 'encouragement',
            title: 'Come Back When Ready',
            body: 'Every session counts, no matter how short. Ready to try again?',
            data: { type: 'abandoned_session' },
          });
          break;
        case 'comeback_opportunity':
          eventBus.publish('notification:send', {
            userId: event.userId,
            type: 'welcome_back',
            title: 'Welcome Back!',
            body: 'We missed you! Ready to start a new streak?',
            data: { type: 'comeback' },
          });
          break;
        case 'challenge_reminder':
          if (event.data?.challengeId) {
            eventBus.publish('notification:send', {
              userId: event.userId,
              type: 'challenge_reminder',
              title: 'Challenge Ending Soon!',
              body: "Don't forget to complete your active challenges",
              data: { challengeId: event.data.challengeId },
            });
          }
          break;
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { integration: 'coach_wiring' },
        extra: { event },
      });
    }
  });
  return unsubscribe;
}
interface LevelUpEvent {
  userId: string;
  newLevel: number;
  previousLevel: number;
  rewards: string[];
  unlockedFeatures?: string[];
}
export function wireProgressionIntegration(): () => void {
  const unsubscribe = eventBus.subscribe(
    'progression:level_up',
    async (rawEvent) => {
      const event = rawEvent as LevelUpEvent;
      try {
        eventBus.publish('economy:grant', {
          userId: event.userId,
          currency: 'coins',
          amount: event.newLevel * 100,
          source: 'level_up',
          sourceId: `level_${event.newLevel}`,
        });
        eventBus.publish('notification:send', {
          userId: event.userId,
          type: 'level_up',
          title: `Level ${event.newLevel}!`,
          body: `Congratulations! You've reached level ${event.newLevel}`,
          data: {
            newLevel: event.newLevel,
            rewards: event.rewards,
            unlockedFeatures: event.unlockedFeatures,
          },
        });
        eventBus.publish('social:feed_post', {
          userId: event.userId,
          type: 'level_up',
          content: `Reached level ${event.newLevel}!`,
          metadata: { level: event.newLevel },
        });
        eventBus.publish('challenges:check_level', {
          userId: event.userId,
          level: event.newLevel,
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { integration: 'progression_wiring' },
          extra: { event },
        });
      }
    },
  );
  return unsubscribe;
}
export function initializeFeatureWiring(): () => void {
  debug.info('Initializing cross-system integrations');
  const cleanups = [
    wireSessionIntegration(),
    wireEconomyIntegration(),
    wireSocialIntegration(),
    wireCoachIntegration(),
    wireProgressionIntegration(),
    wireBossIntegration(),
    wireCraftingIntegration(),
    wireStreakIntegration(),
  ];
  debug.info('All integrations wired');
  return () => {
    debug.info('Cleaning up integrations');
    cleanups.forEach((cleanup) => cleanup());
  };
}
interface StreakBrokenEvent {
  userId: string;
  previousStreak: number;
  wasComeback: boolean;
  diedAt?: number;
}
export function wireStreakIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('streak:broken', async (rawEvent) => {
    const event = rawEvent as StreakBrokenEvent;
    debug.info('Streak broken, preparing funeral flow: %s', event.userId);
    try {
      const analytics = getAnalyticsService();
      analytics.track('streak_broken', {
        user_id: event.userId,
        previous_streak: event.previousStreak,
        was_comeback: event.wasComeback,
        died_at: event.diedAt,
      });
      eventBus.publish('streak:funeral_ready', {
        userId: event.userId,
        previousStreak: event.previousStreak,
        diedAt: event.diedAt ?? Date.now(),
      });
      Sentry.addBreadcrumb({
        category: 'feature_wiring',
        message: 'Streak broken - funeral flow triggered',
        level: 'info',
        data: { userId: event.userId, previousStreak: event.previousStreak },
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { integration: 'streak_wiring' },
        extra: { event },
      });
    }
  });
  return unsubscribe;
}
