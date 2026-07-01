/**
 * Streak Flow E2E Tests
 *
 * Critical path: consecutive completed sessions update streak UI and risk states.
 */
import { by, element, expect, device } from 'detox';
import { safeTap, takeScreenshot, testID, waitForVisible } from '../utils/test-helpers';

describe('Streak Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('tracks streak progress across repeated completions', async () => {
    await waitForVisible(by.id(testID.homeTab));
    await expect(element(by.id('streakCounter'))).toBeVisible();

    await safeTap(by.id(testID.startSessionButton));
    await waitForVisible(by.id('sessionSetupScreen'));
    await safeTap(by.id('duration-5'));
    await safeTap(by.id('confirmStartButton'));
    await waitForVisible(by.id('activeSessionScreen'));
    await safeTap(by.id('completeEarlyButton'));

    await waitForVisible(by.id('sessionCompleteScreen'));
    await expect(element(by.id('completionStreakUpdate'))).toBeVisible();
    await takeScreenshot('streak-flow-day-two');

    await safeTap(by.id('returnHomeButton'));
    await waitForVisible(by.id(testID.homeTab));
    await expect(element(by.id('streakRiskWarning'))).toBeVisible();
    await expect(element(by.id('streakFlameAnimation'))).toBeVisible();
  });
});
