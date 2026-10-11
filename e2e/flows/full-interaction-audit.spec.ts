import { test, expect, type Page } from '@playwright/test';
import { openLogin } from '../helpers/app';
import { mockSupabaseRest } from '../helpers/mock-supabase';

async function openLocalApp(page: Page): Promise<void> {
  await mockSupabaseRest(page);
  await openLogin(page);
  await page.getByRole('button', { name: 'Skip login and onboarding' }).click();
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeVisible({ timeout: 20_000 });
}

async function assertNoBrowserErrors(page: Page, errors: string[], failures: string[]): Promise<void> {
  expect(errors, `browser errors:\n${errors.join('\n')}`).toEqual([]);
  const actionableFailures = failures.filter((failure) => !failure.endsWith(': net::ERR_ABORTED'));
  expect(actionableFailures, `failed requests:\n${actionableFailures.join('\n')}`).toEqual([]);
}

test.describe('Reachable tab interaction audit', () => {
  test('Home and Focus entry points return cleanly', async ({ page }) => {
    const errors: string[] = [];
    const failures: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));

    await openLocalApp(page);
    await page.getByRole('button', { name: 'Start focus session' }).click();
    await expect(page.getByText('FOCUS STUDIO', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Start 25 minute session' }).click();
    await expect(page.getByRole('button', { name: 'Pause session' })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Pause session' }).click();
    await expect(page.getByRole('button', { name: 'Resume session' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Resume session' }).click();
    await page.getByRole('button', { name: 'Quit focus session' }).click();
    await expect(page.getByRole('button', { name: 'End focus session' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'End focus session' }).click();
    await expect(page.getByRole('button', { name: 'Close session composer' })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Close session composer' }).click();
    await expect(page.getByRole('button', { name: 'Start focus session' })).toBeVisible();

    await page.getByRole('tab', { name: 'Focus' }).click();
    await expect(page.getByRole('button', { name: 'Start 15 minute sprint session' })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Start 15 minute sprint session' }).click();
    await expect(page.getByText('FOCUS STUDIO', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Close session composer' }).click();
    await assertNoBrowserErrors(page, errors, failures);
  });

  test('Progress world routes and Profile controls are reachable', async ({ page }) => {
    const errors: string[] = [];
    const failures: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));

    await openLocalApp(page);
    await page.getByRole('tab', { name: 'Progress' }).click();
    const worldHeading = page.getByText('VEX world', { exact: true });
    await expect(worldHeading).toBeVisible({ timeout: 20_000 });
    await worldHeading.scrollIntoViewIfNeeded();

    const coachCard = page.getByRole('button', { name: 'AI Coach', exact: true });
    await coachCard.scrollIntoViewIfNeeded();
    await coachCard.click();
    await expect(page.getByPlaceholder('Ask your coach anything...')).toBeVisible({ timeout: 20_000 });
    await page.getByPlaceholder('Ask your coach anything...').fill('I need a clean focus block.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('Local coach mode is ready.', { exact: false })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Start focus', exact: true }).click();
    await expect(page.getByText('FOCUS STUDIO', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Close session composer' }).click();
    await page.getByRole('button', { name: 'Close AI Coach' }).click();
    await expect(worldHeading).toBeVisible({ timeout: 20_000 });
    await worldHeading.scrollIntoViewIfNeeded();

    for (const label of ['Study Library', 'Companion', 'Challenges', 'Boss Board', 'Mastery', 'Memory', 'Intelligence']) {
      const card = page.getByRole('button', { name: label, exact: true });
      await expect(card).toBeVisible();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      if (label === 'Study Library') {
        await expect(page.getByRole('button', { name: 'Start a Study Session' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add new study content' })).toHaveCount(0);
      }
      const backControl = page.getByRole('button', { name: /Close AI Coach|Go back|Back/i }).first();
      await expect(backControl).toBeVisible({ timeout: 20_000 });
      await backControl.click();
      await expect(page.getByText('VEX world', { exact: true })).toBeVisible({ timeout: 20_000 });
    }

    await page.getByRole('tab', { name: 'Profile' }).click();
    await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('tab', { name: 'mastery tab' }).click();
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
    await page.getByRole('tab', { name: 'activity tab' }).click();
    await expect(page.getByText('No recent activity', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('tab', { name: 'stats tab' }).click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByText('Control room', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page.getByRole('button', { name: 'Alerts', exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Alerts', exact: true }).click();
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Go back' }).click();
    await assertNoBrowserErrors(page, errors, failures);
  });
});
