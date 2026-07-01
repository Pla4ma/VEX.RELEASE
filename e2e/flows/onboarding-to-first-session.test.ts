/**
 * Onboarding To First Session E2E Tests
 *
 * Critical path: fresh install -> onboarding -> first focus session entry.
 */
import { by, element, expect, device } from 'detox';
import { safeTap, takeScreenshot, testID, waitForVisible } from '../utils/test-helpers';

describe('Onboarding To First Session', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true, newInstance: true });
  });

  it('guides a new user into the first session', async () => {
    await waitForVisible(by.id('welcomeScreen'));
    await safeTap(by.id('getStartedButton'));

    await waitForVisible(by.id('onboardingGoals'));
    await safeTap(by.id('goal-focus'));
    await safeTap(by.id('continueButton'));

    await waitForVisible(by.id('onboardingExperience'));
    await safeTap(by.id('experience-beginner'));
    await safeTap(by.id('continueButton'));

    await waitForVisible(by.id('onboardingNotifications'));
    await safeTap(by.id('skipNotificationsButton'));

    await waitForVisible(by.id(testID.homeTab));
    await expect(element(by.id('firstSessionOverlay'))).toBeVisible();
    await expect(element(by.id('coachWelcomeMessage'))).toBeVisible();
    await expect(element(by.id('companionAvatar'))).toBeVisible();

    await safeTap(by.id(testID.startSessionButton));
    await waitForVisible(by.id('sessionSetupScreen'));
    await takeScreenshot('onboarding-first-session');
  });
});
