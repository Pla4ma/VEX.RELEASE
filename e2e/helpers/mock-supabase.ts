import type { Page } from '@playwright/test';

export async function mockSupabaseRest(page: Page): Promise<void> {
  await page.route('https://*.supabase.co/functions/v1/content-study/eligibility', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        canUpload: false,
        fallbackLabel: 'Choose a study goal and complete a focused study block to unlock content tools.',
      }),
    }),
  );

  await page.route('https://*.supabase.co/rest/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '*/0' },
      body: '[]',
    }),
  );
}
