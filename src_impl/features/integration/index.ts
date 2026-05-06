/**
 * Feature Integration Module
 * Wires all feature event handlers together
 */

import { initializeProgressionRewardsIntegration } from './progression-rewards';
import { initializeStreaksRewardsIntegration } from './streaks-rewards';
import { initializeBossRewardsIntegration } from './boss-rewards';
import { initializeSessionsFeedIntegration } from './sessions-feed';
import { initializeEconomyFeedIntegration } from './economy-feed';
import { initializeSocialFeedIntegration } from './social-feed';

export interface IntegrationConfig {
  enableProgressionRewards: boolean;
  enableStreaksRewards: boolean;
  enableBossRewards: boolean;
  enableSessionsFeed: boolean;
  enableEconomyFeed: boolean;
  enableSocialFeed: boolean;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  enableProgressionRewards: true,
  enableStreaksRewards: true,
  enableBossRewards: true,
  enableSessionsFeed: true,
  enableEconomyFeed: true,
  enableSocialFeed: true,
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

  if (fullConfig.enableEconomyFeed) {
    unsubscribers.push(initializeEconomyFeedIntegration());
  }

  if (fullConfig.enableSocialFeed) {
    unsubscribers.push(initializeSocialFeedIntegration());
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
