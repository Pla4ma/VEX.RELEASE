import { eventBus } from "../../events";
import { launchColors } from "@theme/tokens/launch-colors";

export type OnboardingStep =
  | "WELCOME"
  | "QUICK_START"
  | "FIRST_SESSION"
  | "POST_SESSION"
  | "HOME_INTRO"
  | "FEATURE_UNLOCK"
  | "COMPLETE";

export interface OnboardingState {
  userId: string;
  currentStep: OnboardingStep;
  sessionsCompleted: number;
  firstSessionAt: number | null;
  skippedCustomization: boolean;
  completedAt: number | null;
  unlockedFeatures: UnlockedFeature[];
  nextFeatureUnlock: FeatureUnlockGate | null;
  preferences: Partial<UserPreferences>;
}

export interface UserPreferences {
  focusDuration: number;
  notificationsEnabled: boolean;
  primaryGoal: string;
  interestedFeatures: string[];
}

export interface UnlockedFeature {
  featureId: string;
  featureName: string;
  unlockedAt: number;
  introduced: boolean;
}

export interface FeatureUnlockGate {
  featureId: string;
  featureName: string;
  description: string;
  requiresSessions: number;
  icon: string;
  color: string;
}

/**
 * Lane-specific feature unlock gates — no game economy references.
 * Study, Run, Project, and Clean unlock progressively as sessions accumulate.
 * "What VEX Learned" (memory) unlocks after session 3.
 */
export const FEATURE_UNLOCK_GATES: FeatureUnlockGate[] = [
  {
    featureId: "clean_today_strip",
    featureName: "Today Strip",
    description: "See today's planned sessions at a glance",
    requiresSessions: 2,
    icon: "📋",
    color: launchColors.hex_48bb78,
  },
  {
    featureId: "study_intelligence",
    featureName: "Study Intelligence",
    description: "Review, recall, and study plan support",
    requiresSessions: 3,
    icon: "📚",
    color: launchColors.hex_4299e1,
  },
  {
    featureId: "what_vex_learned",
    featureName: "What VEX Learned",
    description: "VEX remembers your patterns — edit or hide anything",
    requiresSessions: 3,
    icon: "🧠",
    color: launchColors.hex_9f7aea,
  },
  {
    featureId: "focus_run",
    featureName: "Focus Run",
    description: "Run-style sessions with personal blockers",
    requiresSessions: 4,
    icon: "🏃",
    color: launchColors.hex_e53e3e,
  },
  {
    featureId: "project_thread",
    featureName: "Project Thread",
    description: "Resume project context and next moves",
    requiresSessions: 5,
    icon: "🧵",
    color: launchColors.hex_38b2ac,
  },
  {
    featureId: "coach_evolution",
    featureName: "Coach Evolution",
    description: "Coach adapts tone and timing to your rhythm",
    requiresSessions: 8,
    icon: "🤖",
    color: launchColors.hex_ed8936,
  },
];

const onboardingStates = new Map<string, OnboardingState>();

export function initializeOnboarding(userId: string): OnboardingState {
  const state: OnboardingState = {
    userId,
    currentStep: "WELCOME",
    sessionsCompleted: 0,
    firstSessionAt: null,
    skippedCustomization: false,
    completedAt: null,
    unlockedFeatures: [],
    nextFeatureUnlock: FEATURE_UNLOCK_GATES[0] ?? null,
    preferences: { focusDuration: 15, notificationsEnabled: true },
  };
  onboardingStates.set(userId, state);
  eventBus.publish("onboarding:started", { userId });
  return state;
}

export function getOnboardingState(userId: string): OnboardingState | null {
  return onboardingStates.get(userId) || null;
}

export function advanceStep(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  const stepOrder: OnboardingStep[] = [
    "WELCOME",
    "QUICK_START",
    "FIRST_SESSION",
    "POST_SESSION",
    "HOME_INTRO",
    "FEATURE_UNLOCK",
    "COMPLETE",
  ];
  const currentIndex = stepOrder.indexOf(state.currentStep);
  if (currentIndex < stepOrder.length - 1) {
    state.currentStep = stepOrder[currentIndex + 1]!;
  }
  if (state.currentStep === "COMPLETE") {
    state.completedAt = Date.now();
    eventBus.publish("onboarding:completed", { userId });
  } else {
    eventBus.publish("onboarding:step_changed", { userId, step: state.currentStep });
  }
  return state;
}

export function skipToFirstSession(userId: string): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  state.skippedCustomization = true;
  state.currentStep = "FIRST_SESSION";
  eventBus.publish("onboarding:skipped", { userId, step: "CUSTOMIZATION", timestamp: Date.now() });
  return state;
}

export function recordSession(
  userId: string,
  durationMinutes: number,
): OnboardingState | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  state.sessionsCompleted += 1;
  if (!state.firstSessionAt) {
    state.firstSessionAt = Date.now();
    state.currentStep = "POST_SESSION";
    eventBus.publish("onboarding:first_session_complete", { userId, durationMinutes });
  }
  checkFeatureUnlocks(state);
  return state;
}

