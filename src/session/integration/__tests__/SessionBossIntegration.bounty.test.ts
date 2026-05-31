/**
 * SessionBossIntegration — bounty loot boost tests.
 *
 * Boss combat is archived (no-op). These tests verify the no-op contract:
 * - `initializeSessionBossIntegration()` returns a cleanup function
 * - `calculateBossDamage()` always returns 0 (no parameters)
 * - No event subscriptions are wired (boss combat is archived)
 */

import { initializeSessionBossIntegration, calculateBossDamage } from '../SessionBossIntegration';
import { getAvailabilityFor } from '../../../features/liveops-config/feature-access-store';
import { ENABLED_AVAILABILITY } from './SessionBossIntegration.helpers';

jest.mock('../../../features/liveops-config/feature-access-store', () => ({
  getAvailabilityFor: jest.fn(),
}));

const mockedGetAvailabilityFor = jest.mocked(getAvailabilityFor);

describe('SessionBossIntegration > bounty loot boost (archived no-op)', () => {
  beforeEach(() => {
    mockedGetAvailabilityFor.mockClear();
    mockedGetAvailabilityFor.mockReturnValue(ENABLED_AVAILABILITY);
  });

  it('returns a cleanup function from initializeSessionBossIntegration', () => {
    const cleanup = initializeSessionBossIntegration();
    expect(typeof cleanup).toBe('function');
  });

  it('cleanup function can be called without error', () => {
    const cleanup = initializeSessionBossIntegration();
    expect(() => cleanup()).not.toThrow();
  });

  it('calculateBossDamage always returns 0 with no arguments', () => {
    expect(calculateBossDamage()).toBe(0);
  });
});

describe('SessionBossIntegration > calculateBossDamage (archived no-op)', () => {
  it('returns 0 regardless of call count', () => {
    expect(calculateBossDamage()).toBe(0);
    expect(calculateBossDamage()).toBe(0);
    expect(calculateBossDamage()).toBe(0);
  });
});
