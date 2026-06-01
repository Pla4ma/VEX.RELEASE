import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  clearBudgetStore,
  getNotificationBudgetStatus,
  maxDailyForLane,
  sendCoachNotification,
} from '../notification-budget';

describe('maxDailyForLane', () => {
  it('Clean lane gets 1/day', () => {
    expect(maxDailyForLane('minimal_normal')).toBe(1);
  });

  it('Study lane gets 2/day', () => {
    expect(maxDailyForLane('student')).toBe(2);
  });

  it('Run lane gets 2/day', () => {
    expect(maxDailyForLane('game_like')).toBe(2);
  });

  it('Project lane gets 2/day', () => {
    expect(maxDailyForLane('deep_creative')).toBe(2);
  });

  it('undefined lane defaults to 2/day', () => {
    expect(maxDailyForLane(undefined)).toBe(2);
  });
});

describe('Clean lane notification budget enforcement', () => {
  beforeEach(() => {
    jest.useRealTimers();
    clearBudgetStore();
    // Ensure we are outside quiet hours (22:00-07:00) so notifications are not blocked
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Clean lane sendCoachNotification respects 1/day budget', async () => {
    // First notification succeeds
    await expect(
      sendCoachNotification(
        'user-clean-1',
        'SESSION_SUGGESTION',
        'One clean block is enough today.',
        'COACH_NEXT_ACTION',
        'minimal_normal',
      ),
    ).resolves.toMatchObject({ success: true });

    // Second notification blocked - Clean max is 1
    await expect(
      sendCoachNotification(
        'user-clean-1',
        'SESSION_SUGGESTION',
        'Stay consistent. Another block when ready.',
        'COACH_NEXT_ACTION',
        'minimal_normal',
      ),
    ).resolves.toMatchObject({
      success: false,
      reason: 'Budget limit reached or rules violated',
    });
  });

  it('Clean lane budget status shows maxDaily 1', async () => {
    await expect(
      getNotificationBudgetStatus('user-clean-2', 'minimal_normal'),
    ).resolves.toMatchObject({ maxDaily: 1, remaining: 1 });
  });

  it('non-Clean lane budget status shows maxDaily 2', async () => {
    await expect(
      getNotificationBudgetStatus('user-study-1', 'student'),
    ).resolves.toMatchObject({ maxDaily: 2, remaining: 2 });
  });
});
