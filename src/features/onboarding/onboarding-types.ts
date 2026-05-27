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

export interface StepContent {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  primaryAction: string;
  secondaryAction?: string;
  showSkip?: boolean;
  content: string;
}

export interface OnboardingProgress {
  stepNumber: number;
  totalSteps: number;
  percentComplete: number;
  currentStep: OnboardingStep;
  sessionsToNextFeature: number | null;
  nextFeatureName: string | null;
}
