import { getAnalyticsService } from '../../analytics/AnalyticsService';
import { addXpEnhanced } from '../../features/progression/service-enhanced';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import {
  XPSourceSchema,
  type LevelState,
  type LevelConfig,
  type XPSource,
  type XPAddedEvent,
} from '../schemas';
import type { XpSource as EnhancedXPSource } from '../../features/progression/schemas';

const debug = createDebugger('progression:xp');

interface XPQueueEntry {
  amount: number;
  source: XPSource;
  timestamp: number;
}

export interface EnhancedProgressionContext {
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

function mapLegacyXpSource(source: XPSource): EnhancedXPSource {
  const parsedSource = XPSourceSchema.safeParse(source);
  if (parsedSource.success) {
    return parsedSource.data as EnhancedXPSource;
  }
  switch (source) {
    case 'ACHIEVEMENT_BONUS': return 'ACHIEVEMENT_UNLOCK';
    case 'CHALLENGE_BONUS':
    case 'SOCIAL_BONUS':
    case 'EVENT_BONUS': return 'EVENT_PARTICIPATION' as EnhancedXPSource;
    case 'BOOST_BONUS': return 'PERFECT_SESSION_BONUS';
    case 'SEASON_BONUS': return 'MILESTONE_REWARD';
    case 'AI_COACH_BONUS': return 'AI_COACH_GOAL' as EnhancedXPSource;
    default: return 'SESSION_COMPLETE';
  }
}

export async function processXPEntry(
  entry: XPQueueEntry,
  state: LevelState,
  config: LevelConfig,
  userId: string,
  boostMultiplier: number,
): Promise<{ newState: LevelState; finalAmount: number; boostBonus: number }> {
  let finalAmount = entry.amount;
  let boostBonus = 0;

  if (config.softCapLevel && state.currentLevel >= config.softCapLevel) {
    finalAmount *= 1 - config.softCapPenalty;
    debug.debug('Applied soft cap penalty: %d XP -> %d XP', entry.amount, finalAmount);
  }

  const calculatedBoostBonus = Math.floor(finalAmount * (boostMultiplier - 1));
  finalAmount = Math.floor(finalAmount * boostMultiplier);
  boostBonus = calculatedBoostBonus;

  const newState = { ...state };
  newState.currentXP += finalAmount;
  newState.totalXP += finalAmount;

  while (newState.currentXP >= newState.xpToNextLevel) {
    newState.currentXP -= newState.xpToNextLevel;
    newState.currentLevel += 1;
    newState.xpToNextLevel = Math.floor(config.baseXP * Math.pow(config.growthFactor, newState.currentLevel - 1));
    newState.xpToNextLevel = Math.ceil(newState.xpToNextLevel / 100) * 100;
  }

  newState.progressPercent = Math.floor((newState.currentXP / newState.xpToNextLevel) * 100);

  const xpEvent: XPAddedEvent = {
    userId,
    amount: finalAmount,
    source: entry.source,
    totalXP: newState.totalXP,
    currentLevel: newState.currentLevel,
    progressPercent: newState.progressPercent,
    streakBonus: entry.source === 'STREAK_BONUS' ? finalAmount : 0,
    boostBonus,
  };

  eventBus.publish('progression:xp_added', xpEvent);

  const analytics = getAnalyticsService();
  analytics.track('xp_added', {
    user_id: userId,
    amount: finalAmount,
    source: entry.source,
    level: newState.currentLevel,
    prestige: newState.prestige,
  });

  debug.info('Added %d XP from %s (total: %d)', finalAmount, entry.source, newState.totalXP);

  return { newState, finalAmount, boostBonus };
}

export async function syncWithEnhancedService(
  userId: string,
  amount: number,
  source: XPSource,
  context: EnhancedProgressionContext = {},
): Promise<void> {
  const enhancedResult = await addXpEnhanced(
    userId,
    {
      userId,
      amount,
      source: mapLegacyXpSource(source),
      sessionId: context.sessionId,
      metadata: context.metadata,
    },
    { skipEvents: true },
  );
  if (!enhancedResult.success && !enhancedResult.offlineQueued) {
    debug.warn('Enhanced progression sync failed: %s', enhancedResult.error?.message ?? 'unknown');
  }
}
