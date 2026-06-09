/**
 * Study OS — Gates Tests
 *
 * Covers: computeStudyOsUnlockGate, computeStudyOsPremiumGate
 */

import { computeStudyOsUnlockGate, computeStudyOsPremiumGate } from '../service';

// ─── Mock external dependencies ──────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

jest.mock('../../../session/modes', () => ({
  SessionMode: {
    STUDY: 'STUDY',
    FOCUS: 'FOCUS',
  },
}));

jest.mock('../../session-start/service', () => ({
  buildLaneSessionBrief: jest.fn((input: { durationSeconds: number; lane: string }) => ({
    durationSeconds: input.durationSeconds,
    lane: input.lane,
    mode: 'study',
  })),
}));

// ─── computeStudyOsUnlockGate ────────────────────────────────────

describe('computeStudyOsUnlockGate', () => {
  it('Day 0 user is locked with day_zero reason', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 0,
      studyUsageRatio: 0,
    });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.isDayZero).toBe(true);
    expect(gate.unlockReason).toBe('day_zero');
  });

  it('7+ sessions fully unlocks', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 7,
      studyUsageRatio: 0.5,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('full');
  });

  it('firstWeekPhase >= 7 fully unlocks', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 3,
      studyUsageRatio: 0.1,
      firstWeekPhase: 7,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('full');
  });

  it('5+ sessions unlocks with evidence_sessions reason', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 5,
      studyUsageRatio: 0.1,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('evidence_sessions');
  });

  it('high usage ratio unlocks with evidence_usage reason', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 2,
      studyUsageRatio: 0.35,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('evidence_usage');
  });

  it('few sessions without high usage stays locked with first_week reason', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 2,
      studyUsageRatio: 0.1,
    });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.unlockReason).toBe('first_week');
  });

  it('passes through completedSessions and studyUsageRatio', () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 3,
      studyUsageRatio: 0.25,
    });
    expect(gate.completedSessions).toBe(3);
    expect(gate.studyUsageRatio).toBe(0.25);
  });
});

// ─── computeStudyOsPremiumGate ───────────────────────────────────

describe('computeStudyOsPremiumGate', () => {
  it('full premium access when entitled and healthy', () => {
    const gate = computeStudyOsPremiumGate({
      hasPremiumEntitlement: true,
      revenueCatHealthy: true,
    });
    expect(gate.canAccessPremiumDepth).toBe(true);
    expect(gate.revenueCatHealthy).toBe(true);
    expect(gate.basicStudyFree).toBe(true);
    expect(gate.restrictionReason).toBeNull();
  });

  it('no premium depth without entitlement', () => {
    const gate = computeStudyOsPremiumGate({
      hasPremiumEntitlement: false,
      revenueCatHealthy: true,
    });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.restrictionReason).toContain('VEX+');
  });

  it('no premium depth when RevenueCat is degraded', () => {
    const gate = computeStudyOsPremiumGate({
      hasPremiumEntitlement: true,
      revenueCatHealthy: false,
    });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.revenueCatHealthy).toBe(false);
    expect(gate.restrictionReason).toContain('RevenueCat');
  });

  it('basicStudyFree is always true', () => {
    expect(
      computeStudyOsPremiumGate({
        hasPremiumEntitlement: false,
        revenueCatHealthy: false,
      }).basicStudyFree,
    ).toBe(true);
  });
});
