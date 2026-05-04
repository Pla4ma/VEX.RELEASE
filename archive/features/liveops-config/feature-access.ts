import { z } from 'zod';

import type { FeatureFlags } from './schemas';

export const ExperienceStageSchema = z.enum([
  'NEW_USER',
  'ACTIVATING',
  'ENGAGED',
  'POWER_USER',
]);
export type UserExperienceStage = z.infer<typeof ExperienceStageSchema>;

export const ProductTierSchema = z.enum([
  'CORE',
  'ENGAGEMENT',
  'EXPANSION',
]);
export type ProductTier = z.infer<typeof ProductTierSchema>;

export const FeatureKeySchema = z.enum([
  // Core features (always visible)
  'focus_session',
  'progress_view',
  'ai_coach_basic',
  'ai_coach_advanced',
  'economy_basic',
  'economy_advanced',

  // Navigation tabs
  'home_tab',
  'focus_tab',
  'social_tab',
  'profile_tab',

  // Boss system
  'boss_tab',
  'boss_bounties',

  // Social features (simplified - core only)
  'squads',
  'rivals',

  // Progression systems
  'battle_pass',
  'achievements',
  'challenges',

  // Economy systems
  'shop',
  'inventory',
  'wagers',
  'streak_insurance',
  'gems_prominent',

  // Content & Study
  'content_study',
  'content_study_advanced',
  'quiz_review_mode',

  // Companion
  'companion_detail',

  // Seasonal
  'seasonal_features',

  // Paywall
  'premium_paywall',

  // Settings
  'advanced_settings',

  // Rankings/Leaderboard
  'rankings',
]);
export type FeatureKey = z.infer<typeof FeatureKeySchema>;

export const FeatureAccessInputSchema = z.object({
  accountAgeDays: z.number().min(0),
  totalCompletedSessions: z.number().min(0),
  currentStreak: z.number().min(0),
  currentLevel: z.number().min(1),
  hasJoinedSquad: z.boolean(),
  hasCompletedOnboarding: z.boolean(),
  hasCompletedSuccessfulSession: z.boolean(),
  isPremium: z.boolean(),
  // New fields for launch gating
  hasFirstItem: z.boolean().default(false),
  inventoryItemCount: z.number().min(0).default(0),
  hasFirstValueMoment: z.boolean().default(false),
  notificationPermissionStatus: z.enum(['not_requested', 'requested', 'granted', 'denied']).default('not_requested'),
  activeBossEncounter: z.boolean().default(false),
  hasActiveStudyPlan: z.boolean().default(false),
  squadCount: z.number().min(0).default(0),
  liveOpsFlags: z.custom<Partial<FeatureFlags>>().optional(),
});
export type FeatureAccessInput = z.infer<typeof FeatureAccessInputSchema>;

export const FeatureAccessStateSchema = z.object({
  isVisible: z.boolean(),
  isUnlocked: z.boolean(),
  unlockReason: z.string(),
  lockedDescription: z.string(),
  recommendedUnlockMoment: z.string(),
  isTeased: z.boolean(),
  priority: z.number().int().min(1).max(5),
});
export type FeatureAccessState = z.infer<typeof FeatureAccessStateSchema>;
export type FeatureAccessMap = Record<FeatureKey, FeatureAccessState>;

// Feature visibility result types
export type FeatureVisibility = 'visible' | 'locked' | 'hidden' | 'contextual';

export interface FeatureVisibilityResult {
  visibility: FeatureVisibility;
  isUnlocked: boolean;
  unlockReason: string;
  lockedDescription: string;
}

// Helper functions for feature gating
const hasSessions = (input: FeatureAccessInput, count: number) =>
  input.totalCompletedSessions >= count;
const hasStreak = (input: FeatureAccessInput, count: number) =>
  input.currentStreak >= count;
const hasLevel = (input: FeatureAccessInput, level: number) =>
  input.currentLevel >= level;
const isLiveOpsEnabled = (
  flags: Partial<FeatureFlags> | undefined,
  key: keyof FeatureFlags,
) => {
  const value = flags?.[key];
  return typeof value === 'boolean' ? value : true;
};

