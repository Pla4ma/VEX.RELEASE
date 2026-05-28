import type { OnboardingStore } from "./store";
import type { OnboardingState } from "./schemas";
import { createProfileActions } from "./store-actions-profile";
import { createNavigationActions } from "./store-actions-navigation";

export function createStoreActions(
  set: (partial: Partial<OnboardingStore>) => void,
  get: () => OnboardingStore,
): Omit<OnboardingStore, keyof OnboardingState> {
  return {
    ...createProfileActions(set, get),
    ...createNavigationActions(set, get),
  };
}
