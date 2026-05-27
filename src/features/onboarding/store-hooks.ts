import { useOnboardingStore } from "./store";

export function useOnboardingProgress(): {
  stepNumber: number;
  totalSteps: number;
  percentComplete: number;
  canSkip: boolean;
  isComplete: boolean;
} {
  const store = useOnboardingStore();
  const totalSteps = 5;
  const percentComplete = ((store.currentStep + 1) / totalSteps) * 100;

  return {
    stepNumber: store.currentStep + 1,
    totalSteps,
    percentComplete,
    canSkip: store.currentStep >= 1,
    isComplete: store.isOnboarded,
  };
}

export function useNeedsOnboarding(): boolean {
  const { isOnboarded } = useOnboardingStore();
  return !isOnboarded;
}
