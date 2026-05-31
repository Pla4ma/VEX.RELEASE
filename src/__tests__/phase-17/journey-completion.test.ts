/**
 * VEX Phase 17 — Journeys: Completion pipeline (Category 5)
 */
import { describe, expect, it } from '@jest/globals';
import {
  createRescuePlan,
  buildRescueCompletionMemory,
  buildRescueCompletionRecord,
  generateRescueReflection,
  buildRescueSessionParams,
} from '../../features/rescue-mode/service';
import type { Lane } from '../../features/lane-engine/types';

const ALL_LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];

describe('Phase 17 — Completion: Reflection', () => {
  it('generates reflection without shame for abandoned', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'student',
      reason: 'anxious',
    });
    const reflection = generateRescueReflection(plan, 'abandoned');
    expect(reflection).toContain('okay');
    expect(reflection).not.toMatch(/fail|lose|shame|pathetic/i);
  });
  it('generates positive reflection for completed', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'game_like',
      reason: 'too_big',
    });
    expect(generateRescueReflection(plan, 'completed')).toMatch(
      /Completed|step/i,
    );
  });
});

describe('Phase 17 — Completion: Progress saved', () => {
  it('completion record captures duration, outcome, and next recommendation', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'deep_creative',
      reason: 'unclear',
    });
    const record = buildRescueCompletionRecord(plan, 'completed', 420);
    expect(record.outcome).toBe('completed');
    expect(record.worked).toBe(true);
    expect(record.durationSeconds).toBe(420);
    expect(record.nextRecommendation).toBeTruthy();
    expect(record.completedAt).toBeGreaterThan(0);
    expect(record.reason).toBe('unclear');
  });
  it('partial completion records worked=true', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'minimal_normal',
      reason: 'tired',
    });
    const record = buildRescueCompletionRecord(plan, 'partial', 180);
    expect(record.outcome).toBe('partial');
    expect(record.worked).toBe(true);
  });
});

describe('Phase 17 — Completion: Memory candidate', () => {
  it('creates memory on completion', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'student',
      reason: 'unclear',
    });
    const memory = buildRescueCompletionMemory(plan, 'completed');
    expect(memory.source).toBe('rescue_completion');
    expect(memory.confidence).toBeGreaterThanOrEqual(0.7);
    expect(memory.text).toContain('successfully');
  });
  it('partial completion creates lower confidence memory', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'game_like',
      reason: 'tired',
    });
    const memory = buildRescueCompletionMemory(plan, 'partial');
    expect(memory.confidence).toBeGreaterThanOrEqual(0.4);
    expect(memory.confidence).toBeLessThan(0.8);
  });
  it('abandoned completion creates low-confidence memory', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'deep_creative',
      reason: 'anxious',
    });
    const memory = buildRescueCompletionMemory(plan, 'abandoned');
    expect(memory.confidence).toBe(0.4);
    expect(memory.text).toContain('pause');
  });
});

describe('Phase 17 — Completion: Next action', () => {
  it.each(ALL_LANES)(
    '%s provides lane-specific next recommendation',
    (lane) => {
      const plan = createRescuePlan({ userId: 'u1', lane, reason: 'unclear' });
      const record = buildRescueCompletionRecord(plan, 'completed', 480);
      expect(record.nextRecommendation).toBeTruthy();
      expect(record.nextRecommendation.length).toBeGreaterThan(10);
    },
  );
});

describe('Phase 17 — Completion: Unlock decision', () => {
  it('builds rescue session params with source=rescue', () => {
    const plan = createRescuePlan({
      userId: 'u1',
      lane: 'game_like',
      reason: 'too_big',
    });
    const params = buildRescueSessionParams(plan);
    expect(params.source).toBe('rescue');
    expect(params.rescuePlanId).toBeTruthy();
    expect(params.suggestedDurationSeconds).toBeGreaterThanOrEqual(5 * 60);
  });
});
