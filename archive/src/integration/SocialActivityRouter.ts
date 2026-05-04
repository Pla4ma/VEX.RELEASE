/**
 * Social Activity Router
 *
 * Routes activities from all systems to appropriate social destinations:
 * - Feed posts
 * - Squad updates
 * - Guild broadcasts
 * - Notifications
 */

import { eventBus } from '../events';
import { debug } from '../utils/debug';

interface ActivityContext {
  userId: string;
  type: string;
  data: Record<string, unknown>;
  privacy: 'PUBLIC' | 'FRIENDS' | 'SQUAD' | 'GUILD' | 'PRIVATE';
  squadId?: string;
  guildId?: string;
}

/**
 * Route activity to appropriate social channels
 */
export async function routeActivity(context: ActivityContext): Promise<{
  squadNotified: boolean;
  guildNotified: boolean;
  notificationsSent: number;
}> {
  const result = {
    feedPosted: false,
    squadNotified: false,
    guildNotified: false,
    notificationsSent: 0,
  };

  // Determine routing based on privacy and context
  const routes = determineRoutes(context);

  // Post to feed if public or friends
  if (routes.includes('FEED')) {
    await postToFeed(context);
    result.feedPosted = true;
  }

  // Notify squad
  if (routes.includes('SQUAD') && context.squadId) {
    await notifySquad(context);
    result.squadNotified = true;
  }

  // Notify guild
  if (routes.includes('GUILD') && context.guildId) {
    await notifyGuild(context);
    result.guildNotified = true;
  }

  // Send targeted notifications
  if (routes.includes('NOTIFICATIONS')) {
    result.notificationsSent = await sendNotifications(context);
  }

  return result;
}

/**
 * Route session completion to all relevant systems
 */
export async function routeSessionActivity(
  userId: string,
  sessionData: {
    duration: number;
    xpGained: number;
    category: string;
    streakDay: number;
    squadId?: string;
    guildId?: string;
    isPersonalBest?: boolean;
  },
): Promise<void> {
  // Base feed post
  if (sessionData.duration >= 300) {
    // 5+ minutes
    await routeActivity({
      userId,
      type: 'SESSION_COMPLETE',
      data: {
        duration: sessionData.duration,
        xpGained: sessionData.xpGained,
        category: sessionData.category,
      },
      privacy: 'FRIENDS',
      squadId: sessionData.squadId,
      guildId: sessionData.guildId,
    });
  }

  // Streak milestone
  if (sessionData.streakDay > 0 && sessionData.streakDay % 7 === 0) {
    await routeActivity({
      userId,
      type: 'STREAK_MILESTONE',
      data: { streak: sessionData.streakDay },
      privacy: 'PUBLIC',
    });
  }

  // Personal best
  if (sessionData.isPersonalBest) {
    await routeActivity({
      userId,
      type: 'PERSONAL_BEST',
      data: { category: sessionData.category, duration: sessionData.duration },
      privacy: 'PUBLIC',
    });
  }

  // Squad contribution
  if (sessionData.squadId) {
    eventBus.publish('squad:session_completed', {
      squadId: sessionData.squadId,
      userId,
      duration: sessionData.duration,
      xpContributed: Math.floor(sessionData.xpGained * 0.1),
    });
  }

  // Guild contribution
  if (sessionData.guildId) {
    eventBus.publish('guild:contribution', {
      guildId: sessionData.guildId,
      userId,
      points: Math.floor(sessionData.duration / 60),
      source: 'session',
    });
  }
}

/**
 * Route duel results
 */
export async function routeDuelActivity(duelData: {
  winnerId: string;
  loserId: string;
  winnerRating: number;
  loserRating: number;
  ratingChange: number;
  tierChanged: boolean;
  newTier?: string;
}): Promise<void> {
  // Winner's feed post
  await routeActivity({
    userId: duelData.winnerId,
    type: 'DUEL_WON',
    data: {
      ratingGained: duelData.ratingChange,
      tierAchieved: duelData.tierChanged ? duelData.newTier : undefined,
    },
    privacy: 'PUBLIC',
  });

  // Tier change announcement (if applicable)
  if (duelData.tierChanged && duelData.newTier) {
    await routeActivity({
      userId: duelData.winnerId,
      type: 'TIER_PROMOTION',
      data: { tier: duelData.newTier },
      privacy: 'PUBLIC',
    });
  }

  // Notifications to both players
  eventBus.publish('notification:receive', {
    id: `duel-result-${Date.now()}`,
    type: 'DUEL_COMPLETE',
    data: {
      winnerId: duelData.winnerId,
      ratingChange: duelData.ratingChange,
    },
  });
}

/**
 * Route progression events
 */
