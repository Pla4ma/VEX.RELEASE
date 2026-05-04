/**
 * Progressive Onboarding System
 *
 * Phase 5.3 - Onboarding Refinement
 * Gets users to first session faster with progressive feature unlocks
 *
 * New Flow:
 * 1. Welcome (1 screen) - Value prop, "Let's get you focused"
 * 2. Quick Start (optional) - Skip to generic session, or customize
 * 3. First Session (core) - 15-min default, simple UI
 * 4. Post-Session - Celebration + "Want to set a goal?" (optional)
 * 5. Home Introduction - Explain recommendation engine
 * 6. AI Study Intro - Optional, after 3+ sessions
 *
 * Progressive Feature Unlock:
 * - Session 1-3: Basic focus only
 * - Session 4: Boss introduced
 * - Session 5: AI Study plans available
 * - Session 7: Squads unlocked
 * - Session 10: Advanced features visible
 *
 * Dependencies:
 * - Onboarding (existing)
 * - Sessions (first session tracking)
 * - Home (recommendation intro)
 * - Content Study (AI unlock)
 * - Squads (squad unlock)
 * - Boss (boss unlock)
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================

export type OnboardingStep =
  | 'WELCOME'
  | 'QUICK_START'
  | 'FIRST_SESSION'
  | 'POST_SESSION'
  | 'HOME_INTRO'
  | 'FEATURE_UNLOCK'
  | 'COMPLETE';

export interface OnboardingState {
  userId: string;
  currentStep: OnboardingStep;
  sessionsCompleted: number;
  firstSessionAt: number | null;
  skippedCustomization: boolean;
  completedAt: number | null;

  // Feature unlock tracking
  unlockedFeatures: UnlockedFeature[];
  nextFeatureUnlock: FeatureUnlockGate | null;

  // Preferences (collected progressively)
  preferences: Partial<UserPreferences>;
}

export interface UserPreferences {
  focusDuration: number; // Default session length
  notificationsEnabled: boolean;
  primaryGoal: string;
  interestedFeatures: string[];
}

export interface UnlockedFeature {
  featureId: string;
  featureName: string;
  unlockedAt: number;
  introduced: boolean; // Has user seen the introduction
}

export interface FeatureUnlockGate {
  featureId: string;
  featureName: string;
  description: string;
  requiresSessions: number;
  icon: string;
  color: string;
}

// ============================================================================
// Feature Unlock Gates
// ============================================================================

export const FEATURE_UNLOCK_GATES: FeatureUnlockGate[] = [
  {
    featureId: 'boss_battles',
    featureName: 'Boss Battles',
    description: 'Defeat bosses representing your productivity challenges',
    requiresSessions: 4,
    icon: '⚔️',
    color: '#E53E3E',
  },
  {
    featureId: 'ai_study_plans',
    featureName: 'AI Study Plans',
    description: 'AI-generated study plans for any topic you want to learn',
    requiresSessions: 5,
    icon: '📚',
    color: '#4299E1',
  },
  {
    featureId: 'squads',
    featureName: 'Squads',
    description: 'Join accountability groups and tackle challenges together',
    requiresSessions: 7,
    icon: '👥',
    color: '#48BB78',
  },
  {
    featureId: 'advanced_analytics',
    featureName: 'Study Analytics',
    description: 'Track your progress and optimize your learning patterns',
    requiresSessions: 10,
    icon: '📊',
    color: '#9F7AEA',
  },
  {
    featureId: 'streak_protection',
    featureName: 'Streak Protection',
    description: 'Protect your streak with insurance when life gets busy',
    requiresSessions: 14,
    icon: '🛡️',
    color: '#ED8936',
  },
  {
    featureId: 'coach_personality',
    featureName: 'Coach Personality',
    description: 'Choose your AI coach personality: Mentor, Trainer, Peer, or Professor',
    requiresSessions: 20,
    icon: '🤖',
    color: '#38B2AC',
  },
];

// ============================================================================
// Onboarding Flow State Management
// ============================================================================

const onboardingStates = new Map<string, OnboardingState>();

/**
 * Initialize onboarding for new user
 */
export function initializeOnboarding(userId: string): OnboardingState {
  const state: OnboardingState = {
    userId,
    currentStep: 'WELCOME',
    sessionsCompleted: 0,
    firstSessionAt: null,
    skippedCustomization: false,
    completedAt: null,
    unlockedFeatures: [],
    nextFeatureUnlock: FEATURE_UNLOCK_GATES[0],
    preferences: {
      focusDuration: 15, // Default 15 minutes
      notificationsEnabled: true,
    },
  };

  onboardingStates.set(userId, state);

  eventBus.publish('onboarding:started', { userId });

  return state;
}

/**
 * Get onboarding state
 */
