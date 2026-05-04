/**
 * Purchase Flow E2E Tests
 * 
 * Critical path: Browse → Buy → Consume premium features
 */

import { by, element, expect, device } from 'detox';
import {
  waitForVisible,
  safeTap,
  waitForLoadingComplete,
  takeScreenshot,
  scrollToElement,
} from '../utils/test-helpers';

describe('Purchase Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should display paywall from gated feature', async () => {
    // Navigate to a premium-locked feature
    await waitForVisible(by.id('homeTab'));
    await safeTap(by.id('aiCoachCard'));
    
    // Should show paywall for non-premium users
    await waitForVisible(by.id('paywallScreen'));
    await takeScreenshot('01-paywall-entry');
    
    // Verify pricing options displayed
    await expect(element(by.id('annualPlan'))).toBeVisible();
    await expect(element(by.id('monthlyPlan'))).toBeVisible();
    
    // Verify feature list
    await expect(element(by.id('feature-ai-coach'))).toBeVisible();
    await expect(element(by.id('feature-advanced-analytics'))).toBeVisible();
  });

  it('should complete subscription purchase flow', async () => {
    // Open paywall
    await safeTap(by.id('aiCoachCard'));
    await waitForVisible(by.id('paywallScreen'));
    
    // Select annual plan
    await safeTap(by.id('annualPlan'));
    await expect(element(by.id('annualPlan'))).toHaveAccessibilityState({ selected: true });
    
    // Initiate purchase
    await safeTap(by.id('upgradeButton'));
    await waitForVisible(by.id('purchaseLoading'));
    await takeScreenshot('02-purchase-loading');
    
    // In sandbox, purchase should complete
    await waitForLoadingComplete(by.id('purchaseLoading'));
    
    // Success state
    await waitForVisible(by.id('purchaseSuccess'));
    await takeScreenshot('03-purchase-success');
    
    // Continue to feature
    await safeTap(by.id('continueToFeature'));
    await waitForVisible(by.id('aiCoachScreen'));
  });

  it('should handle purchase cancellation gracefully', async () => {
    await safeTap(by.id('aiCoachCard'));
    await waitForVisible(by.id('paywallScreen'));
    
    // Select plan
    await safeTap(by.id('monthlyPlan'));
    
    // Cancel purchase (tap outside or cancel button)
    await safeTap(by.id('closePaywallButton'));
    
    // Should return to previous screen without crashing
    await waitForVisible(by.id('homeTab'));
  });

  it('should restore previous purchases', async () => {
    await safeTap(by.id('aiCoachCard'));
    await waitForVisible(by.id('paywallScreen'));
    
    // Tap restore
    await safeTap(by.id('restorePurchasesButton'));
    await waitForVisible(by.id('restoreLoading'));
    
    // After restore, should either show success or no purchases found
    try {
      await waitForVisible(by.id('restoreSuccess'), 5000);
      await expect(element(by.id('restoreSuccess'))).toBeVisible();
    } catch {
      await waitForVisible(by.id('noPurchasesFound'), 5000);
      await expect(element(by.id('noPurchasesFound'))).toBeVisible();
    }
  });

  it('should show disabled state for already-premium users', async () => {
    // For users who are already premium
    // Paywall should show "You're already premium" state
    
    // This requires mock state or a premium test account
    // Skipping in standard E2E, would need specific setup
  });
});
