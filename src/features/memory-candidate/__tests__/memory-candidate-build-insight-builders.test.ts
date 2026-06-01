/**
 * Tests for buildInsightBuilders
 */
import { buildInsightBuilders } from '../insight-builders';
import type { WhatVEXLearnedInput } from '../schemas';

const userId = 'test-user-mc';

function baseInput(overrides: Partial<WhatVEXLearnedInput> = {}): WhatVEXLearnedInput {
  return {
    userId,
    totalSessions: 10,
    totalFocusMinutes: 500,
    streakDays: 5,
    completedSessions: 10,
    ...overrides,
  };
}

describe('buildInsightBuilders', () => {
  it('returns builders from all categories', () => {
    const builders = buildInsightBuilders(baseInput(), Date.now());
    expect(builders.length).toBeGreaterThan(0);
    const categories = new Set(builders.map((b) => b.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('each builder has condition and build functions', () => {
    const builders = buildInsightBuilders(baseInput(), Date.now());
    for (const builder of builders) {
      expect(typeof builder.condition).toBe('function');
      expect(typeof builder.build).toBe('function');
      expect(builder.category).toBeDefined();
    }
  });

  it('returns start_friction insight when abandonedStarts is high', () => {
    const input = baseInput({
      abandonedStarts: 5,
      totalSessions: 5,
      completedSessions: 5,
    });
    const builders = buildInsightBuilders(input, Date.now());
    const friction = builders.filter(
      (b) => b.category === 'start_friction' && b.condition(),
    );
    expect(friction.length).toBeGreaterThan(0);
  });

  it('returns mode_behavior insight when modeChanges is high', () => {
    const input = baseInput({
      modeChanges: 5,
      totalSessions: 10,
      completedSessions: 10,
    });
    const builders = buildInsightBuilders(input, Date.now());
    const modeInsights = builders.filter(
      (b) => b.category === 'mode_behavior' && b.condition(),
    );
    expect(modeInsights.length).toBeGreaterThan(0);
  });

  it('returns notification_behavior insight when evening nudges dismissed', () => {
    const input = baseInput({
      eveningNudgeDismissals: 3,
      totalSessions: 5,
    });
    const builders = buildInsightBuilders(input, Date.now());
    const notifInsights = builders.filter(
      (b) => b.category === 'notification_behavior' && b.condition(),
    );
    expect(notifInsights.length).toBeGreaterThan(0);
  });

  it('returns rescue_behavior insight when rescue accepts >= 1', () => {
    const input = baseInput({
      rescueAcceptsAfterMiss: 2,
      totalSessions: 5,
    });
    const builders = buildInsightBuilders(input, Date.now());
    const rescueInsights = builders.filter(
      (b) => b.category === 'rescue_behavior' && b.condition(),
    );
    expect(rescueInsights.length).toBeGreaterThan(0);
  });

  it('returns study_continuity insight for named study targets', () => {
    const input = baseInput({
      completedNamedStudyTargets: 3,
      totalSessions: 5,
      completedSessions: 5,
    });
    const builders = buildInsightBuilders(input, Date.now());
    const studyInsights = builders.filter(
      (b) => b.category === 'study_continuity' && b.condition(),
    );
    expect(studyInsights.length).toBeGreaterThan(0);
  });

  it('build items have required LearnedItem fields', () => {
    const input = baseInput({
      abandonedStarts: 5,
      totalSessions: 5,
      completedSessions: 5,
    });
    const builders = buildInsightBuilders(input, Date.now());
    const matching = builders.filter((b) => b.condition());
    for (const builder of matching) {
      const item = builder.build();
      expect(item.id).toBeDefined();
      expect(item.observation).toBeDefined();
      expect(item.evidence).toBeDefined();
      expect(['weak', 'medium', 'strong']).toContain(item.confidence);
      expect(item.userVisible).toBe(true);
      expect(item.editedByUser).toBe(false);
      expect(item.deletedByUser).toBe(false);
      expect(item.createdAt).toBeDefined();
    }
  });
});
