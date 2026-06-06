import { act, renderHook } from '@testing-library/react-native';

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

jest.mock('../../../../features/onboarding', () => ({
  useOnboardingStore: (
    selector: (state: { completeOnboarding: typeof mockCompleteOnboarding }) => unknown,
  ) => selector({ completeOnboarding: mockCompleteOnboarding }),
}));

jest.mock('../../../../store/session-state', () => ({
  useSessionUIStore: (
    selector: (state: { showHomeHighlight: typeof mockShowHomeHighlight }) => unknown,
  ) => selector({ showHomeHighlight: mockShowHomeHighlight }),
}));

jest.mock('../../../../utils/haptics', () => ({
  triggerHaptic: jest.fn(() => Promise.resolve()),
}));

describe('useOnboardingCompletion', () => {
  beforeEach(() => {
    mockCompleteOnboarding.mockClear();
    mockShowHomeHighlight.mockClear();
    mockTrackOnboardingCompleted.mockClear();
  });

  it('completes onboarding even when the goal draft is missing', async () => {
    const { result } = renderHook(() => useOnboardingCompletion('user-1'));

    await act(async () => {
      await result.current.finishOnboarding(undefined);
    });

    expect(mockCompleteOnboarding).toHaveBeenCalledWith('user-1');
    expect(mockTrackOnboardingCompleted).toHaveBeenCalledWith('user-1');
    expect(mockShowHomeHighlight).toHaveBeenCalled();
  });
});
