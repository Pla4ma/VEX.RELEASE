/**
 * E2E Test Helpers
 * 
 * Shared utilities for end-to-end testing
 */

import { by, element, expect, device, waitFor } from 'detox';

/**
 * Wait for an element to be visible with timeout
 */
export async function waitForVisible(
  matcher: ReturnType<typeof by.id>,
  timeout: number = 5000
): Promise<void> {
  await waitFor(element(matcher))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Tap an element safely with retry
 */
export async function safeTap(
  matcher: ReturnType<typeof by.id>,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await waitForVisible(matcher, 3000);
      await element(matcher).tap();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Type text into an input field
 */
export async function typeText(
  matcher: ReturnType<typeof by.id>,
  text: string
): Promise<void> {
  await waitForVisible(matcher);
  await element(matcher).typeText(text);
}

/**
 * Clear text from an input field
 */
export async function clearText(
  matcher: ReturnType<typeof by.id>
): Promise<void> {
  await waitForVisible(matcher);
  await element(matcher).clearText();
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await device.takeScreenshot(`${name}_${timestamp}`);
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingComplete(
  loadingMatcher?: ReturnType<typeof by.id>
): Promise<void> {
  // Wait for loading indicator to appear then disappear
  if (loadingMatcher) {
    try {
      await waitFor(element(loadingMatcher))
        .not.toBeVisible()
        .withTimeout(10000);
    } catch {
      // Loading might already be complete
    }
  }
  // Additional buffer for any transitions
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Check if element exists without failing
 */
export async function elementExists(
  matcher: ReturnType<typeof by.id>
): Promise<boolean> {
  try {
    await expect(element(matcher)).toExist();
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigate back
 */
export async function goBack(): Promise<void> {
  if (device.getPlatform() === 'ios') {
    await element(by.id('backButton')).tap();
  } else {
    await device.pressBack();
  }
}

/**
 * Relaunch app with clear state
 */
export async function relaunchApp(clearStorage: boolean = true): Promise<void> {
  if (clearStorage) {
    await device.clearKeychain();
    await device.resetContentAndSettings();
  }
  await device.launchApp({ newInstance: true });
}

/**
 * Mock biometric authentication
 */
export async function mockBiometric(success: boolean = true): Promise<void> {
  await device.matchFace();
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(duration: number = 500): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Scroll to element within scroll view
 */
export async function scrollToElement(
  scrollViewMatcher: ReturnType<typeof by.id>,
  targetMatcher: ReturnType<typeof by.id>
): Promise<void> {
  await waitFor(element(targetMatcher))
    .toBeVisible()
    .whileElement(scrollViewMatcher)
    .scroll(100, 'down');
}

/**
 * Test ID helper for consistent element identification
 */
export const testID = {
  // Auth
  emailInput: 'emailInput',
  passwordInput: 'passwordInput',
  loginButton: 'loginButton',
  registerButton: 'registerButton',
  
  // Navigation
  homeTab: 'homeTab',
  sessionTab: 'sessionTab',
  socialTab: 'socialTab',
  profileTab: 'profileTab',
  
  // Session
  startSessionButton: 'startSessionButton',
  pauseSessionButton: 'pauseSessionButton',
  completeSessionButton: 'completeSessionButton',
  sessionTimer: 'sessionTimer',
  
  // Common
  loadingIndicator: 'loadingIndicator',
  errorMessage: 'errorMessage',
  retryButton: 'retryButton',
  backButton: 'backButton',
  
  // Paywall
  upgradeButton: 'upgradeButton',
  restorePurchasesButton: 'restorePurchasesButton',
};

/**
 * Test user credentials for E2E testing
 */
export const testUser = {
  email: 'e2e.test@vex.app',
  password: 'TestPass123!',
  name: 'E2E Test User',
};
