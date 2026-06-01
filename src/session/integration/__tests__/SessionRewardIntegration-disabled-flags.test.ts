import {
  SessionRewardIntegration,
  eventBus,
  createMockSummary,
} from './SessionRewardIntegration-disabled.helpers';

describe('SessionRewardIntegration - disabled (all flags false)', () => {
  const mockedEventBus = jest.mocked(eventBus);
  const helpers = jest.requireMock('../session-reward-helpers');

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventBus.subscribe.mockReturnValue(jest.fn());
  });

  it('should NOT subscribe to any event when fully disabled', () => {
    void new SessionRewardIntegration({
      autoGrantRewards: false,
      autoUpdateStreak: false,
      autoAddXP: false,
      autoCreateSocialActivity: false,
      enableSeasonChallengeProgress: false,
      autoUpdateAnalytics: false,
      enableAchievementChecks: false,
      enableMilestoneTracking: false,
      autoHandleRecoveryRewards: false,
      autoHandleAbandonmentPartialCredit: false,
    });

    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });

  it('should deduplicate via in-memory Set when enabled', async () => {
    void new SessionRewardIntegration({
      autoGrantRewards: true,
      autoUpdateStreak: true,
      autoAddXP: true,
      autoCreateSocialActivity: true,
      enableSeasonChallengeProgress: true,
      autoUpdateAnalytics: true,
      enableAchievementChecks: true,
      enableMilestoneTracking: true,
    });

    const handler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === 'session:completed',
    )?.[1];

    const event = {
      sessionId: 'test-session-id',
      userId: 'test-user-id',
      summary: createMockSummary(),
    };

    await handler?.(event);

    const firstCallCount = helpers.calculateRewards.mock.calls.length;

    await handler?.(event);

    expect(helpers.calculateRewards).toHaveBeenCalledTimes(firstCallCount);
  });
});
