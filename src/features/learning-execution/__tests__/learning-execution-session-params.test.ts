/**
 * Tests for service.ts (buildLearningSessionParams).
 */

import { buildLearningSessionParams } from '../service';

describe('service – buildLearningSessionParams', () => {
  const baseTarget = {
    contentId: 'c1',
    focusAreas: ['focus-a'],
    generationId: 'g1',
    nextTaskId: 't1',
    persona: 'student' as const,
    remainingMinutes: 20,
    title: 'Study Session',
  };

  it('maps student persona to STUDY preset mode', () => {
    const params = buildLearningSessionParams(baseTarget);
    expect(params.presetMode).toBe('STUDY');
  });

  it('maps learning persona to STUDY preset mode', () => {
    const params = buildLearningSessionParams({
      ...baseTarget,
      persona: 'learning',
    });
    expect(params.presetMode).toBe('STUDY');
  });

  it('maps creative persona to CREATIVE preset mode', () => {
    const params = buildLearningSessionParams({
      ...baseTarget,
      persona: 'creative',
    });
    expect(params.presetMode).toBe('CREATIVE');
  });

  it('maps work persona to DEEP_WORK preset mode', () => {
    const params = buildLearningSessionParams({
      ...baseTarget,
      persona: 'work',
    });
    expect(params.presetMode).toBe('DEEP_WORK');
  });

  it('maps growth persona to DEEP_WORK preset mode', () => {
    const params = buildLearningSessionParams({
      ...baseTarget,
      persona: 'growth',
    });
    expect(params.presetMode).toBe('DEEP_WORK');
  });

  it('sets source to learning-execution', () => {
    const params = buildLearningSessionParams(baseTarget);
    expect(params.source).toBe('learning-execution');
  });

  it('converts remainingMinutes to suggestedDurationSeconds', () => {
    const params = buildLearningSessionParams({
      ...baseTarget,
      remainingMinutes: 45,
    });
    expect(params.suggestedDurationSeconds).toBe(2700);
  });

  it('sets studyPlanId to generationId', () => {
    const params = buildLearningSessionParams(baseTarget);
    expect(params.studyPlanId).toBe('g1');
  });

  it('sets learningExecutionTaskId to undefined when nextTaskId is null', () => {
    const params = buildLearningSessionParams({
      ...baseTarget,
      nextTaskId: null,
    });
    expect(params.learningExecutionTaskId).toBeUndefined();
  });
});
