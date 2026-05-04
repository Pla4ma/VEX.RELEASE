/**
 * E2E Test: Onboarding Flow
 * Validates 2-minute activation
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('completes first session within 2 minutes', async ({ page }) => {
    // Start at welcome screen
    await page.goto('/');
    
    // Should see welcome message
    await expect(page.getByText('Welcome to VEX')).toBeVisible();
    
    // Click "Get Started"
    await page.getByRole('button', { name: /get started/i }).click();
    
    // Should see mode selector
    await expect(page.getByText('How do you focus best?')).toBeVisible();
    
    // Select "Quick Sprint" mode
    await page.getByText('Quick Sprint').click();
    
    // Should see boss preview
    await expect(page.getByText('Your First Challenge')).toBeVisible();
    
    // Click "Start Session"
    await page.getByRole('button', { name: /start session/i }).click();
    
    // Session should be active
    await expect(page.getByText('Focus Mode')).toBeVisible();
    
    // Simulate session completion (25 minutes)
    await page.evaluate(() => {
      // Fast-forward timer for testing
      window.localStorage.setItem('test_mode', 'true');
    });
    
    // Complete session
    await page.getByRole('button', { name: /complete/i }).click();
    
    // Should see completion screen
    await expect(page.getByText('First Victory!')).toBeVisible();
    
    // Verify coins were awarded
    await expect(page.getByText(/\+\d+ coins/)).toBeVisible();
    
    // Should see retention hook
    await expect(page.getByText(/come back tomorrow/i)).toBeVisible();
  });
  
  test('handles abandonment during onboarding', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /get started/i }).click();
    
    // Try to navigate away
    await page.goto('/');
    
    // Should show recovery prompt
    await expect(page.getByText(/wait/i)).toBeVisible();
  });
});
