/**
 * Streak Evolution System
 *
 * Phase 3.2 - Streak System Evolution
 * Transforms simple daily streak counter into emotional system:
 * - Streak States: Active, At Risk, Critical, Broken, Protected
 * - Streak Insurance: Earned through achievements
 * - Streak Recovery: Comeback sessions with reduced difficulty
 * - Streak Milestones: 3/7/14/30/100 day rewards
 *
 * Dependencies:
 * - Streaks Service (base streak tracking)
 * - Achievements (insurance earning)
 * - AI Coach (intervention messages)
 * - Analytics (engagement tracking)
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================

export type StreakState = 'ACTIVE' | 'AT_RISK' | 'CRITICAL' | 'BROKEN' | 'PROTECTED';

export interface StreakStateInfo {
  state: StreakState;
  label: string;
  description: string;
  color: string;
  icon: string;
  animation: 'none' | 'pulse' | 'glow' | 'shake' | 'shield';
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  coachMessage: string;
}

export interface StreakMilestone {
  days: number;
  name: string;
  description: string;
  badgeIcon: string;
  rewardType: 'COSMETIC' | 'SHIELD' | 'XP' | 'FEATURE';
  rewardId: string;
  visualEffect: string;
  achieved: boolean;
  achievedAt: number | null;
}

export interface StreakInsurance {
  id: string;
  userId: string;
  source: InsuranceSource;
  earnedAt: number;
  used: boolean;
  usedAt: number | null;
  earnedDescription: string;
  visualBadge: string;
}

export type InsuranceSource =
  | 'MILESTONE_7'
  | 'MILESTONE_14'
  | 'MILESTONE_30'
  | 'MILESTONE_100'
  | 'ACHIEVEMENT_COMPLETE'
  | 'BOSS_DEFEAT'
  | 'PURCHASED'
  | 'SPECIAL_EVENT';

export interface StreakRecoveryPlan {
  userId: string;
  previousStreak: number;
  isRecovering: boolean;
  recoveryDay: number;
  targetDays: number;
  sessionDuration: number;
  difficulty: 'REDUCED' | 'NORMAL';
  comebackBonusActive: boolean;
  bonusMultiplier: number;
  message: string;
}

export interface StreakProtectionResult {
  protected: boolean;
  method: 'INSURANCE' | 'SHIELD' | 'NONE';
  insuranceId: string | null;
  newState: StreakState;
  message: string;
}

// ============================================================================
// Streak State Definitions
// ============================================================================

export const STREAK_STATES: Record<StreakState, StreakStateInfo> = {
  ACTIVE: {
    state: 'ACTIVE',
    label: 'Streak Active',
    description: 'Your streak is safe and growing',
    color: '#48BB78', // Green
    icon: '🔥',
    animation: 'glow',
    urgency: 'none',
    coachMessage: 'Your streak is building momentum. Keep it going!',
  },
  AT_RISK: {
    state: 'AT_RISK',
    label: 'Streak At Risk',
    description: 'Complete a session today to protect your streak',
    color: '#ED8936', // Orange/Yellow
    icon: '⚠️',
    animation: 'pulse',
    urgency: 'medium',
    coachMessage: 'Your streak needs attention soon. One quick session keeps it alive.',
  },
  CRITICAL: {
    state: 'CRITICAL',
    label: 'Streak Critical',
    description: 'URGENT: Less than 1 hour remaining',
    color: '#E53E3E', // Red
    icon: '🚨',
    animation: 'shake',
    urgency: 'critical',
    coachMessage: 'CRITICAL: Your streak breaks soon. Start a session NOW.',
  },
  BROKEN: {
    state: 'BROKEN',
    label: 'Streak Broken',
    description: 'Your streak has ended. Time for a comeback!',
    color: '#718096', // Gray
    icon: '💔',
    animation: 'none',
    urgency: 'low',
    coachMessage: "Streaks break. What matters is coming back. Let's restart together.",
  },
  PROTECTED: {
    state: 'PROTECTED',
    label: 'Streak Protected',
    description: 'Insurance used - streak maintained',
    color: '#4299E1', // Blue
    icon: '🛡️',
    animation: 'shield',
    urgency: 'none',
    coachMessage: 'Your streak was protected by insurance. Ready to continue?',
  },
};

// ============================================================================
// Streak Milestones (3/7/14/30/100 days)
// ============================================================================

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    name: 'Building Momentum',
    description: '3 days of consistent focus - you are building a habit',
    badgeIcon: '🌱',
    rewardType: 'XP',
    rewardId: 'momentum-bonus',
    visualEffect: 'sparkle',
    achieved: false,
    achievedAt: null,
  },
  {
    days: 7,
    name: 'Week Warrior',
    description: 'A full week of dedication - you are a force of nature',
    badgeIcon: '🛡️',
    rewardType: 'SHIELD',
    rewardId: 'week-shield',
    visualEffect: 'shield-glow',
    achieved: false,
    achievedAt: null,
  },
  {
    days: 14,
    name: 'Fortnight Focused',
    description: '14 days strong - your consistency is inspiring',
    badgeIcon: '🎆',
    rewardType: 'COSMETIC',
    rewardId: 'animated-avatar-frame',
    visualEffect: 'fireworks',
    achieved: false,
    achievedAt: null,
  },
  {
    days: 30,
    name: 'Monthly Master',
    description: 'A month of mastery - you are unstoppable',
    badgeIcon: '👑',
    rewardType: 'COSMETIC',
    rewardId: 'premium-cosmetic-set',
    visualEffect: 'crown-coronation',
    achieved: false,
    achievedAt: null,
  },
  {
    days: 100,
    name: 'Century Club',
    description: '100 days of excellence - you are legendary',
    badgeIcon: '🏆',
    rewardType: 'FEATURE',
    rewardId: 'exclusive-boss-unlock',
    visualEffect: 'legendary-aura',
    achieved: false,
    achievedAt: null,
  },
];

// ============================================================================
// Streak State Detection
// ============================================================================

/**
 * Determine streak state based on time and completion status
 */
