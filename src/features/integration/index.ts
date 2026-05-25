/**
 * Feature Integration Module
 * Wires all feature event handlers together
 */

import { initializeProgressionRewardsIntegration } from './progression-rewards';
import { initializeStreaksRewardsIntegration } from './streaks-rewards';
import { initializeBossRewardsIntegration } from './boss-rewards';
import { initializeSessionsFeedIntegration } from './sessions-feed';
import { initializeFocusScoreIntegration } from '../focus-identity/integration-focus-score';

export interface IntegrationConfig {
  enableProgressionRewards: boolean;
  enableStreaksRewards: boolean;
  enableBossRewards: boolean;
  enableSessionsFeed: boolean;
  enableEconomyFeed: boolean;
  enableSocialFeed: boolean;
  enableFocusIdentity: boolean;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  enableProgressionRewards: true,
  enableStreaksRewards: true,
  enableBossRewards: true,
  enableSessionsFeed: true,
  enableEconomyFeed: false,
  enableSocialFeed: false,
  enableFocusIdentity: true,
};

let unsubscribers: Array<() => void> = [];

/**
 * Initialize all feature integrations
 */
export function initializeFeatureIntegrations(config: Partial<IntegrationConfig> = {}): () => void {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Clean up any existing integrations
  cleanupIntegrations();

  if (fullConfig.enableProgressionRewards) {
    unsubscribers.push(initializeProgressionRewardsIntegration());
  }

  if (fullConfig.enableStreaksRewards) {
    unsubscribers.push(initializeStreaksRewardsIntegration());
  }

  if (fullConfig.enableBossRewards) {
    unsubscribers.push(initializeBossRewardsIntegration());
  }

  if (fullConfig.enableSessionsFeed) {
    unsubscribers.push(initializeSessionsFeedIntegration());
  }

  if (fullConfig.enableFocusIdentity) {
    unsubscribers.push(initializeFocusScoreIntegration());
  }

  return cleanupIntegrations;
}

/**
 * Clean up all integrations
 */
export function cleanupIntegrations(): void {
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];
}
