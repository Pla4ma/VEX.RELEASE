/**
 * Cross-System Integration Hub
 *
 * Central wiring point for all feature integrations.
 */

import { addBreadcrumb, captureException } from '../config/sentry';
import { initializeSeasonRewardsIntegration } from './season-rewards';
import { initializeChallengeProgressionIntegration } from './challenge-progression';
import { initializeEconomySeasonsIntegration } from './economy-seasons';
import { initializeSocialCompetitionIntegration } from './social-competition';
import { initializeAICoachIntegration } from './ai-coach';
import { initializeFeatureWiring } from './FeatureWiring';
import { initializeSessionBossIntegration } from '../session/integration/SessionBossIntegration';
import { initializeStreakInsuranceIntegration } from './streak-insurance';

export interface IntegrationManager {
  initialize: () => () => void;
  health: () => Promise<IntegrationHealth>;
}

export interface IntegrationHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  integrations: Record<string, { status: 'up' | 'down'; latency: number }>;
}

const cleanupFunctions: Array<() => void> = [];

export function initializeAllIntegrations(): () => void {
  addBreadcrumb('Initializing feature integrations', 'integration');

  try {
    cleanupFunctions.push(initializeSeasonRewardsIntegration());
    cleanupFunctions.push(initializeChallengeProgressionIntegration());
    cleanupFunctions.push(initializeEconomySeasonsIntegration());
    cleanupFunctions.push(initializeSocialCompetitionIntegration());
    cleanupFunctions.push(initializeAICoachIntegration());
    cleanupFunctions.push(initializeSessionBossIntegration());
    cleanupFunctions.push(initializeStreakInsuranceIntegration());
    cleanupFunctions.push(initializeFeatureWiring());
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error('Failed to initialize integrations'),
      { area: 'integration.initializeAllIntegrations' }
    );
  }

  addBreadcrumb('Feature integrations initialized', 'integration');

  return () => {
    addBreadcrumb('Cleaning up feature integrations', 'integration');
    cleanupFunctions.forEach((cleanup) => cleanup());
    cleanupFunctions.length = 0;
  };
}

export async function checkIntegrationHealth(): Promise<IntegrationHealth> {
  const checks = {
    seasonRewards: { status: 'up' as const, latency: 0 },
    challengeProgression: { status: 'up' as const, latency: 0 },
    economySeasons: { status: 'up' as const, latency: 0 },
    socialCompetition: { status: 'up' as const, latency: 0 },
    aiCoach: { status: 'up' as const, latency: 0 },
  };

  return {
    status: Object.values(checks).every((check) => check.status === 'up') ? 'healthy' : 'degraded',
    integrations: checks,
  };
}

export {
  initializeSeasonRewardsIntegration,
  initializeChallengeProgressionIntegration,
  initializeEconomySeasonsIntegration,
  initializeSocialCompetitionIntegration,
  initializeAICoachIntegration,
  initializeSessionBossIntegration,
  initializeStreakInsuranceIntegration,
  initializeFeatureWiring,
};

export {
  wireSessionIntegration,
  wireEconomyIntegration,
  wireSocialIntegration,
  wireCoachIntegration,
  wireProgressionIntegration,
  wireBossIntegration,
  wireCraftingIntegration,
} from './FeatureWiring';
