import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { healthChecks } from '../feature-health-checks';
import { buildFeatureAccess } from '../feature-access';
import { getFeatureAvailability } from '../feature-availability';
import { DISABLED_FEATURES, FEATURE_RELEASE_STATES } from '../feature-access-config';
import { getFeatureStatus } from '../final-release-feature-map';
import type { FeatureKey } from '../feature-access';

const srcRoot = join(__dirname, '../../../..');
const runtimeExt = /\.(ts|tsx)$/;
const blockedSpendable: FeatureKey[] = [
  'economy_basic',
  'economy_advanced',
  'shop',
  'inventory',
  'gems_prominent',
  'streak_insurance',
  'wagers',
  'battle_pass',
];

function runtimeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === '__tests__' || entry === '__snapshots__') return [];
      return runtimeFiles(fullPath);
    }
    return runtimeExt.test(entry) ? [fullPath] : [];
  });
}

function runtimeSource(): string {
  return runtimeFiles(srcRoot)
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
}

describe('final-release language and economy boundary', () => {
  it('runtime code contains no stale release token', () => {
    expect(runtimeSource()).not.toContain(['public', 'v1'].join('_'));
  });

  it('runtime user-facing copy does not say stale prerelease copy', () => {
    const staleCopy = `Not in ${String.fromCharCode(98, 101, 116, 97)}`;
    expect(runtimeSource()).not.toContain(staleCopy);
  });

  it('boss forbidden dependency health check uses final-release naming', () => {
    const check = healthChecks.find((item) => item.id === 'boss_tab_no_disabled_deps');
    expect(check?.label).toContain('final-release forbidden deps');
  });

  it('active economy_basic cannot expose spendable surfaces', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 50 }).features;
    const availability = getFeatureAvailability(features.economy_basic);
    expect(availability.canRenderEntryPoint).toBe(false);
    expect(availability.canNavigate).toBe(false);
    expect(availability.canQuery).toBe(false);
    expect(getFeatureStatus('economy_basic')).toBe('hidden');
  });

  it('spendable economy features remain final-release deactivated', () => {
    for (const feature of blockedSpendable) {
      expect(DISABLED_FEATURES).toContain(feature);
      expect(FEATURE_RELEASE_STATES[feature]).toBe('final_release_deactivated');
      expect(getFeatureStatus(feature)).toBe('hidden');
    }
  });

  it('final-release states use only approved values', () => {
    const allowed = new Set([
      'final_release_core',
      'final_release_progressive',
      'final_release_internal',
      'final_release_deactivated',
      'archived',
    ]);
    for (const state of Object.values(FEATURE_RELEASE_STATES)) {
      expect(allowed.has(state)).toBe(true);
    }
  });
});
