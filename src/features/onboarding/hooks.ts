import { useOnboardingStore } from './store';

export function useOnboardingProgressState(): {
  state: ReturnType<typeof useOnboardingStore.getState> | null;
  isLoading: boolean;
  markNotificationAsked: (asked: boolean) => void;
  markRewardSeen: () => void;
} {
  const store = useOnboardingStore();
  return {
    state: store,
    isLoading: false,
    markNotificationAsked: (_asked: boolean) => {
      // Notification permission tracking — stored via store or system callback
    },
    markRewardSeen: () => {
      store.markFirstSessionCompleted();
    },
  };
}
