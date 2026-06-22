import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { useOnboardingCompletion } from '../useOnboardingCompletion';

const mockCompleteOnboarding = jest.fn();
const mockShowHomeHighlight = jest.fn();
const mockTrackOnboardingCompleted = jest.fn();

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('../../../../features/liveops-config', () => ({
  useDisclosureAnalytics: () => ({
    trackOnboardingCompleted: mockTrackOnboardingCompleted,
  }),
}));

jest.mock('../../../../features/onboarding/store', () => ({
  useOnboardingStore: (
    selector: (state: { completeOnboarding: typeof mockCompleteOnboarding }) => unknown,
  ) => selector({ completeOnboarding: mockCompleteOnboarding }),
}));

jest.mock('../../../../features/onboarding/hooks', () => ({
  useSyncOnboardingProgress: () => ({
    syncFromStore: jest.fn().mockResolvedValue(undefined),
    isSyncing: false,
  }),
}));

jest.mock('../../../../store/session-state', () => ({
  useSessionUIStore: (
    selector: (state: { showHomeHighlight: typeof mockShowHomeHighlight }) => unknown,
  ) => selector({ showHomeHighlight: mockShowHomeHighlight }),
}));

jest.mock('../../../../utils/haptics', () => ({
  triggerHaptic: jest.fn(() => Promise.resolve()),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useOnboardingCompletion', () => {
  beforeEach(() => {
    mockCompleteOnboarding.mockClear();
    mockShowHomeHighlight.mockClear();
    mockTrackOnboardingCompleted.mockClear();
  });

  it('completes onboarding even when the goal draft is missing', async () => {
    const { result } = renderHook(() => useOnboardingCompletion('user-1'), { wrapper });

    await act(async () => {
      await result.current.finishOnboarding(undefined);
    });

    expect(mockCompleteOnboarding).toHaveBeenCalledWith('user-1');
    expect(mockTrackOnboardingCompleted).toHaveBeenCalledWith('user-1');
    expect(mockShowHomeHighlight).toHaveBeenCalled();
  });
});