export function getOnboardingState(userId: string): OnboardingState | null {
  return onboardingStates.get(userId) || null;
}

/**
 * Advance to next step
 */
export function advanceStep(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}

  const stepOrder: OnboardingStep[] = [
    'WELCOME',
    'QUICK_START',
    'FIRST_SESSION',
    'POST_SESSION',
    'HOME_INTRO',
    'FEATURE_UNLOCK',
    'COMPLETE',
  ];

  const currentIndex = stepOrder.indexOf(state.currentStep);
  if (currentIndex < stepOrder.length - 1) {
    state.currentStep = stepOrder[currentIndex + 1];
  }

  if (state.currentStep === 'COMPLETE') {
    state.completedAt = Date.now();
    eventBus.publish('onboarding:completed', { userId });
  } else {
    eventBus.publish('onboarding:step_changed', {
      userId,
      step: state.currentStep,
    });
  }

  return state;
}

/**
 * Skip to first session (skip customization)
 */
export function skipToFirstSession(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}

  state.skippedCustomization = true;
  state.currentStep = 'FIRST_SESSION';

  eventBus.publish('onboarding:skipped', { userId, step: 'CUSTOMIZATION', timestamp: Date.now() });

  return state;
}

/**
 * Record session completion
 */
export function recordSession(userId: string, durationMinutes: number): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}

  state.sessionsCompleted += 1;

  if (!state.firstSessionAt) {
    state.firstSessionAt = Date.now();
    state.currentStep = 'POST_SESSION';
    eventBus.publish('onboarding:first_session_complete', { userId, durationMinutes });
  }

  // Check for feature unlocks
  checkFeatureUnlocks(state);

  return state;
}

/**
 * Check and unlock features based on session count
 */
function checkFeatureUnlocks(state: OnboardingState): void {
  for (const gate of FEATURE_UNLOCK_GATES) {
    // Skip if already unlocked
    if (state.unlockedFeatures.some((f) => f.featureId === gate.featureId)) {
      continue;
    }

    // Check if requirements met
    if (state.sessionsCompleted >= gate.requiresSessions) {
      // Unlock feature
      const unlocked: UnlockedFeature = {
        featureId: gate.featureId,
        featureName: gate.featureName,
        unlockedAt: Date.now(),
        introduced: false,
      };

      state.unlockedFeatures.push(unlocked);

      // Update next unlock
      const nextIndex = FEATURE_UNLOCK_GATES.findIndex((g) => g.featureId === gate.featureId) + 1;
      state.nextFeatureUnlock = nextIndex < FEATURE_UNLOCK_GATES.length ? FEATURE_UNLOCK_GATES[nextIndex] : null;

      eventBus.publish('onboarding:feature_unlocked', {
        userId: state.userId,
        feature: gate.featureId,
        featureId: gate.featureId,
        timestamp: Date.now(),
      });
    }
  }
}

/**
 * Mark feature as introduced (user has seen the introduction)
 */
export function markFeatureIntroduced(userId: string, featureId: string): void {
  const state = onboardingStates.get(userId);
  if (!state) {return;}

  const feature = state.unlockedFeatures.find((f) => f.featureId === featureId);
  if (feature) {
    feature.introduced = true;
  }
}

// ============================================================================
// Step Content
// ============================================================================

export interface StepContent {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  primaryAction: string;
  secondaryAction?: string;
  showSkip?: boolean;
  content: string;
}

export const STEP_CONTENT: Record<OnboardingStep, StepContent> = {
  WELCOME: {
    step: 'WELCOME',
    title: 'Welcome to Focus',
    subtitle: 'Your journey to better productivity starts here',
    primaryAction: "Let's Get Started",
    secondaryAction: 'Skip Tutorial',
    showSkip: true,
    content:
      'We help you build focus habits through engaging sessions, boss battles, and study plans. Ready to focus?',
  },
  QUICK_START: {
    step: 'QUICK_START',
    title: 'Quick Start',
    subtitle: 'How would you like to begin?',
    primaryAction: 'Start 15-min Session',
    secondaryAction: 'Customize First',
    showSkip: false,
    content:
      'You can jump right into a 15-minute focus session, or customize your experience first. What feels right?',
  },
  FIRST_SESSION: {
    step: 'FIRST_SESSION',
    title: 'Your First Session',
    subtitle: '15 minutes of focused work',
    primaryAction: 'Start Focusing',
    showSkip: false,
    content:
      'Pick one task to focus on. We will guide you through 15 minutes of distraction-free work. You have got this!',
  },
  POST_SESSION: {
    step: 'POST_SESSION',
    title: 'Great Job! 🎉',
    subtitle: 'You completed your first session',
    primaryAction: 'Set a Goal',
    secondaryAction: 'Explore Home',
    showSkip: true,
    content:
      'That is one session toward building your focus habit. Want to set a goal, or explore what is next?',
  },
  HOME_INTRO: {
    step: 'HOME_INTRO',
    title: 'Your Home Screen',
    subtitle: 'Everything you need, right here',
    primaryAction: 'Got It',
    showSkip: false,
    content:
      'Your Home shows personalized recommendations based on your activity. The AI Coach suggests what to focus on next.',
  },
  FEATURE_UNLOCK: {
    step: 'FEATURE_UNLOCK',
    title: 'New Feature Unlocked!',
    subtitle: 'Check out what is new',
    primaryAction: 'Try It Out',
    secondaryAction: 'Later',
    showSkip: true,
    content: 'New features unlock as you build your focus habit. Keep going to discover more!',
  },
  COMPLETE: {
    step: 'COMPLETE',
    title: 'You are All Set!',
    subtitle: 'Welcome to the community',
    primaryAction: 'Start Focusing',
    showSkip: false,
    content: 'You have completed onboarding. Your focus journey continues from here.',
  },
};

