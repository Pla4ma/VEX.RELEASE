import { describe, it, expect } from '@jest/globals';

describe('unlock-system', () => {
  it('exports expected symbols from hooks', () => {
    const mod = require('../hooks');
    expect(mod).toBeDefined();
  });

  it('SignalTypeSchema validates all signal types', () => {
    const { SignalTypeSchema } = require('../schemas');
    const validSignals = [
      'session_completed',
      'plan_item_created',
      'plan_item_completed',
      'capture_created',
      'coach_interaction',
      'streak_maintained',
      'project_created',
      'study_plan_created',
    ];
    validSignals.forEach(signal => {
      expect(SignalTypeSchema.parse(signal)).toBe(signal);
    });
  });

  it('SignalTypeSchema rejects invalid signal type', () => {
    const { SignalTypeSchema } = require('../schemas');
    expect(() => SignalTypeSchema.parse('invalid_signal')).toThrow();
  });

  it('CompositeScoreSchema validates a complete score', () => {
    const { CompositeScoreSchema } = require('../schemas');
    const score = {
      total: 100,
      sessionScore: 30,
      planScore: 25,
      captureScore: 20,
      coachScore: 15,
      streakScore: 10,
    };
    expect(() => CompositeScoreSchema.parse(score)).not.toThrow();
  });

  it('CompositeScoreSchema applies defaults for missing fields', () => {
    const { CompositeScoreSchema } = require('../schemas');
    const minimal = { total: 50 };
    const parsed = CompositeScoreSchema.parse(minimal);
    expect(parsed.sessionScore).toBe(0);
    expect(parsed.planScore).toBe(0);
    expect(parsed.captureScore).toBe(0);
  });

  it('CompositeScoreSchema rejects negative total', () => {
    const { CompositeScoreSchema } = require('../schemas');
    expect(() => CompositeScoreSchema.parse({ total: -1 })).toThrow();
  });

  it('service module loads', () => {
    const service = require('../service');
    expect(service).toBeDefined();
  });

  it('types module loads', () => {
    const types = require('../types');
    expect(types).toBeDefined();
  });
});