function checkFeatureUnlocks(state: OnboardingState): void {
  for (const gate of FEATURE_UNLOCK_GATES) {
    if (state.unlockedFeatures.some((f) => f.featureId === gate.featureId)) continue;
    if (state.sessionsCompleted >= gate.requiresSessions) {
      const unlocked: UnlockedFeature = {
        featureId: gate.featureId,
        featureName: gate.featureName,
        unlockedAt: Date.now(),
        introduced: false,
      };
      state.unlockedFeatures.push(unlocked);
      const nextIndex = FEATURE_UNLOCK_GATES.findIndex((g) => g.featureId === gate.featureId) + 1;
      state.nextFeatureUnlock =
        nextIndex < FEATURE_UNLOCK_GATES.length ? (FEATURE_UNLOCK_GATES[nextIndex] ?? null) : null;
      eventBus.publish("onboarding:feature_unlocked", {
        userId: state.userId,
        feature: gate.featureId,
        featureId: gate.featureId,
        timestamp: Date.now(),
      });
    }
  }
}

export function markFeatureIntroduced(userId: string, featureId: string): void {
  const state = onboardingStates.get(userId);
  if (!state) return;
  const feature = state.unlockedFeatures.find((f) => f.featureId === featureId);
  if (feature) feature.introduced = true;
}

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
    step: "WELCOME",
    title: "Welcome to VEX",
    subtitle: "The productivity app that changes based on how you work",
    primaryAction: "Let's Get Started",
    secondaryAction: "Skip Tutorial",
    showSkip: true,
    content:
      "VEX learns your rhythm, then unlocks the right system — Study, Run, Project, or Clean. Start with one focused session.",
  },
  QUICK_START: {
    step: "QUICK_START",
    title: "Match Your Style",
    subtitle: "How would you like VEX to adapt?",
    primaryAction: "Start 15-min Session",
    secondaryAction: "Customize First",
    showSkip: false,
    content:
      "You can jump right into a 15-minute focus session, or answer a few questions so VEX can match your lane. What feels right?",
  },
  FIRST_SESSION: {
    step: "FIRST_SESSION",
    title: "Your First Session",
    subtitle: "15 minutes of focused work",
    primaryAction: "Start Focusing",
    showSkip: false,
    content:
      "Pick one task to focus on. VEX will guide you through 15 minutes of distraction-free work. You got this.",
  },
  POST_SESSION: {
    step: "POST_SESSION",
    title: "First Session Done",
    subtitle: "VEX is learning your rhythm",
    primaryAction: "See Next Move",
    secondaryAction: "Explore Home",
    showSkip: true,
    content:
      "One session down. VEX observed how you worked and will get smarter with each one. Want to see your next move or explore Home?",
  },
  HOME_INTRO: {
    step: "HOME_INTRO",
    title: "Your Home",
    subtitle: "The right next session, every time",
    primaryAction: "Got It",
    showSkip: false,
    content:
      "Home shows your lane and the right next session. No dashboard clutter — just what helps you start.",
  },
  FEATURE_UNLOCK: {
    step: "FEATURE_UNLOCK",
    title: "Something New Unlocked",
    subtitle: "VEX adapts as you go",
    primaryAction: "Try It Out",
    secondaryAction: "Later",
    showSkip: true,
    content: "New systems unlock as VEX learns your rhythm. Keep going to discover more.",
  },
  COMPLETE: {
    step: "COMPLETE",
    title: "You're All Set",
    subtitle: "VEX will keep adapting",
    primaryAction: "Start Focusing",
    showSkip: false,
    content:
      "VEX now has enough signal to recommend the right session and adapt over time. Start your next one whenever you are ready.",
  },
};

export function getStepContent(state: OnboardingState): StepContent {
  const content = STEP_CONTENT[state.currentStep];
  if (state.currentStep === "FEATURE_UNLOCK" && state.unlockedFeatures.length > 0) {
    const latest = state.unlockedFeatures[state.unlockedFeatures.length - 1]!;
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

export interface OnboardingProgress {
  stepNumber: number;
  totalSteps: number;
  percentComplete: number;
  currentStep: OnboardingStep;
  sessionsToNextFeature: number | null;
  nextFeatureName: string | null;
}

export function getOnboardingProgress(userId: string): OnboardingProgress | null {
  const state = onboardingStates.get(userId);
  if (!state) return null;
  const stepOrder: OnboardingStep[] = [
    "WELCOME",
    "QUICK_START",
    "FIRST_SESSION",
    "POST_SESSION",
    "HOME_INTRO",
    "FEATURE_UNLOCK",
    "COMPLETE",
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

export function shouldShowOnboarding(userId: string): boolean {
  const state = onboardingStates.get(userId);
  if (!state) return true;
  if (state.completedAt) return false;
  const unintroduced = state.unlockedFeatures.filter((f) => !f.introduced);
  if (unintroduced.length > 0) {
    state.currentStep = "FEATURE_UNLOCK";
    return true;
  }
  return true;
}

export function isFeatureAvailable(
  userId: string,
  featureId: string,
  defaultAvailable: boolean = false,
): boolean {
  const state = onboardingStates.get(userId);
  if (!state) return defaultAvailable;
  return state.unlockedFeatures.some((f) => f.featureId === featureId);
}

export function getAvailableFeatures(userId: string): UnlockedFeature[] {
  const state = onboardingStates.get(userId);
  if (!state) return [];
  return state.unlockedFeatures;
}

export function getNextFeatureUnlock(userId: string): FeatureUnlockGate | null {
  const state = onboardingStates.get(userId);
  if (!state) return FEATURE_UNLOCK_GATES[0] ?? null;
  return state.nextFeatureUnlock;
}
