/**
 * Session Flow E2E Tests
 *
 * Critical path: home -> focus setup -> active session -> completion rewards.
 */
import { by, element, expect, device } from 'detox';
import { safeTap, takeScreenshot, testID, waitForAnimation, waitForVisible } from '../utils/test-helpers';

describe('Session Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('completes a short focus session and shows rewards', async () => {
    await waitForVisible(by.id(testID.homeTab));
    await safeTap(by.id(testID.startSessionButton));

    await waitForVisible(by.id('sessionSetupScreen'));
    await safeTap(by.id('mode-light-focus'));
    await safeTap(by.id('duration-5'));
    await safeTap(by.id('confirmStartButton'));

    await waitForVisible(by.id('activeSessionScreen'));
    await expect(element(by.id(testID.sessionTimer))).toBeVisible();
    await takeScreenshot('session-flow-active');

    await waitForAnimation(1000);
    await safeTap(by.id('completeEarlyButton'));

    await waitForVisible(by.id('sessionCompleteScreen'));
    await expect(element(by.id('completionXpAward'))).toBeVisible();
    await expect(element(by.id('completionStreakUpdate'))).toBeVisible();
    await expect(element(by.id('coachPostSessionMessage'))).toBeVisible();
    await takeScreenshot('session-flow-complete');
  });
});
