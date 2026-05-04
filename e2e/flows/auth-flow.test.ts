/**
 * Auth Flow E2E Tests
 * 
 * Critical path: User registration, login, and session management
 */

import { by, element, expect, device } from 'detox';
import { 
  waitForVisible, 
  safeTap, 
  typeText, 
  relaunchApp,
  takeScreenshot,
  testID,
  testUser 
} from '../utils/test-helpers';

describe('Auth Flow', () => {
  beforeEach(async () => {
    await relaunchApp(true);
  });

  it('should complete onboarding for new user', async () => {
    // Welcome screen
    await waitForVisible(by.id('welcomeScreen'));
    await takeScreenshot('01-welcome');
    
    // Continue to onboarding
    await safeTap(by.id('getStartedButton'));
    
    // Onboarding step 1: Goals
    await waitForVisible(by.id('onboardingGoals'));
    await safeTap(by.id('goal-focus'));
    await safeTap(by.id('goal-productivity'));
    await safeTap(by.id('continueButton'));
    
    // Onboarding step 2: Experience level
    await waitForVisible(by.id('onboardingExperience'));
    await safeTap(by.id('experience-intermediate'));
    await safeTap(by.id('continueButton'));
    
    // Onboarding step 3: Notifications
    await waitForVisible(by.id('onboardingNotifications'));
    await safeTap(by.id('enableNotificationsButton'));
    
    // Should land on Home screen
    await waitForVisible(by.id(testID.homeTab));
    await takeScreenshot('02-onboarding-complete');
  });

  it('should login with existing credentials', async () => {
    // Navigate to login
    await safeTap(by.id('haveAccountButton'));
    await waitForVisible(by.id('loginScreen'));
    
    // Enter credentials
    await typeText(by.id(testID.emailInput), testUser.email);
    await typeText(by.id(testID.passwordInput), testUser.password);
    
    // Submit
    await safeTap(by.id(testID.loginButton));
    
    // Should land on Home
    await waitForVisible(by.id(testID.homeTab));
    await expect(element(by.id('userGreeting'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await safeTap(by.id('haveAccountButton'));
    await waitForVisible(by.id('loginScreen'));
    
    // Enter invalid credentials
    await typeText(by.id(testID.emailInput), 'invalid@example.com');
    await typeText(by.id(testID.passwordInput), 'wrongpassword');
    
    await safeTap(by.id(testID.loginButton));
    
    // Error message should appear
    await waitForVisible(by.id(testID.errorMessage));
    await expect(element(by.id(testID.errorMessage))).toHaveText(
      'Invalid email or password'
    );
  });

  it('should validate email format', async () => {
    await safeTap(by.id('haveAccountButton'));
    await waitForVisible(by.id('loginScreen'));
    
    // Enter invalid email format
    await typeText(by.id(testID.emailInput), 'not-an-email');
    await safeTap(by.id(testID.loginButton));
    
    // Validation error
    await waitForVisible(by.id('emailError'));
    await expect(element(by.id('emailError'))).toHaveText(
      'Please enter a valid email address'
    );
  });

  it('should allow password reset flow', async () => {
    await safeTap(by.id('haveAccountButton'));
    await waitForVisible(by.id('loginScreen'));
    
    // Tap forgot password
    await safeTap(by.id('forgotPasswordLink'));
    await waitForVisible(by.id('passwordResetScreen'));
    
    // Enter email
    await typeText(by.id(testID.emailInput), testUser.email);
    await safeTap(by.id('sendResetButton'));
    
    // Success message
    await waitForVisible(by.id('resetEmailSent'));
    await expect(element(by.id('resetEmailSent'))).toBeVisible();
  });
});
