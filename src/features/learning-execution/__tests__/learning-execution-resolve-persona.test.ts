/**
 * Tests for service.ts (resolveLearningExecutionPersona).
 */

import { resolveLearningExecutionPersona } from '../service';

describe('service – resolveLearningExecutionPersona', () => {
  it('maps all five goals to their respective personae', () => {
    expect(resolveLearningExecutionPersona({ goal: 'STUDY' })).toBe('student');
    expect(resolveLearningExecutionPersona({ goal: 'LEARNING' })).toBe('learning');
    expect(resolveLearningExecutionPersona({ goal: 'WORK' })).toBe('work');
    expect(resolveLearningExecutionPersona({ goal: 'CREATIVE' })).toBe('creative');
    expect(resolveLearningExecutionPersona({ goal: 'PERSONAL' })).toBe('growth');
  });

  it('falls back to motivationPrimary when goal is null', () => {
    expect(
      resolveLearningExecutionPersona({ goal: null, motivationPrimary: 'student' }),
    ).toBe('learning');
    expect(
      resolveLearningExecutionPersona({ goal: null, motivationPrimary: 'creator' }),
    ).toBe('creative');
    expect(
      resolveLearningExecutionPersona({ goal: null, motivationPrimary: 'worker' }),
    ).toBe('work');
  });

  it('defaults to work when goal is null and motivationPrimary is unknown', () => {
    expect(
      resolveLearningExecutionPersona({ goal: null, motivationPrimary: 'other' }),
    ).toBe('work');
  });

  it('defaults to work when goal is null and motivationPrimary is undefined', () => {
    expect(
      resolveLearningExecutionPersona({ goal: null }),
    ).toBe('work');
  });

  it('defaults to work when goal is null and motivationPrimary is null', () => {
    expect(
      resolveLearningExecutionPersona({ goal: null, motivationPrimary: null }),
    ).toBe('work');
  });

  it('goal takes priority over motivationPrimary', () => {
    expect(
      resolveLearningExecutionPersona({ goal: 'STUDY', motivationPrimary: 'worker' }),
    ).toBe('student');
  });
});
