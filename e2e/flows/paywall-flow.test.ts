/**
 * Paywall Flow E2E Tests
 *
 * Critical path: free user enters premium gate, cancels, and free app remains usable.
 */
import { by, element, expect, device } from 'detox';
import { safeTap, takeScreenshot, testID, waitForVisible } from '../utils/test-helpers';

describe('Paywall Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('shows premium gate and returns to free features after cancel', async () => {
    await waitForVisible(by.id(testID.homeTab));
    await safeTap(by.id('advancedAiCoachCard'));

    await waitForVisible(by.id('paywallScreen'));
    await expect(element(by.id('annualPlan'))).toBeVisible();
    await expect(element(by.id('monthlyPlan'))).toBeVisible();
    await takeScreenshot('paywall-flow-gate');

    await safeTap(by.id('paywallCloseButton'));
    await waitForVisible(by.id(testID.homeTab));
    await expect(element(by.id(testID.startSessionButton))).toBeVisible();
  });
});