/**
 * Get content for current step
 */
export function getStepContent(state: OnboardingState): StepContent {
  const content = STEP_CONTENT[state.currentStep];

  // Customize FEATURE_UNLOCK content
  if (state.currentStep === 'FEATURE_UNLOCK' && state.unlockedFeatures.length > 0) {
    const latest = state.unlockedFeatures[state.unlockedFeatures.length - 1];
    const gate = FEATURE_UNLOCK_GATES.find((g) => g.featureId === latest.featureId);

    if (gate) {
      return {
        ...content,
        title: `${gate.icon} ${gate.featureName} Unlocked!`,
        subtitle: gate.description,
      };
    }
  }

  return content;
}

// ============================================================================
// Progress Tracking
// ============================================================================

export interface OnboardingProgress {
  stepNumber: number;
  totalSteps: number;
  percentComplete: number;
  currentStep: OnboardingStep;
  sessionsToNextFeature: number | null;
  nextFeatureName: string | null;
}

/**
 * Get onboarding progress
 */
export function getOnboardingProgress(userId: string): OnboardingProgress | null {
  const state = onboardingStates.get(userId);
  if (!state) {return null;}

  const stepOrder: OnboardingStep[] = [
    'WELCOME',
    'QUICK_START',
    'FIRST_SESSION',
    'POST_SESSION',
    'HOME_INTRO',
    'FEATURE_UNLOCK',
    'COMPLETE',
  ];

  const currentIndex = stepOrder.indexOf(state.currentStep);
  const totalSteps = stepOrder.length;

  let sessionsToNext: number | null = null;
  let nextFeature: string | null = null;

  if (state.nextFeatureUnlock) {
    sessionsToNext = state.nextFeatureUnlock.requiresSessions - state.sessionsCompleted;
    nextFeature = state.nextFeatureUnlock.featureName;
  }

  return {
    stepNumber: currentIndex + 1,
    totalSteps,
    percentComplete: Math.round(((currentIndex + 1) / totalSteps) * 100),
    currentStep: state.currentStep,
    sessionsToNextFeature: sessionsToNext,
    nextFeatureName: nextFeature,
  };
}

// ============================================================================
// Should Show Onboarding Check
// ============================================================================

/**
 * Check if user should see onboarding
 */
export function shouldShowOnboarding(userId: string): boolean {
  const state = onboardingStates.get(userId);
  if (!state) {return true;} // New user

  // Show if not complete
  if (state.completedAt) {return false;}

  // Show if has new feature to introduce
  const unintroduced = state.unlockedFeatures.filter((f) => !f.introduced);
  if (unintroduced.length > 0) {
    state.currentStep = 'FEATURE_UNLOCK';
    return true;
  }

  return true;
}

// ============================================================================
// Feature Availability
// ============================================================================

/**
 * Check if feature is available to user
 */
export function isFeatureAvailable(
  userId: string,
  featureId: string,
  defaultAvailable: boolean = false
): boolean {
  const state = onboardingStates.get(userId);
  if (!state) {return defaultAvailable;}

  // Check if unlocked
  return state.unlockedFeatures.some((f) => f.featureId === featureId);
}

/**
 * Get available features for user
 */
export function getAvailableFeatures(userId: string): UnlockedFeature[] {
  const state = onboardingStates.get(userId);
  if (!state) {return [];}
  return state.unlockedFeatures;
}

/**
 * Get next upcoming feature unlock
 */
export function getNextFeatureUnlock(userId: string): FeatureUnlockGate | null {
  const state = onboardingStates.get(userId);
  if (!state) {return FEATURE_UNLOCK_GATES[0];}
  return state.nextFeatureUnlock;
}

// ============================================================================
// Exports (types already exported above)
// ============================================================================