export function determineStreakState(
  streakDays: number,
  hasCompletedSessionToday: boolean,
  hoursUntilStreakBreak: number | null,
  hasInsurance: boolean
): StreakState {
  if (streakDays === 0) {
    return 'BROKEN';
  }

  if (hasCompletedSessionToday) {
    return 'ACTIVE';
  }

  if (hoursUntilStreakBreak === null) {
    return hasInsurance ? 'PROTECTED' : 'BROKEN';
  }

  if (hoursUntilStreakBreak <= 1) {
    return 'CRITICAL';
  }

  if (hoursUntilStreakBreak <= 4) {
    return 'AT_RISK';
  }

  return 'ACTIVE';
}

/**
 * Calculate hours until streak break
 */
export function calculateHoursUntilStreakBreak(
  lastSessionAt: number | null,
  currentTime: number = Date.now()
): number | null {
  if (!lastSessionAt) {return null;}

  const lastSessionDate = new Date(lastSessionAt);
  const currentDate = new Date(currentTime);

  // Check if session was today
  if (isSameDay(lastSessionDate, currentDate)) {
    return null; // Already completed today
  }

  // Calculate end of current day
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const hoursRemaining = (endOfDay.getTime() - currentTime) / (1000 * 60 * 60);
  return Math.max(0, hoursRemaining);
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get streak state info
 */
export function getStreakStateInfo(state: StreakState): StreakStateInfo {
  return STREAK_STATES[state];
}

/**
 * Get visual indicator for streak state
 */
export function getStreakVisualIndicator(
  state: StreakState,
  streakDays: number
): { icon: string; color: string; animation: string } {
  const stateInfo = STREAK_STATES[state];

  // Special handling for milestone streaks in ACTIVE state
  if (state === 'ACTIVE' && streakDays >= 7) {
    return {
      icon: stateInfo.icon,
      color: stateInfo.color,
      animation: 'milestone-glow',
    };
  }

  return {
    icon: stateInfo.icon,
    color: stateInfo.color,
    animation: stateInfo.animation,
  };
}

// ============================================================================
// Streak Insurance System
// ============================================================================

const insuranceStore = new Map<string, StreakInsurance[]>();

/**
 * Award insurance to user
 */
export function awardInsurance(
  userId: string,
  source: InsuranceSource,
  description: string
): StreakInsurance {
  const insurance: StreakInsurance = {
    id: `insurance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    source,
    earnedAt: Date.now(),
    used: false,
    usedAt: null,
    earnedDescription: description,
    visualBadge: getInsuranceBadge(source),
  };

  const userInsurance = insuranceStore.get(userId) || [];
  userInsurance.push(insurance);
  insuranceStore.set(userId, userInsurance);

  // Publish event
  eventBus.publish('streak:insurance_awarded', {
    userId,
    insuranceId: insurance.id,
    source,
  });

  return insurance;
}

/**
 * Get insurance badge based on source
 */
function getInsuranceBadge(source: InsuranceSource): string {
  const badges: Record<InsuranceSource, string> = {
    MILESTONE_7: '🛡️ Week Shield',
    MILESTONE_14: '🎆 Fortnight Guard',
    MILESTONE_30: '👑 Master Protection',
    MILESTONE_100: '🏆 Century Guardian',
    ACHIEVEMENT_COMPLETE: '🏅 Achievement Shield',
    BOSS_DEFEAT: '⚔️ Victory Ward',
    PURCHASED: '💎 Premium Guard',
    SPECIAL_EVENT: '🎁 Event Shield',
  };
  return badges[source];
}

/**
 * Get available (unused) insurance count
 */
export function getAvailableInsuranceCount(userId: string): number {
  const userInsurance = insuranceStore.get(userId) || [];
  return userInsurance.filter((i) => !i.used).length;
}

/**
 * Get all insurance for user
 */
export function getUserInsurance(userId: string): StreakInsurance[] {
  return insuranceStore.get(userId) || [];
}

/**
 * Use insurance to protect streak
 */
export function useInsurance(userId: string, streakDays: number): StreakProtectionResult {
  const userInsurance = insuranceStore.get(userId) || [];
  const availableInsurance = userInsurance.find((i) => !i.used);

  if (!availableInsurance) {
    return {
      protected: false,
      method: 'NONE',
      insuranceId: null,
      newState: 'BROKEN',
      message: 'No insurance available. Your streak has been broken.',
    };
  }

  // Mark insurance as used
  availableInsurance.used = true;
  availableInsurance.usedAt = Date.now();

  // Publish event
  eventBus.publish('streak:insurance_used', {
    userId,
    insuranceId: availableInsurance.id,
    streakDays,
    source: availableInsurance.source,
  });

  return {
    protected: true,
    method: 'INSURANCE',
    insuranceId: availableInsurance.id,
    newState: 'PROTECTED',
    message: `Streak protected with ${availableInsurance.visualBadge}!`,
  };
}

/**
 * Check if insurance can be used (has available and streak is at risk)
 */
export function canUseInsurance(userId: string, state: StreakState): boolean {
  if (state !== 'AT_RISK' && state !== 'CRITICAL') {return false;}
  return getAvailableInsuranceCount(userId) > 0;
}

// ============================================================================
// Streak Recovery System
// ============================================================================

const recoveryPlans = new Map<string, StreakRecoveryPlan>();

/**
 * Create recovery plan after streak break
 */
export function createRecoveryPlan(
  userId: string,
  previousStreak: number,
  daysAbsent: number
): StreakRecoveryPlan {
  const plan: StreakRecoveryPlan = {
    userId,
    previousStreak,
    isRecovering: true,
    recoveryDay: 1,
    targetDays: Math.min(previousStreak, 7), // Aim to rebuild to 7 days or previous
    sessionDuration: 15, // Reduced difficulty
    difficulty: 'REDUCED',
    comebackBonusActive: true,
    bonusMultiplier: 2.0, // 2x XP during comeback
    message: generateComebackMessage(previousStreak, daysAbsent),
  };

  recoveryPlans.set(userId, plan);

  // Publish event
  (eventBus as any).publish('streak:recovery_started', {
    userId,
    previousStreak,
    daysAbsent,
    bonusMultiplier: plan.bonusMultiplier,
    recoveryQuests: [], // Default empty array for recovery quests
  });

  return plan;
}

/**
 * Generate comeback message
 */
function generateComebackMessage(previousStreak: number, daysAbsent: number): string {
  if (previousStreak >= 30) {
    return `Your ${previousStreak}-day streak was impressive. Let's build an even stronger one.`;
  }
  if (previousStreak >= 7) {
    return `You had a solid ${previousStreak}-day streak. One session starts the comeback.`;
  }
  return 'Every master was once a beginner who returned. Welcome back!';
}

/**
 * Get recovery plan
 */
export function getRecoveryPlan(userId: string): StreakRecoveryPlan | null {
  return recoveryPlans.get(userId) || null;
}

/**
 * Progress recovery plan after session
 */
export function progressRecovery(userId: string): StreakRecoveryPlan | null {
  const plan = recoveryPlans.get(userId);
  if (!plan) {return null;}

  plan.recoveryDay += 1;

  // After 3 days of recovery, return to normal difficulty
  if (plan.recoveryDay > 3) {
    plan.difficulty = 'NORMAL';
    plan.sessionDuration = 25;
    plan.comebackBonusActive = false;
    plan.bonusMultiplier = 1.0;
  }

  // Complete recovery when target reached
  if (plan.recoveryDay >= plan.targetDays) {
    plan.isRecovering = false;
    plan.message = `Recovery complete! You've rebuilt your ${plan.targetDays}-day foundation.`;

    (eventBus as any).publish('streak:recovery_complete', {
      userId,
      finalStreak: plan.targetDays,
      targetDays: plan.targetDays,
      recoveryDays: plan.recoveryDay,
      success: true,
    });
  }

  return plan;
}

/**
 * Clear recovery plan
 */
export function clearRecoveryPlan(userId: string): void {
  recoveryPlans.delete(userId);
}

// ============================================================================
// Milestone Management
// ============================================================================

/**
 * Check for milestone achievements
 */
export function checkMilestones(
  streakDays: number,
  previouslyAchieved: number[]
): StreakMilestone[] {
  const newlyAchieved: StreakMilestone[] = [];

  for (const milestone of STREAK_MILESTONES) {
    if (streakDays >= milestone.days && !previouslyAchieved.includes(milestone.days)) {
      newlyAchieved.push({
        ...milestone,
        achieved: true,
        achievedAt: Date.now(),
      });

      // Award milestone rewards
      awardMilestoneRewards(milestone);
    }
  }

  return newlyAchieved;
}

/**
 * Award milestone rewards
 */
function awardMilestoneRewards(milestone: StreakMilestone): void {
  // Publish event for rewards system
  (eventBus as any).publish('streak:milestone_achieved', {
    userId: 'system', // Milestone awards don't have specific user context
    days: milestone.days,
    milestone: milestone.days,
    name: milestone.name,
    timestamp: Date.now(),
  });

  // Auto-award insurance for certain milestones
  if (milestone.days === 7) {
    // Insurance awarded via milestone system
  }
}

/**
 * Get next milestone
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return (
    STREAK_MILESTONES.find((m) => m.days > currentStreak && !m.achieved) || null
  );
}

/**
 * Get milestone progress percentage
 */
export function getMilestoneProgress(currentStreak: number, targetDays: number): number {
  const previousMilestone =
    STREAK_MILESTONES.filter((m) => m.days < targetDays).pop()?.days || 0;
  const progressInRange = currentStreak - previousMilestone;
  const rangeSize = targetDays - previousMilestone;
  return Math.min(100, Math.max(0, (progressInRange / rangeSize) * 100));
}

// ============================================================================
// Visual Helpers
// ============================================================================

/**
 * Get streak display text
 */
export function getStreakDisplayText(
  streakDays: number,
  state: StreakState,
  isRecovering: boolean
): string {
  if (isRecovering) {
    return 'Streak (recovering)';
  }

  if (state === 'PROTECTED') {
    return `${streakDays} days (protected)`;
  }

  if (streakDays === 0) {
    return 'Start your streak';
  }

  return `${streakDays} day${streakDays === 1 ? '' : 's'}`;
}

/**
 * Get streak celebration message on session complete
 */
export function getStreakCelebrationMessage(streakDays: number): string {
  if (streakDays === 1) {return 'Day 1! Your streak begins.';}
  if (streakDays === 3) {return '3 days! Building momentum.';}
  if (streakDays === 7) {return 'Week Warrior! 7 days strong.';}
  if (streakDays === 14) {return 'Fortnight Focused! 14 days!';}
  if (streakDays === 30) {return 'Monthly Master! Incredible dedication.';}
  if (streakDays === 100) {return 'Century Club! You are legendary.';}
  return `${streakDays} days! Keep it going!`;
}

// ============================================================================
// Exports (types already exported above)
// ============================================================================
