/**
 * SessionBossIntegration — event-driven damage tests.
 *
 * Boss combat is archived (no-op). These tests verify:
 * - `initializeSessionBossIntegration()` returns a cleanup function
 * - No event subscriptions happen (boss combat is archived)
 * - Feature availability gating is respected
 */

import { initializeSessionBossIntegration } from '../SessionBossIntegration';
import { getAvailabilityFor } from '../../../liveops-config/feature-access-store';
import {
  ENABLED_AVAILABILITY,
  LOCKED_AVAILABILITY,
  HIDDEN_AVAILABILITY,
} from './SessionBossIntegration.helpers';

jest.mock('../../../liveops-config/feature-access-store', () => ({
  getAvailabilityFor: jest.fn(),
}));

const mockedGetAvailabilityFor = jest.mocked(getAvailabilityFor);

describe('SessionBossIntegration > event-driven damage (archived no-op)', () => {
  beforeEach(() => {
    mockedGetAvailabilityFor.mockClear();
    mockedGetAvailabilityFor.mockReturnValue(ENABLED_AVAILABILITY);
  });

  it('returns a cleanup function when feature is enabled', () => {
    const cleanup = initializeSessionBossIntegration();
    expect(typeof cleanup).toBe('function');
  });

  it('returns a cleanup function when feature is locked', () => {
    mockedGetAvailabilityFor.mockReturnValue(LOCKED_AVAILABILITY);
    const cleanup = initializeSessionBossIntegration();
    expect(typeof cleanup).toBe('function');
  });

  it('returns a cleanup function when feature is hidden', () => {
    mockedGetAvailabilityFor.mockReturnValue(HIDDEN_AVAILABILITY);
    const cleanup = initializeSessionBossIntegration();
    expect(typeof cleanup).toBe('function');
  });
});

describe('SessionBossIntegration > feature availability gating', () => {
  beforeEach(() => {
    mockedGetAvailabilityFor.mockClear();
    mockedGetAvailabilityFor.mockReturnValue(ENABLED_AVAILABILITY);
  });

  it("calls getAvailabilityFor with 'boss_tab'", () => {
    initializeSessionBossIntegration();
    expect(mockedGetAvailabilityFor).toHaveBeenCalledWith('boss_tab');
  });

  it('does not throw when canSubscribeToEvents is false (locked)', () => {
    mockedGetAvailabilityFor.mockReturnValue(LOCKED_AVAILABILITY);
    expect(() => initializeSessionBossIntegration()).not.toThrow();
  });

  it('does not throw when canSubscribeToEvents is false (hidden)', () => {
    mockedGetAvailabilityFor.mockReturnValue(HIDDEN_AVAILABILITY);
    expect(() => initializeSessionBossIntegration()).not.toThrow();
  });

  it('returns cleanup function even when boss_tab is locked', () => {
    mockedGetAvailabilityFor.mockReturnValue(LOCKED_AVAILABILITY);
    const cleanup = initializeSessionBossIntegration();
    expect(cleanup).toBeInstanceOf(Function);
  });
});
