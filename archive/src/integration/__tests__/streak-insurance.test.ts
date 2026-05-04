import { eventBus } from '../../events';
import { consumeInsurance } from '../../features/economy/StreakInsurance';
import { restoreStreak } from '../../features/streaks/service';
import { initializeStreakInsuranceIntegration } from '../streak-insurance';

jest.mock('../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  },
}));

jest.mock('../../features/economy/StreakInsurance', () => ({
  consumeInsurance: jest.fn(),
}));

jest.mock('../../features/streaks/service', () => ({
  restoreStreak: jest.fn(),
}));

describe('initializeStreakInsuranceIntegration', () => {
  const mockedEventBus = jest.mocked(eventBus);
  const mockedConsumeInsurance = jest.mocked(consumeInsurance);
  const mockedRestoreStreak = jest.mocked(restoreStreak);

  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventBus.subscribe.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
  });

  it('auto-restores a broken streak when active insurance is consumed', async () => {
    cleanup = initializeStreakInsuranceIntegration();

    const handler = mockedEventBus.subscribe.mock.calls[0]?.[1];
    mockedConsumeInsurance.mockResolvedValue({
      success: true,
      restoredDays: 13,
      error: null,
    });
    mockedRestoreStreak.mockResolvedValue(true);

    await handler?.({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      previousStreak: 14,
    });

    expect(mockedConsumeInsurance).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      streakToRestore: 13,
    });
    expect(mockedRestoreStreak).toHaveBeenCalledWith({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      targetDays: 13,
      source: 'PURCHASE',
    });
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      'analytics:track',
      expect.objectContaining({
        event: 'streak_insurance_auto_restored',
      }),
    );
  });

  it('does not restore when no insurance is available', async () => {
    cleanup = initializeStreakInsuranceIntegration();

    const handler = mockedEventBus.subscribe.mock.calls[0]?.[1];
    mockedConsumeInsurance.mockResolvedValue({
      success: false,
      restoredDays: null,
      error: 'No insurance found',
    });

    await handler?.({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      previousStreak: 8,
    });

    expect(mockedRestoreStreak).not.toHaveBeenCalled();
  });
});
