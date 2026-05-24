/**
 * Jest Groups Configuration Validation
 *
 * Verifies jest.groups.json meets final-release scope:
 * 1. battle-pass tests are not in required monetization group.
 * 2. shop/wallet/inventory tests are not release blockers.
 * 3. premium RevenueCat gating tests remain required if premium active.
 * 4. archived feature tests cannot block final release.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface JestGroup {
  description: string;
  required: boolean;
  patterns: string[];
}

interface GroupConfig {
  groups: Record<string, JestGroup>;
  rules: {
    blocking: string[];
    'non-blocking': string[];
    'ci-required': string[];
    'ci-optional': string[];
  };
}

const GROUPS_PATH = join(process.cwd(), 'jest.groups.json');

function loadGroups(): GroupConfig {
  const raw = readFileSync(GROUPS_PATH, 'utf-8');
  return JSON.parse(raw) as GroupConfig;
}

function groupContains(
  group: JestGroup,
  testName: string
): boolean {
  return group.patterns.some((pattern) => pattern.includes(testName));
}

describe('jest.groups.json — final-release scope validation', () => {
  let config: GroupConfig;

  beforeAll(() => {
    config = loadGroups();
  });

  describe('archived-economy group exists', () => {
    it('archived-economy is a defined group', () => {
      expect(config.groups['archived-economy']).toBeDefined();
    });

    it('archived-economy is not required', () => {
      expect(config.groups['archived-economy'].required).toBe(false);
    });

    it('archived-economy contains economy tests', () => {
      expect(
        groupContains(config.groups['archived-economy'], 'economy')
      ).toBe(true);
    });

    it('archived-economy contains shop tests', () => {
      expect(
        groupContains(config.groups['archived-economy'], 'shop')
      ).toBe(true);
    });

    it('archived-economy contains wallet tests', () => {
      expect(
        groupContains(config.groups['archived-economy'], 'wallet')
      ).toBe(true);
    });

    it('archived-economy contains inventory tests', () => {
      expect(
        groupContains(config.groups['archived-economy'], 'inventory')
      ).toBe(true);
    });

    it('archived-economy contains battle-pass tests', () => {
      expect(
        groupContains(config.groups['archived-economy'], 'battle-pass')
      ).toBe(true);
    });
  });

  describe('battle-pass tests — NOT in required groups', () => {
    it('battle-pass test patterns are NOT in premium-billing group', () => {
      const patterns =
        config.groups['premium-billing']?.patterns ?? [];
      const bpPattern = patterns.filter((p) =>
        p.includes('battle-pass')
      );
      expect(bpPattern).toHaveLength(0);
    });

    it('battle-pass test patterns exist only in non-required groups', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, 'battle-pass')) {
          expect(group.required).toBe(false);
          expect(name === 'archived-economy' || name === 'legacy').toBe(
            true
          );
        }
      }
    });
  });

  describe('shop/wallet/inventory tests — NOT release blockers', () => {
    it('shop test patterns are not required', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, '/shop/')) {
          expect(group.required).toBe(false);
        }
      }
    });

    it('wallet test patterns are not required', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, '/wallet/')) {
          expect(group.required).toBe(false);
        }
      }
    });

    it('inventory test patterns are not required', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, '/inventory/')) {
          expect(group.required).toBe(false);
        }
      }
    });

    it('shop is not in blocking rules', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, '/shop/')) {
          expect(config.rules.blocking).not.toContain(name);
          expect(config.rules['non-blocking']).toContain(name);
        }
      }
    });

    it('wallet is not in blocking rules', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, '/wallet/')) {
          expect(config.rules.blocking).not.toContain(name);
          expect(config.rules['non-blocking']).toContain(name);
        }
      }
    });

    it('inventory is not in blocking rules', () => {
      for (const [name, group] of Object.entries(config.groups)) {
        if (groupContains(group, '/inventory/')) {
          expect(config.rules.blocking).not.toContain(name);
          expect(config.rules['non-blocking']).toContain(name);
        }
      }
    });
  });

  describe('premium RevenueCat gating tests — ci-required', () => {
    it('premium-billing group exists', () => {
      expect(config.groups['premium-billing']).toBeDefined();
    });

    it('premium-billing is ci-required', () => {
      expect(config.rules['ci-required']).toContain('premium-billing');
    });

    it('premium-billing contains monetization tests', () => {
      expect(
        groupContains(
          config.groups['premium-billing'],
          'features/monetization'
        )
      ).toBe(true);
    });

    it('premium-billing contains shared monetization (entitlements)', () => {
      expect(
        groupContains(
          config.groups['premium-billing'],
          'shared/monetization'
        )
      ).toBe(true);
    });

    it('premium-billing is NOT in blocking rules (conditional)', () => {
      expect(config.rules.blocking).not.toContain(
        'premium-billing'
      );
    });
  });

  describe('archived feature tests — cannot block final release', () => {
    it('archived-economy is not in blocking rules', () => {
      expect(config.rules.blocking).not.toContain(
        'archived-economy'
      );
    });

    it('archived-economy is in non-blocking rules', () => {
      expect(config.rules['non-blocking']).toContain(
        'archived-economy'
      );
    });

    it('archived-economy is ci-optional not ci-required', () => {
      expect(config.rules['ci-optional']).toContain(
        'archived-economy'
      );
      expect(config.rules['ci-required']).not.toContain(
        'archived-economy'
      );
    });

    it('legacy group remains non-blocking', () => {
      expect(config.rules.blocking).not.toContain('legacy');
      expect(config.rules['non-blocking']).toContain('legacy');
    });
  });

  describe('blocking groups — only final-release scope', () => {
    it('blocking list contains exactly 5 groups', () => {
      expect(config.rules.blocking).toHaveLength(5);
    });

    it('core-loop is blocking', () => {
      expect(config.rules.blocking).toContain('core-loop');
    });

    it('progressive-unlock is blocking', () => {
      expect(config.rules.blocking).toContain(
        'progressive-unlock'
      );
    });

    it('session-completion is blocking', () => {
      expect(config.rules.blocking).toContain(
        'session-completion'
      );
    });

    it('offline-sync is blocking', () => {
      expect(config.rules.blocking).toContain('offline-sync');
    });

    it('auth-onboarding is blocking', () => {
      expect(config.rules.blocking).toContain('auth-onboarding');
    });

    it('archived-economy is NOT blocking', () => {
      expect(config.rules.blocking).not.toContain(
        'archived-economy'
      );
    });

    it('no monetization/economy/shop/wallet/battle-pass groups are blocking', () => {
      const blocking = new Set(config.rules.blocking);
      const economyGroupNames: string[] = [];
      for (const [name, group] of Object.entries(
        config.groups
      )) {
        if (
          groupContains(group, 'economy') ||
          groupContains(group, 'shop/') ||
          groupContains(group, 'wallet/') ||
          groupContains(group, 'battle-pass') ||
          groupContains(group, 'inventory')
        ) {
          economyGroupNames.push(name);
        }
      }
      for (const name of economyGroupNames) {
        expect(blocking.has(name)).toBe(false);
      }
    });
  });
});
