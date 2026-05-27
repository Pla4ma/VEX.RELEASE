import {
  computeStudyOsPremiumGate,
  computeStudyOsUnlockGate,
  mockStore,
} from './study-os.helpers';

describe('Study OS unlock gate', () => {
  beforeEach(() => mockStore.clear());

  it('Day 0 blocks full unlock, shows day_zero reason', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 0, studyUsageRatio: 0 });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.isDayZero).toBe(true);
    expect(gate.unlockReason).toBe('day_zero');
  });

  it('5 sessions with low ratio still unlocks via evidence_sessions', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 5, studyUsageRatio: 0.1 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('evidence_sessions');
  });

  it('2 sessions with high study ratio unlocks via evidence_usage', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 2, studyUsageRatio: 0.4 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('evidence_usage');
  });

  it('3 sessions with low ratio stays locked', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 3, studyUsageRatio: 0.1 });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.unlockReason).toBe('first_week');
  });

  it('7+ sessions becomes full unlock', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 7, studyUsageRatio: 0.1 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('full');
  });

  it('firstWeekPhase 7+ forces full unlock', () => {
    const gate = computeStudyOsUnlockGate({ completedSessions: 2, studyUsageRatio: 0, firstWeekPhase: 7 });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe('full');
  });
});

describe('Study OS premium gate', () => {
  it('blocks premium depth when RevenueCat unhealthy', () => {
    const gate = computeStudyOsPremiumGate({ hasPremiumEntitlement: true, revenueCatHealthy: false });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.basicStudyFree).toBe(true);
    expect(gate.restrictionReason).toContain('degraded');
  });

  it('blocks premium depth when no entitlement', () => {
    const gate = computeStudyOsPremiumGate({ hasPremiumEntitlement: false, revenueCatHealthy: true });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.basicStudyFree).toBe(true);
  });

  it('allows premium depth with entitlement and healthy RC', () => {
    const gate = computeStudyOsPremiumGate({ hasPremiumEntitlement: true, revenueCatHealthy: true });
    expect(gate.canAccessPremiumDepth).toBe(true);
    expect(gate.restrictionReason).toBeNull();
  });
});
