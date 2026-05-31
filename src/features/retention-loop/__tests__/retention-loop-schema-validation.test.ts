import { describe, expect, it } from '@jest/globals';
import {
  JourneyDaySchema,
  JourneyPhaseSchema,
  EmotionalStateSchema,
  JourneyHomeMessageSchema,
  JourneyNudgePolicySchema,
  JourneyPremiumMomentSchema,
  JourneyMomentSchema,
} from '../journey-element-schemas';
import {
  JourneyStateInputSchema,
  LaneCopyMapSchema,
  JourneyStateSchema,
} from '../journey-composite-schemas';
import { computeJourneyState } from '../service';

const baseInput = {
  userId: 'u1',
  completedSessions: 0,
  hasCompletedToday: false,
  hasSeenMemoryInsight: false,
  rescueCompleted: 0,
  recentDismissals: 0,
  inactivityDays: 0,
  hasInsightReady: false,
};

describe('journey-element-schemas', () => {
  it('JourneyDaySchema accepts 0–7 and rejects 8', () => {
    expect(JourneyDaySchema.safeParse(0).success).toBe(true);
    expect(JourneyDaySchema.safeParse(7).success).toBe(true);
    expect(JourneyDaySchema.safeParse(8).success).toBe(false);
  });

  it('JourneyPhaseSchema accepts all valid phases', () => {
    const phases = ['onboarding', 'return', 'proof', 'insight', 'rescue', 'lane_forming', 'weekly_prep', 'weekly_intelligence'];
    for (const p of phases) {
      expect(JourneyPhaseSchema.safeParse(p).success).toBe(true);
    }
    expect(JourneyPhaseSchema.safeParse('invalid').success).toBe(false);
  });

  it('EmotionalStateSchema accepts all valid states', () => {
    const states = ['curious', 'familiar', 'validated', 'trusting', 'struggling', 'forming', 'ready', 'valuable'];
    for (const s of states) {
      expect(EmotionalStateSchema.safeParse(s).success).toBe(true);
    }
  });

  it('JourneyHomeMessageSchema validates correct shape', () => {
    const result = JourneyHomeMessageSchema.safeParse({
      headline: 'Test headline',
      subtext: 'Test subtext',
      tone: 'warm',
    });
    expect(result.success).toBe(true);
  });

  it('JourneyHomeMessageSchema rejects empty headline', () => {
    const result = JourneyHomeMessageSchema.safeParse({
      headline: '',
      subtext: 'Test',
      tone: 'warm',
    });
    expect(result.success).toBe(false);
  });

  it('JourneyNudgePolicySchema accepts nullable type', () => {
    const result = JourneyNudgePolicySchema.safeParse({
      canSend: false,
      type: null,
      condition: 'Day 0: no unsolicited notification.',
    });
    expect(result.success).toBe(true);
  });

  it('JourneyPremiumMomentSchema validates correct shape', () => {
    const result = JourneyPremiumMomentSchema.safeParse({
      day: 7,
      trigger: 'deep_insight_tap',
      copyKey: 'study',
    });
    expect(result.success).toBe(true);
  });

  it('JourneyMomentSchema validates correct shape', () => {
    const result = JourneyMomentSchema.safeParse({
      type: 'what_vex_learned',
      requiresSessions: 3,
      canHide: true,
    });
    expect(result.success).toBe(true);
  });
});

describe('journey-composite-schemas', () => {
  it('JourneyStateInputSchema validates correct shape', () => {
    const result = JourneyStateInputSchema.safeParse({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: 'student',
    });
    expect(result.success).toBe(true);
  });

  it('JourneyStateInputSchema rejects missing fields', () => {
    const result = JourneyStateInputSchema.safeParse({ userId: 'u1' });
    expect(result.success).toBe(false);
  });

  it('LaneCopyMapSchema validates correct shape', () => {
    const result = LaneCopyMapSchema.safeParse({
      student: 'test',
      game_like: 'test',
      deep_creative: 'test',
      minimal_normal: 'test',
    });
    expect(result.success).toBe(true);
  });

  it('JourneyStateSchema validates full computed state', () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: 'student',
    });
    const result = JourneyStateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });
});
