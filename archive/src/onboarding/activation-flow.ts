/**
 * 2-Minute Activation Flow
 * Get users to their first "aha" moment in under 2 minutes
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';

// ============================================================================
// Activation Steps (Progressive Disclosure)
// ============================================================================

export const ActivationStepSchema = z.enum([
  'WELCOME',           // 0: Value prop (10 seconds)
  'MODE_SELECTOR',     // 1: Choose focus mode (30 seconds)
  'BOSS_PREVIEW',      // 2: See their first boss (20 seconds)
  'SESSION_START',     // 3: Start first session (15 seconds)
  'ACTIVE_SESSION',    // 4: In session (user decides length)
  'COMPLETION',        // 5: First reward (30 seconds)
  'RETENTION_HOOK',    // 6: Why come back tomorrow (15 seconds)
]);

export type ActivationStep = z.infer<typeof ActivationStepSchema>;

export interface ActivationContext {
  userId: string;
  currentStep: ActivationStep;
  timeInFlow: number;
  choices: {
    selectedMode?: string;
    sessionDuration?: number;
    purityScore?: number;
  };
  completed: boolean;
}

// ============================================================================
// Step Configurations
// ============================================================================

export const ACTIVATION_STEPS: Record<ActivationStep, {
  title: string;
  duration: number; // expected seconds
  goal: string;
  skipIf: (ctx: ActivationContext) => boolean;
}> = {
  WELCOME: {
    title: 'Welcome to VEX',
    duration: 10,
    goal: 'Communicate core value prop',
    skipIf: () => false, // Never skip
  },
  MODE_SELECTOR: {
    title: 'How do you focus best?',
    duration: 30,
    goal: 'User chooses their preferred mode',
    skipIf: () => false,
  },
  BOSS_PREVIEW: {
    title: 'Your First Challenge',
    duration: 20,
    goal: 'Build anticipation for the boss',
    skipIf: () => false,
  },
  SESSION_START: {
    title: 'Ready to Begin?',
    duration: 15,
    goal: 'User commits to first session',
    skipIf: () => false,
  },
  ACTIVE_SESSION: {
    title: 'Focus Mode',
    duration: 0, // Variable
    goal: 'Complete first session',
    skipIf: () => false,
  },
  COMPLETION: {
    title: 'Victory!',
    duration: 30,
    goal: 'Celebrate and show rewards',
    skipIf: () => false,
  },
  RETENTION_HOOK: {
    title: 'See You Tomorrow',
    duration: 15,
    goal: 'Set expectation for next session',
    skipIf: (ctx) => ctx.timeInFlow > 120, // Skip if already took too long
  },
};

// ============================================================================
// Mode Selection Psychology
// ============================================================================

export const FOCUS_MODES = [
  {
    id: 'LIGHT',
    name: 'Light Focus',
    description: 'Gentle 25-min sessions with forgiveness',
    icon: '🌱',
    color: '#48BB78',
    idealFor: 'Beginners, low-energy days',
    commitment: 'Low pressure, easy wins',
  },
  {
    id: 'DEEP',
    name: 'Deep Work',
    description: 'Intense 90-min flow state',
    icon: '🧠',
    color: '#4299E1',
    idealFor: 'Complex tasks, creatives',
    commitment: 'Maximum rewards, strict rules',
  },
  {
    id: 'SPRINT',
    name: 'Quick Sprint',
    description: 'Fast 25-min burst mode',
    icon: '⚡',
    color: '#ED8936',
    idealFor: 'Quick tasks, momentum building',
    commitment: 'Speed over perfection',
  },
] as const;

export function suggestMode(userTraits: {
  selfDescribedAs: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  taskComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
}): typeof FOCUS_MODES[number] {
  // Beginners -> Light Focus
  if (userTraits.selfDescribedAs === 'BEGINNER') {
    return FOCUS_MODES[0];
  }

  // Low energy -> Light Focus
  if (userTraits.energyLevel === 'LOW') {
    return FOCUS_MODES[0];
  }

  // Complex tasks -> Deep Work
  if (userTraits.taskComplexity === 'COMPLEX' && userTraits.energyLevel === 'HIGH') {
    return FOCUS_MODES[1];
  }

  // Default to Sprint (most popular)
  return FOCUS_MODES[2];
}

// ============================================================================
// First Boss (Calibrated for Success)
// ============================================================================

export interface FirstBossConfig {
  name: string;
  avatar: string;
  health: number;
  weakness: string;
  encouragement: string[];
}

export const FIRST_BOSS: FirstBossConfig = {
  name: 'Procrastination Phantom',
  avatar: 'phantom_boss.png',
  health: 100, // Very low health for first boss
  weakness: 'Any focused attention',
  encouragement: [
    'You\'re doing great! Keep going!',
    'The phantom is weakening!',
    'Your focus is powerful!',
    'Almost there! Push through!',
  ],
};

// ============================================================================
// Completion Celebration
// ============================================================================

export function generateFirstCompletion(userChoices: {
  duration: number;
  mode: string;
}): {
  title: string;
  subtitle: string;
  coinsEarned: number;
  xpEarned: number;
  nextStep: string;
} {
  const baseCoins = 100;
  const bonus = userChoices.duration > 25 ? 50 : 0;

  return {
    title: 'First Victory!',
    subtitle: `You defeated the ${FIRST_BOSS.name} in ${userChoices.duration} minutes!`,
    coinsEarned: baseCoins + bonus,
    xpEarned: 50 + Math.floor(userChoices.duration / 2),
    nextStep: 'Come back tomorrow to start your streak',
  };
}

// ============================================================================
// Retention Hooks (Why come back)
// ============================================================================

export function generateRetentionHook(userState: {
  hasStreak: boolean;
  joinedSquad: boolean;
  hasFriends: boolean;
}): {
  hook: string;
  promise: string;
  reward: string;
} {
  if (!userState.hasStreak) {
    return {
      hook: 'Tomorrow: Start Your Streak',
      promise: '7-day streaks unlock 2x rewards',
      reward: 'Daily bonus: +100 coins for logging in',
    };
  }

  if (!userState.joinedSquad) {
    return {
      hook: 'Join a Squad Tomorrow',
      promise: 'Squad members are 3x more likely to stick with it',
      reward: 'Squad raids start at 8am, 2pm, 8pm',
    };
  }

  return {
    hook: 'Your Daily Dungeon Awaits',
    promise: 'A new boss appears every 24 hours',
    reward: 'First defeat guarantees a rare drop',
  };
}

// ============================================================================
// Abandonment Recovery (If they quit early)
// ============================================================================

export function abandonmentRecovery(step: ActivationStep, timeSpent: number): {
  shouldIntercept: boolean;
  message: string;
  incentive: string;
} {
  // If they're about to quit during session setup
  if (step === 'MODE_SELECTOR' && timeSpent > 45) {
    return {
      shouldIntercept: true,
      message: 'Wait! You\'re 30 seconds from your first victory',
      incentive: 'Start now and get +50 bonus coins',
    };
  }

  // If they're about to quit during boss preview
  if (step === 'BOSS_PREVIEW' && timeSpent > 20) {
    return {
      shouldIntercept: true,
      message: 'The boss is already weakened!',
      incentive: 'One quick session is all it takes',
    };
  }

  return { shouldIntercept: false, message: '', incentive: '' };
}

// ============================================================================
// Activation Analytics
// ============================================================================

export interface ActivationMetrics {
  stepReached: ActivationStep;
  timeToComplete: number;
  dropOffStep?: ActivationStep;
  chosenMode: string;
  completed: boolean;
}

export function trackActivation(metrics: ActivationMetrics): void {
  // Track funnel for optimization
  // A/B test: Which mode selector increases completion?
  // Target: 80% reach session start, 60% complete

  if (!metrics.completed && metrics.dropOffStep) {
    Sentry.addBreadcrumb({
      category: 'onboarding',
      message: `[Activation Drop-off] step: ${metrics.dropOffStep}, time: ${metrics.timeToComplete}`,
      level: 'warning',
    });
  }

  if (metrics.completed) {
    Sentry.addBreadcrumb({
      category: 'onboarding',
      message: `[Activation Success] time: ${metrics.timeToComplete}, mode: ${metrics.chosenMode}`,
      level: 'info',
    });
  }
}
