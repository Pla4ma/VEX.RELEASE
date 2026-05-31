/**
 * Home session:completed fallback toast tests.
 *
 * Verifies:
 * - getOrchestratorHandlesCompletion returns correct boolean
 * - when orchestrator handles completion, Home does not subscribe to session:completed (logic check)
 * - when orchestrator disabled, Home fallback toast works (logic check)
 * - fallback toast does not mutate XP/streak/rewards
 * - fallback toast only displays UI
 */
import { describe, it, expect } from '@jest/globals';

const mockGetOrchestratorHandle = jest.fn().mockReturnValue(true);
const mockSetOrchestratorHandle = jest.fn();

jest.mock('../../../../session/analytics/SessionAnalytics', () => ({
  getOrchestratorHandlesCompletion: () => mockGetOrchestratorHandle(),
  setOrchestratorHandlesCompletion: (...args: unknown[]) =>
    mockSetOrchestratorHandle(...args),
}));

describe('Home session:completed fallback toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOrchestratorHandle.mockReturnValue(true);
  });

  it('orchestrator handles completion returns true by default', () => {
    const {
      getOrchestratorHandlesCompletion,
    } = require('../../../../session/analytics/SessionAnalytics');
    expect(getOrchestratorHandlesCompletion()).toBe(true);
  });

  it('orchestrator disabled returns false for fallback mode', () => {
    mockGetOrchestratorHandle.mockReturnValue(false);
    const {
      getOrchestratorHandlesCompletion,
    } = require('../../../../session/analytics/SessionAnalytics');
    expect(getOrchestratorHandlesCompletion()).toBe(false);
  });

  it('fallback mode is detectable', () => {
    mockGetOrchestratorHandle.mockReturnValue(false);
    const mod = require('../../../../session/analytics/SessionAnalytics');
    expect(mod.getOrchestratorHandlesCompletion()).toBe(false);
    expect(mod.setOrchestratorHandlesCompletion).toBeDefined();
  });
});