/**
 * Check if a feature should be shown based on visibility state
 */
export function canShowFeature(
  feature: FeatureAccessState,
  context?: { forceShow?: boolean; isContextual?: boolean }
): boolean {
  if (context?.forceShow) {return true;}
  if (context?.isContextual && feature.isUnlocked) {return true;}
  return feature.isVisible;
}

/**
 * Get the visibility status for a feature
 */
export function getFeatureVisibility(
  feature: FeatureAccessState,
  userContext?: { isPostLaunch?: boolean }
): FeatureVisibility {
  if (!feature.isVisible) {return 'hidden';}
  if (feature.isUnlocked) {return 'visible';}
  if (userContext?.isPostLaunch && feature.isTeased) {return 'contextual';}
  return 'locked';
}

/**
 * Get unlock reason for a feature
 */
export function getUnlockReason(feature: FeatureAccessState): string {
  return feature.isUnlocked ? feature.unlockReason : feature.lockedDescription;
}

/**
 * Check if a feature is post-launch only
 */
export function isFeaturePostLaunch(feature: FeatureAccessState): boolean {
  // Features with priority 5 or specific flags are considered post-launch
  return feature.priority >= 5 && !feature.isVisible;
}

export function getUserExperienceStage(raw: FeatureAccessInput): UserExperienceStage {
  const input = FeatureAccessInputSchema.parse(raw);
  if (input.totalCompletedSessions >= 20 || input.currentStreak >= 14) {
    return 'POWER_USER';
  }
  if (input.totalCompletedSessions >= 8 || input.currentStreak >= 4) {
    return 'ENGAGED';
  }
  if (input.totalCompletedSessions >= 2 || input.currentStreak >= 1) {
    return 'ACTIVATING';
  }
  if (input.totalCompletedSessions <= 1 || input.accountAgeDays < 1) {
    return 'NEW_USER';
  }
  return 'ACTIVATING';
}

export function getProductTier(stage: UserExperienceStage): ProductTier {
  if (stage === 'POWER_USER') {
    return 'EXPANSION';
  }

  if (stage === 'ENGAGED') {
    return 'ENGAGEMENT';
  }

  return 'CORE';
}

function buildState(
  visible: boolean,
  unlocked: boolean,
  unlockReason: string,
  lockedDescription: string,
  recommendedUnlockMoment: string,
  priority: number,
): FeatureAccessState {
  return FeatureAccessStateSchema.parse({
    isVisible: visible,
    isUnlocked: unlocked,
    unlockReason,
    lockedDescription,
    recommendedUnlockMoment,
    isTeased: visible && !unlocked,
    priority,
  });
}

