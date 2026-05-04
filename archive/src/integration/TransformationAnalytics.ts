/**
 * Transformation Analytics
 *
 * Analytics hooks for all transformation systems
 * Tracks user behavior, system performance, and feature adoption
 */

import { eventBus } from '../events';

// Analytics providers
interface AnalyticsProvider {
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
}

let analyticsProvider: AnalyticsProvider | null = null;

export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  analyticsProvider = provider;
}

function track(event: string, properties?: Record<string, unknown>): void {
  analyticsProvider?.track(event, properties);
  // Also log for debugging
  console.log(`[Analytics] ${event}`, properties);
}

function identify(userId: string, traits?: Record<string, unknown>): void {
  analyticsProvider?.identify(userId, traits);
}

// ============================================================================
// Phase 5: Retention Analytics
// ============================================================================

export function trackCreatureEvent(
  event: 'evolved' | 'died' | 'revived' | 'crying' | 'risk_increased',
  userId: string,
  properties?: Record<string, unknown>
): void {
  track(`creature_${event}`, {
    userId,
    ...properties,
  });
}

export function trackPrimeTimeEvent(
  event: 'window_started' | 'window_ended' | 'session_qualified' | 'bonus_claimed',
  userId: string,
  windowType: string,
  properties?: Record<string, unknown>
): void {
  track(`prime_time_${event}`, {
    userId,
    windowType,
    ...properties,
  });
}

export function trackRaidEvent(
  event: 'activated' | 'damage_contributed' | 'defeated' | 'timeout' | 'rewards_claimed',
  squadId: string,
  userId: string,
  properties?: Record<string, unknown>
): void {
  track(`raid_${event}`, {
    squadId,
    userId,
    ...properties,
  });
}

// ============================================================================
// Phase 6: AI Analytics
// ============================================================================

export function trackPredictionEvent(
  event: 'generated' | 'intervention_sent' | 'outcome_verified',
  userId: string,
  predictionType: string,
  confidence: number,
  outcome?: 'prevented' | 'occurred' | 'ignored'
): void {
  track(`prediction_${event}`, {
    userId,
    predictionType,
    confidence,
    outcome,
  });
}

export function trackDifficultyEvent(
  event: 'adjusted' | 'manually_changed' | 'suggested',
  userId: string,
  fromRating: string,
  toRating: string,
  reason: string
): void {
  track(`difficulty_${event}`, {
    userId,
    fromRating,
    toRating,
    reason,
  });
}

export function trackNarrativeEvent(
  event: 'created' | 'shared' | 'viewed',
  sessionId: string,
  userId: string,
  theme: string,
  intensity: number
): void {
  track(`narrative_${event}`, {
    sessionId,
    userId,
    theme,
    intensity,
  });
}

// ============================================================================
// System Health Analytics
// ============================================================================

export function trackSystemError(
  systemName: string,
  errorCode: string,
  retryable: boolean,
  context?: Record<string, unknown>
): void {
  track('system_error', {
    systemName,
    errorCode,
    retryable,
    ...context,
  });
}

export function trackSystemRetry(
  systemName: string,
  attemptNumber: number,
  success: boolean
): void {
  track('system_retry', {
    systemName,
    attemptNumber,
    success,
  });
}

// ============================================================================
// Feature Flag Analytics
// ============================================================================

export function trackFeatureFlagExposure(
  flagName: string,
  userId: string,
  value: boolean
): void {
  track('feature_flag_exposed', {
    flagName,
    userId,
    value,
  });
}

// ============================================================================
// Initialize Analytics Listeners
// ============================================================================

export function initializeTransformationAnalytics(): void {
  // Listen to all transformation events and track them

  // Creature events
  eventBus.subscribe('creature:evolved', (payload) => {
    trackCreatureEvent('evolved', payload.userId, {
      fromStage: payload.fromStage,
      toStage: payload.toStage,
    });
  });

  eventBus.subscribe('creature:died', (payload) => {
    trackCreatureEvent('died', payload.userId, {
      streakLost: payload.streakLost,
      revivalCost: payload.revivalCost,
    });
  });

  eventBus.subscribe('creature:revived', (payload) => {
    trackCreatureEvent('revived', payload.userId, {
      cost: payload.cost,
      streakPreserved: payload.streakPreserved,
    });
  });

  // Prime time events
  eventBus.subscribe('prime_time:window_started', (payload) => {
    trackPrimeTimeEvent('window_started', payload.userId, payload.windowId, {
      windowName: payload.windowName,
    });
  });

  // Raid events
  eventBus.subscribe('raid:defeated', (payload) => {
    trackRaidEvent('defeated', payload.squadId, payload.userId || 'unknown', {
      bossId: payload.bossId,
      totalDamage: payload.totalDamage,
    });
  });

  // Narrative events
  eventBus.subscribe('narrative:session_complete', (payload) => {
    trackNarrativeEvent('created', payload.sessionId, payload.userId, payload.theme, 0.8);
  });

  console.log('[TransformationAnalytics] Initialized');
}
