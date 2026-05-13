import { eventBus } from "../../events";


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

export function getOnboardingState(userId: string): OnboardingState | null {
  return onboardingStates.get(userId) || null;
}

export function advanceStep(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {
    return null;
  }

  const stepOrder: OnboardingStep[] = ['WELCOME', 'QUICK_START', 'FIRST_SESSION', 'POST_SESSION', 'HOME_INTRO', 'FEATURE_UNLOCK', 'COMPLETE'];

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

export function skipToFirstSession(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {
    return null;
  }

  state.skippedCustomization = true;
  state.currentStep = 'FIRST_SESSION';

  eventBus.publish('onboarding:skipped', { userId, step: 'CUSTOMIZATION', timestamp: Date.now() });

  return state;
}

export function recordSession(userId: string, durationMinutes: number): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) {
    return null;
  }

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

export function markFeatureIntroduced(userId: string, featureId: string): void {
  const state = onboardingStates.get(userId);
  if (!state) {
    return;
  }

  const feature = state.unlockedFeatures.find((f) => f.featureId === featureId);
  if (feature) {
    feature.introduced = true;
  }
}

export const STEP_CONTENT: Record<OnboardingStep, StepContent> = {
  WELCOME: {
    step: 'WELCOME',
    title: 'Welcome to Focus',
    subtitle: 'Your journey to better productivity starts here',
    primaryAction: "Let's Get Started",
    secondaryAction: 'Skip Tutorial',
    showSkip: true,
    content: 'We help you build focus habits through engaging sessions, boss battles, and study plans. Ready to focus?',
  },
  QUICK_START: {
    step: 'QUICK_START',
    title: 'Quick Start',
    subtitle: 'How would you like to begin?',
    primaryAction: 'Start 15-min Session',
    secondaryAction: 'Customize First',
    showSkip: false,
    content: 'You can jump right into a 15-minute focus session, or customize your experience first. What feels right?',
  },
  FIRST_SESSION: {
    step: 'FIRST_SESSION',
    title: 'Your First Session',
    subtitle: '15 minutes of focused work',
    primaryAction: 'Start Focusing',
    showSkip: false,
    content: 'Pick one task to focus on. We will guide you through 15 minutes of distraction-free work. You have got this!',
  },
  POST_SESSION: {
    step: 'POST_SESSION',
    title: 'Great Job! 🎉',
    subtitle: 'You completed your first session',
    primaryAction: 'Set a Goal',
    secondaryAction: 'Explore Home',
    showSkip: true,
    content: 'That is one session toward building your focus habit. Want to set a goal, or explore what is next?',
  },
  HOME_INTRO: {
    step: 'HOME_INTRO',
    title: 'Your Home Screen',
    subtitle: 'Everything you need, right here',
    primaryAction: 'Got It',
    showSkip: false,
    content: 'Your Home shows personalized recommendations based on your activity. The AI Coach suggests what to focus on next.',
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