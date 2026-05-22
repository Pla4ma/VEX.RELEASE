import { healthChecks } from '../feature-health-checks';

function checkById(id: string) {
  const check = healthChecks.find((item) => item.id === id);
  if (!check) {
    throw new Error(`Missing health check ${id}`);
  }
  return check;
}

async function runCheck(id: string): Promise<string> {
  return Promise.resolve(checkById(id).check());
}

describe('real feature health checks', () => {
  it('content_study verifies configured constraints as healthy', async () => {
    await expect(runCheck('content_study_max_file_constraints')).resolves.toBe('healthy');
  });

  it('content_study verifies rate limit configuration as healthy', async () => {
    await expect(runCheck('content_study_rate_limits')).resolves.toBe('healthy');
  });

  it('ai_coach_advanced has deterministic fallback readiness', async () => {
    await expect(runCheck('ai_coach_advanced_fallback')).resolves.toBe('healthy');
  });

  it('premium_paywall entitlement read path is present', async () => {
    await expect(runCheck('premium_paywall_entitlements')).resolves.toBe('healthy');
  });

  it('premium_paywall offerings remain degraded until runtime load is verified', async () => {
    await expect(runCheck('premium_paywall_offerings')).resolves.toBe('degraded');
  });

  it('boss_tab readiness checks verify template and subtle fallback paths', async () => {
    await expect(runCheck('boss_tab_template')).resolves.toBe('healthy');
    await expect(runCheck('boss_tab_subtle_fallback')).resolves.toBe('healthy');
  });
});