export function buildFeatureAccessMap(raw: FeatureAccessInput): {
  stage: UserExperienceStage;
  productTier: ProductTier;
  features: FeatureAccessMap;
} {
  const input = FeatureAccessInputSchema.parse(raw);
  const stage = getUserExperienceStage(input);
  const productTier = getProductTier(stage);
  const socialEnabled = isLiveOpsEnabled(input.liveOpsFlags, 'squadsEnabled');
  const rankingsEnabled = isLiveOpsEnabled(input.liveOpsFlags, 'leaderboardsEnabled');
  const battlePassEnabled = isLiveOpsEnabled(input.liveOpsFlags, 'battlePassEnabled');
  const shopEnabled = isLiveOpsEnabled(input.liveOpsFlags, 'shopEnabled');
  const isCoreTier = productTier === 'CORE';
  const isEngagementTier = productTier === 'ENGAGEMENT' || productTier === 'EXPANSION';
  const isExpansionTier = productTier === 'EXPANSION';

  // Derived gating conditions
  const hasAnyProgress = input.totalCompletedSessions > 0;
  const hasEnoughSessionsForWagers = hasSessions(input, 3);
  const hasEnoughStreakForInsurance = hasStreak(input, 3);
  const isPostLaunch = input.accountAgeDays >= 7 || input.currentLevel >= 5;
  const hasInventory = input.inventoryItemCount > 0;
  const hasSquadPopulation = input.squadCount > 0;

  const features: FeatureAccessMap = {
    // ============================================================================
    // CORE FEATURES (Priority 1 - Always visible once unlocked)
    // ============================================================================
    focus_session: buildState(true, true, 'Focus sessions are the core loop.', 'Start a focus session to begin your streak and rewards.', 'Day 0', 1),
    progress_view: buildState(input.hasCompletedOnboarding, input.hasCompletedOnboarding, 'Progress is available after onboarding.', 'Finish onboarding to unlock your progress view.', 'Right after onboarding', 1),

    // ============================================================================
    // NAVIGATION TABS
    // ============================================================================
    home_tab: buildState(true, true, 'Home is your daily decision screen.', 'Home is always available.', 'Day 0', 1),
    focus_tab: buildState(input.hasCompletedOnboarding, input.hasCompletedOnboarding, 'Focus tab unlocked after onboarding.', 'Complete onboarding to access Focus tab.', 'After onboarding', 1),
    social_tab: buildState(false, false, 'Social features now live in Profile.', 'Social tab removed from launch navigation. Access via Profile.', 'Post-launch', 5),
    profile_tab: buildState(true, true, 'Profile is always available.', 'Profile is always available.', 'Day 0', 1),

    // ============================================================================
    // AI COACH
    // ============================================================================
    ai_coach_basic: buildState(input.hasCompletedOnboarding, input.hasCompletedSuccessfulSession, 'Complete your first session to wake up your coach.', 'Your coach becomes useful after it sees one real session.', 'After your first successful session', 2),
    ai_coach_advanced: buildState(!isCoreTier, input.isPremium || stage === 'POWER_USER', input.isPremium ? 'Premium unlocks the full coach immediately.' : 'Keep showing up and the coach becomes more advanced.', 'Advanced coaching arrives after you prove momentum, or sooner with premium.', 'Days 3 to 7', 4),

    // ============================================================================
    // ECONOMY SYSTEMS
    // ============================================================================
    economy_basic: buildState(input.hasCompletedOnboarding, input.hasCompletedSuccessfulSession, 'Earn your first reward to unlock the wallet.', 'Your wallet stays simple until you complete a session.', 'After session one', 2),
    economy_advanced: buildState(isEngagementTier, hasSessions(input, 4) || input.isPremium, input.isPremium ? 'Premium reveals the deeper reward layer sooner.' : 'Complete 4 sessions to unlock deeper rewards.', 'Advanced currencies stay hidden until the basic reward loop feels obvious.', 'After session four', 4),
    shop: buildState(isEngagementTier && shopEnabled, hasSessions(input, 6), 'Complete 6 sessions to unlock the shop.', 'The shop stays out of sight until rewards already mean something.', 'Days 5 to 7', 4),
    gems_prominent: buildState(isEngagementTier, input.isPremium || hasSessions(input, 5), 'Gems become prominent after you understand the basic economy.', 'Gems stay subtle until the core loop is solid.', 'After session five', 3),

    // ============================================================================
    // LAUNCH-GATED ECONOMY (hidden/simplified at launch)
    // ============================================================================
    inventory: buildState(hasInventory, hasInventory, 'Your inventory appears once you earn your first item.', 'Inventory stays hidden until you have something to put in it.', 'After first item earned', 2),
    wagers: buildState(hasEnoughSessionsForWagers, hasEnoughSessionsForWagers, 'Wagers unlock at Level 3. Test your focus with stakes.', 'Wagers are hidden until you have momentum to protect.', 'Level 3+', 3),
    streak_insurance: buildState(hasEnoughStreakForInsurance, hasEnoughStreakForInsurance, 'Streak insurance unlocks at streak 3+. Protect your progress.', 'Insurance only matters once you have a streak worth protecting.', 'Streak 3+', 3),

    // ============================================================================
    // BOSS SYSTEM
    // ============================================================================
    boss_tab: buildState(isEngagementTier, hasSessions(input, 4) && hasStreak(input, 2), 'Complete 4 sessions and reach streak 2 to enter the boss battle.', 'Boss fights feel better once you have a real rhythm to channel into them.', 'Days 3 to 5', 3),
    boss_bounties: buildState(isEngagementTier && input.activeBossEncounter, isEngagementTier && input.activeBossEncounter, 'Bounties available during active boss encounters.', 'Bounties appear when a boss is active and you have familiarity.', 'During active boss', 3),

    // ============================================================================
    // SOCIAL FEATURES (all moved to Profile, hidden from main nav)
    // ============================================================================
    squads: buildState(isEngagementTier && socialEnabled && hasSquadPopulation, input.hasJoinedSquad || hasSessions(input, 4), input.hasJoinedSquad ? 'Your squad is live.' : 'Complete 4 sessions to unlock squads.', 'Squads matter more when you already care about protecting momentum.', 'Days 3 to 5', 3),
    rivals: buildState(isEngagementTier, hasSessions(input, 5), 'Rivals unlocks at 5 sessions. Find your competitive rhythm.', 'Rivals appears once your personal loop is solid.', 'After session five', 4),

    // ============================================================================
    // PROGRESSION SYSTEMS
    // ============================================================================
    challenges: buildState(input.hasCompletedOnboarding, input.hasCompletedOnboarding, 'Challenges available after onboarding.', 'Challenges guide your early progress.', 'After onboarding', 2),
    rankings: buildState(isEngagementTier && rankingsEnabled, hasSessions(input, 5), 'Complete 5 sessions to see rankings.', 'Rankings are delayed until you have enough data to care where you stand.', 'After session five', 4),

    // ============================================================================
    // LAUNCH-GATED PROGRESSION (hidden at launch)
    // ============================================================================
    battle_pass: buildState(false, hasSessions(input, 5) && hasLevel(input, 5), 'Battle Pass hidden until Level 5 or post-launch.', 'Battle Pass is a deep progression layer. Hidden until you have traction.', 'Level 5+ or post-launch', 5),
    achievements: buildState(hasAnyProgress, hasAnyProgress, 'Achievements appear once you have progress to celebrate.', 'Achievements stay hidden until you have something to show.', 'After first progress', 2),

    // ============================================================================
    // CONTENT & STUDY
    // ============================================================================
    content_study: buildState(isExpansionTier || input.isPremium || input.hasActiveStudyPlan, (hasSessions(input, 6) && input.currentLevel >= 3) || input.isPremium || input.hasActiveStudyPlan, input.isPremium ? 'Premium unlocks content study earlier.' : 'Complete 6 sessions and reach Level 3 to unlock content study.', 'Content study shows up once VEX already feels valuable as a focus tool.', 'Days 5 to 7', 4),
    content_study_advanced: buildState(isExpansionTier, hasSessions(input, 8) && input.currentLevel >= 4, 'Advanced study features unlock with more experience.', 'Advanced study stays simple until you need it.', 'Level 4+', 4),
    quiz_review_mode: buildState(input.hasActiveStudyPlan, input.hasActiveStudyPlan, 'Quiz mode available when you have an active study plan.', 'Quiz appears contextually during study sessions.', 'During study context', 3),

    // ============================================================================
    // COMPANION
    // ============================================================================
    companion_detail: buildState(isEngagementTier, hasSessions(input, 3), 'Companion details unlock after a few sessions.', 'Companion detail is gated to reduce early clutter.', 'After 3 sessions', 3),

    // ============================================================================
    // SEASONAL
    // ============================================================================
    seasonal_features: buildState(isExpansionTier, input.accountAgeDays >= 7 || input.currentLevel >= 5, 'Reach day 7 or Level 5 to unlock seasonal features.', 'Seasonal systems should feel like an expansion, not a distraction on day one.', 'End of week one', 4),

    // ============================================================================
    // PREMIUM & MONETIZATION
    // ============================================================================
    premium_paywall: buildState(input.hasFirstValueMoment, input.hasFirstValueMoment, 'Premium available after first value moment.', 'Paywall blocked until you experience VEX value first.', 'After first value moment', 2),

    // ============================================================================
    // SETTINGS
    // ============================================================================
    advanced_settings: buildState(isEngagementTier, isEngagementTier, 'Advanced settings unlock as you grow.', 'Advanced options grouped to reduce early complexity.', 'After engagement begins', 3),
  };

  return { stage, productTier, features };
}
