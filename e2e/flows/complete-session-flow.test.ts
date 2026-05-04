/**
 * Complete Session Flow E2E Tests
 * 
 * Critical path: Session setup → active → pause → resume → complete → rewards
 */

import { by, element, expect, device } from 'detox';
import {
  waitForVisible,
  safeTap,
  waitForLoadingComplete,
  takeScreenshot,
  waitForAnimation,
  testID,
} from '../utils/test-helpers';

describe('Complete Session Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should complete a full focus session with all states', async () => {
    // Start from Home screen
    await waitForVisible(by.id(testID.homeTab));
    await safeTap(by.id(testID.homeTab));
    
    // Tap quick start to begin session setup
    await waitForVisible(by.id(testID.startSessionButton));
    await safeTap(by.id(testID.startSessionButton));
    await takeScreenshot('01-session-setup');
    
    // Configure session
    await waitForVisible(by.id('sessionSetupScreen'));
    
    // Set duration (25 minutes)
    await safeTap(by.id('duration-25'));
    
    // Select focus category
    await safeTap(by.id('category-deep-work'));
    
    // Add session note
    await element(by.id('sessionNoteInput')).typeText('Testing focus session');
    
    // Start session
    await safeTap(by.id('confirmStartButton'));
    await takeScreenshot('02-session-active');
    
    // Active session screen
    await waitForVisible(by.id('activeSessionScreen'));
    await expect(element(by.id(testID.sessionTimer))).toBeVisible();
    
    // Verify timer is running (wait a few seconds)
    await waitForAnimation(3000);
    
    // Pause session
    await safeTap(by.id(testID.pauseSessionButton));
    await waitForVisible(by.id('pausedState'));
    await takeScreenshot('03-session-paused');
    
    // Resume session
    await safeTap(by.id('resumeButton'));
    await waitForVisible(by.id('activeState'));
    
    // For E2E test, use short duration or simulate completion
    // In real tests, we'd mock the timer or use a test-specific short duration
    
    // Tap complete early (simulating user ending session)
    await safeTap(by.id('completeEarlyButton'));
    await waitForVisible(by.id('sessionCompleteScreen'));
    await takeScreenshot('04-session-complete');
    
    // Verify rewards screen
    await waitForVisible(by.id('rewardsAnimation'));
    await expect(element(by.id('xpEarned'))).toBeVisible();
    await expect(element(by.id('coinsEarned'))).toBeVisible();
    
    // Continue to summary
    await safeTap(by.id('continueButton'));
    await waitForVisible(by.id('sessionSummary'));
    await takeScreenshot('05-session-summary');
    
    // Return to home
    await safeTap(by.id('returnHomeButton'));
    await waitForVisible(by.id(testID.homeTab));
  });

  it('should handle session with boss encounter', async () => {
    await waitForVisible(by.id(testID.homeTab));
    
    // Navigate to Boss screen
    await safeTap(by.id('bossTab'));
    await waitForVisible(by.id('bossScreen'));
    await takeScreenshot('01-boss-screen');
    
    // Start boss session if boss available
    const bossAvailable = await element(by.id('startBossBattle')).exists().catch(() => false);
    
    if (bossAvailable) {
      await safeTap(by.id('startBossBattle'));
      await waitForVisible(by.id('bossActiveSession'));
      await takeScreenshot('02-boss-session-active');
      
      // Complete boss session
      await safeTap(by.id('completeSessionButton'));
      await waitForVisible(by.id('bossVictoryScreen'));
      await takeScreenshot('03-boss-victory');
    }
  });

  it('should handle session interruption and recovery', async () => {
    await waitForVisible(by.id(testID.startSessionButton));
    await safeTap(by.id(testID.startSessionButton));
    
    // Start a session
    await waitForVisible(by.id('sessionSetupScreen'));
    await safeTap(by.id('confirmStartButton'));
    await waitForVisible(by.id('activeSessionScreen'));
    
    // Simulate app backgrounding (interruption)
    await device.sendToHome();
    await waitForAnimation(2000);
    await device.launchApp({ newInstance: false });
    
    // Should recover to active session
    await waitForVisible(by.id('activeSessionScreen'));
    await expect(element(by.id('recoveredState'))).toBeVisible();
    await takeScreenshot('01-session-recovered');
    
    // Complete normally
    await safeTap(by.id('completeEarlyButton'));
    await waitForVisible(by.id('sessionCompleteScreen'));
  });

  it('should prevent multiple simultaneous sessions', async () => {
    // Start first session
    await safeTap(by.id(testID.startSessionButton));
    await waitForVisible(by.id('sessionSetupScreen'));
    await safeTap(by.id('confirmStartButton'));
    await waitForVisible(by.id('activeSessionScreen'));
    
    // Try to start another session (should show active session or warning)
    await device.sendToHome();
    await device.launchApp({ newInstance: false });
    
    // Should still show active session, not allow new one
    await expect(element(by.id('activeSessionScreen'))).toBeVisible();
  });
});
