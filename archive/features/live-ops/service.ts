/**
 * Live Ops Service
 *
 * Phase 12.2 — Remote config, A/B testing, live events
 */

import {
  type RemoteConfig,
  type FeatureFlags,
  type ExperimentConfig,
  type LiveEvent,
  type UserExperimentAssignment,
  type NotificationCampaign,
  type AudienceCriteria,
  DEFAULT_FEATURE_FLAGS,
} from './types';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('live-ops:service');

// ============================================================================
// State
// ============================================================================

let cachedConfig: RemoteConfig | null = null;
let userAssignments: Map<string, UserExperimentAssignment> = new Map();
const CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Remote Config
// ============================================================================

/**
 * Fetch remote config from server
 */
export async function fetchRemoteConfig(): Promise<RemoteConfig> {
  // In production, this fetches from Supabase or Firebase Remote Config
  const mockConfig: RemoteConfig = {
    version: 1,
    updatedAt: Date.now(),
    features: DEFAULT_FEATURE_FLAGS,
    content: {
      dailyChallengePool: ['challenge-focus-30', 'challenge-morning', 'challenge-quality'],
      weeklyChallengePool: ['challenge-streak-7', 'challenge-boss-3', 'challenge-weekend'],
      bossSpawnRates: {
        'boss-procrastinator': 0.4,
        'boss-distractor': 0.3,
        'boss-perfectionist': 0.2,
        'boss-doomscroller': 0.1,
      },
      currentTheme: 'default',
      holidayTheme: null,
    },
    experiments: [],
    events: getCurrentEvents(),
  };

  cachedConfig = mockConfig;
  return mockConfig;
}

/**
 * Get cached config or fetch fresh
 */
export async function getRemoteConfig(): Promise<RemoteConfig> {
  if (!cachedConfig || Date.now() - cachedConfig.updatedAt > CONFIG_CACHE_DURATION) {
    return fetchRemoteConfig();
  }
  return cachedConfig;
}

/**
 * Get feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const config = await getRemoteConfig();
  return config.features;
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(featureName: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[featureName] as boolean;
}

// ============================================================================
// A/B Testing
// ============================================================================

/**
 * Get experiment assignments for a user
 */
export async function getUserExperiments(userId: string): Promise<UserExperimentAssignment[]> {
  const config = await getRemoteConfig();
  const assignments: UserExperimentAssignment[] = [];

  for (const experiment of config.experiments) {
    if (experiment.status !== 'RUNNING') {continue;}

    const cached = userAssignments.get(`${userId}:${experiment.id}`);
    if (cached) {
      assignments.push(cached);
      continue;
    }

    // Assign variant based on user hash
    const variant = assignVariant(userId, experiment);
    if (variant) {
      const assignment: UserExperimentAssignment = {
        userId,
        experimentId: experiment.id,
        variantId: variant.id,
        assignedAt: Date.now(),
      };
      userAssignments.set(`${userId}:${experiment.id}`, assignment);
      assignments.push(assignment);
    }
  }

  return assignments;
}

/**
 * Assign a variant to a user
 */
function assignVariant(
  userId: string,
  experiment: ExperimentConfig
): ExperimentConfig['variants'][0] | null {
  // Simple hash-based assignment
  const hash = hashString(`${userId}:${experiment.id}`);
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  const normalized = hash % totalWeight;

  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (normalized < cumulative) {
      return variant;
    }
  }

  return null;
}

/**
 * Simple hash function for variant assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Check if user is in experiment variant
 */
export async function isInExperimentVariant(
  userId: string,
  experimentId: string,
  variantId: string
): Promise<boolean> {
  const experiments = await getUserExperiments(userId);
  const assignment = experiments.find((e) => e.experimentId === experimentId);
  return assignment?.variantId === variantId;
}

// ============================================================================
// Live Events
// ============================================================================

/**
 * Get current active events
 */
export function getCurrentEvents(): LiveEvent[] {
  const now = Date.now();

  // Mock events - in production, fetch from server
  const events: LiveEvent[] = [
    {
      id: 'event-weekend-boost',
      name: 'Weekend XP Boost',
      description: '2x XP all weekend long!',
      type: 'XP_BOOST',
      status: 'ACTIVE',
      startTime: now - 24 * 60 * 60 * 1000,
      endTime: now + 24 * 60 * 60 * 1000,
      xpMultiplier: 2,
      themeColor: '#f59e0b',
    },
  ];

  return events.filter((e) => e.status === 'ACTIVE' && e.endTime > now);
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<LiveEvent[]> {
  const config = await getRemoteConfig();
  const now = Date.now();

  return config.events.filter((e) => e.startTime > now && e.status === 'UPCOMING');
}

/**
 * Check if an event is active
 */
export function isEventActive(eventId: string): boolean {
  const events = getCurrentEvents();
  return events.some((e) => e.id === eventId);
}

/**
 * Get active XP multiplier
 */
export function getActiveXpMultiplier(): number {
  const events = getCurrentEvents();
  return events.reduce((max, e) => Math.max(max, e.xpMultiplier || 1), 1);
}

/**
 * Get active coin multiplier
 */
export function getActiveCoinMultiplier(): number {
  const events = getCurrentEvents();
  return events.reduce((max, e) => Math.max(max, e.coinMultiplier || 1), 1);
}

// ============================================================================
// Push Campaigns
// ============================================================================

/**
 * Schedule a notification campaign
 */
export async function scheduleCampaign(
  campaign: Omit<NotificationCampaign, 'sentCount' | 'deliveredCount' | 'openedCount'>
): Promise<NotificationCampaign> {
  const fullCampaign: NotificationCampaign = {
    ...campaign,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
  };

  // In production, save to database and schedule
  // await repository.saveCampaign(fullCampaign);

  return fullCampaign;
}

/**
 * Get scheduled campaigns
 */
export async function getScheduledCampaigns(): Promise<NotificationCampaign[]> {
  // In production, fetch from database
  return [];
}

/**
 * Send campaign immediately
 */
export async function sendCampaign(
  campaignId: string,
  targetUsers: string[]
): Promise<void> {
  // In production, queue push notifications
  eventBus.publish('notifications:send-campaign', {
    campaignId,
    userIds: targetUsers,
    title: 'Live ops update',
    body: 'A new campaign is available.',
  });
}

// ============================================================================
// Audience Targeting
// ============================================================================

/**
 * Check if user matches audience criteria
 */
export function matchesAudience(
  userProfile: {
    userType: 'new' | 'returning' | 'vip';
    platform: 'ios' | 'android' | 'web';
    level: number;
    country: string;
  },
  criteria: AudienceCriteria
): boolean {
  if (criteria.userTypes && !criteria.userTypes.includes(userProfile.userType)) {
    return false;
  }

  if (criteria.platforms && !criteria.platforms.includes(userProfile.platform)) {
    return false;
  }

  if (criteria.minLevel !== undefined && userProfile.level < criteria.minLevel) {
    return false;
  }

  if (criteria.maxLevel !== undefined && userProfile.level > criteria.maxLevel) {
    return false;
  }

  if (criteria.countries && !criteria.countries.includes(userProfile.country)) {
    return false;
  }

  return true;
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize Live Ops system
 */
export async function initializeLiveOps(): Promise<void> {
  // Fetch initial config
  await fetchRemoteConfig();

  // Set up periodic refresh
  setInterval(() => {
    fetchRemoteConfig().catch((err) => debug.error('Failed to fetch remote config', err instanceof Error ? err : new Error(String(err))));
  }, CONFIG_CACHE_DURATION);
}
