import { renderHook } from '@testing-library/react-native';
import { useSessionCompleteController } from '../hooks';
import { createSessionSummary } from './ledger-test-utils';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ getParent: () => null, goBack: jest.fn() }),
}));
jest.mock('../../../theme/ThemeContext', () => ({
  useTheme: () => ({ theme: { colors: { semantic: { primary: '#000000' } } } }),
}));
jest.mock('../../../store', () => ({
  useAuthStore: (select: (state: { user: { id: string } | null }) => unknown) =>
    select({ user: { id: '550e8400-e29b-41d4-a716-446655440000' } }),
}));
jest.mock('../completion-repair-hook', () => ({
  useCompletionRewardRepair: () => ({
    applyCompletionRewards: jest.fn(async () => undefined),
    rewardCreditError: null,
    rewardCreditStatus: 'success',
  }),
}));

describe('session completion controller next action', () => {
  it('exposes a personalized session setup action after completion', async () => {
    const summary = createSessionSummary({
      userId: '550e8400-e29b-41d4-a716-446655440000',
    });
    const { result } = await renderHook(() =>
      useSessionCompleteController({ sessionId: summary.sessionId, summary }),
    );

    expect(result.current.nextAction).toMatchObject({
      ctaLabel: expect.any(String),
      routeParams: {
        presetMode: expect.any(String),
        recommendationId: `${summary.sessionId}:next-focus`,
        suggestedDifficulty: expect.any(String),
        suggestedDurationSeconds: expect.any(Number),
      },
    });
  });
});