export async function routeProgressionActivity(
  userId: string,
  event: {
    type: 'LEVEL_UP' | 'PRESTIGE' | 'ACHIEVEMENT' | 'MILESTONE';
    data: Record<string, unknown>;
  },
): Promise<void> {
  const privacyMap: Record<string, 'PUBLIC' | 'FRIENDS'> = {
    LEVEL_UP: 'FRIENDS',
    PRESTIGE: 'PUBLIC',
    ACHIEVEMENT: 'PUBLIC',
    MILESTONE: 'FRIENDS',
  };

  await routeActivity({
    userId,
    type: event.type,
    data: event.data,
    privacy: privacyMap[event.type],
  });

  // Special handling for prestige
  if (event.type === 'PRESTIGE') {
    // Global announcement
    eventBus.publish('feed:item_created', {
      userId,
      type: 'GLOBAL_EVENT',
      content: `${userId} has achieved Prestige!`,
      visibility: 'GLOBAL',
    });
  }
}

/**
 * Route challenge completions
 */
export async function routeChallengeActivity(
  userId: string,
  challengeData: {
    challengeId: string;
    name: string;
    difficulty: string;
    reward: { xp: number; currency?: { type: string; amount: number } };
    isDaily?: boolean;
    isWeekly?: boolean;
  },
): Promise<void> {
  await routeActivity({
    userId,
    type: 'CHALLENGE_COMPLETED',
    data: {
      name: challengeData.name,
      difficulty: challengeData.difficulty,
      xpReward: challengeData.reward.xp,
    },
    privacy: challengeData.isWeekly ? 'PUBLIC' : 'FRIENDS',
  });

  // Weekly challenges get extra visibility
  if (challengeData.isWeekly) {
    eventBus.publish('challenge:weekly_completed', {
      userId,
      challengeId: challengeData.challengeId,
      completedAt: Date.now(),
    });
  }
}

// Helper functions
function determineRoutes(context: ActivityContext): string[] {
  const routes: string[] = [];

  switch (context.privacy) {
    case 'PUBLIC':
      routes.push('FEED', 'NOTIFICATIONS');
      break;
    case 'FRIENDS':
      routes.push('FEED', 'NOTIFICATIONS');
      break;
    case 'SQUAD':
      routes.push('SQUAD');
      if (context.squadId) {routes.push('NOTIFICATIONS');}
      break;
    case 'GUILD':
      routes.push('GUILD');
      if (context.guildId) {routes.push('NOTIFICATIONS');}
      break;
  }

  return routes;
}

// Note: Feed integration removed for simplified launch
async function postToFeed(_context: ActivityContext): Promise<void> {
  // Feed feature deleted - function kept for compatibility
  debug.info('Feed post skipped - feature removed for launch');
}

async function notifySquad(context: ActivityContext): Promise<void> {
  if (!context.squadId) {return;}

  eventBus.publish('squad:activity', {
    squadId: context.squadId,
    userId: context.userId,
    activityType: context.type,
    data: context.data,
  });
}

async function notifyGuild(context: ActivityContext): Promise<void> {
  if (!context.guildId) {return;}

  eventBus.publish('guild:activity', {
    guildId: context.guildId,
    userId: context.userId,
    activityType: context.type,
    data: context.data,
  });
}

async function sendNotifications(context: ActivityContext): Promise<number> {
  // Determine notification recipients based on privacy
  let recipientCount = 0;

  switch (context.privacy) {
    case 'PUBLIC':
    case 'FRIENDS':
      // Notify friends
      recipientCount = await notifyFriends(context.userId, context);
      break;
    case 'SQUAD':
      // Notify squad members
      if (context.squadId) {
        recipientCount = await notifySquadMembers(context.squadId, context);
      }
      break;
    case 'GUILD':
      // Notify guild members
      if (context.guildId) {
        recipientCount = await notifyGuildMembers(context.guildId, context);
      }
      break;
  }

  return recipientCount;
}

function generateFeedContent(context: ActivityContext): string {
  const templates: Record<string, string> = {
    SESSION_COMPLETE: `Completed a ${Math.floor(((context.data.duration as number) || 0) / 60)}-minute focus session`,
    LEVEL_UP: `Reached Level ${context.data.newLevel}! 🎉`,
    DUEL_WON: `Won a duel and gained ${context.data.ratingGained} rating points!`,
    STREAK_MILESTONE: `${context.data.streak}-day streak! 🔥`,
    CHALLENGE_COMPLETED: `Completed the "${context.data.name}" challenge`,
    TIER_PROMOTION: `Promoted to ${context.data.tier}! 🏆`,
  };

  return templates[context.type] || `Activity: ${context.type}`;
}

async function notifyFriends(
  userId: string,
  context: ActivityContext,
): Promise<number> {
  // Query friends list and send notifications
  return 0;
}

async function notifySquadMembers(
  squadId: string,
  context: ActivityContext,
): Promise<number> {
  // Query squad members and send notifications
  return 0;
}

async function notifyGuildMembers(
  guildId: string,
  context: ActivityContext,
): Promise<number> {
  // Query guild members and send notifications
  return 0;
}
