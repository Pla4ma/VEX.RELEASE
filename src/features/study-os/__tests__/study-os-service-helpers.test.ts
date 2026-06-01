/**
 * Study OS — Service Helpers Tests
 *
 * Covers: firstSentence, planId, makeBlock
 */

import { firstSentence } from '../service-helpers';
import { planId, makeBlock } from '../service';
import { StudyBlockSchema } from '../schemas';

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

// ─── firstSentence ───────────────────────────────────────────────

describe('firstSentence', () => {
  it('returns first sentence from period-separated text', () => {
    expect(firstSentence('Hello world. Second sentence.')).toBe('Hello world');
  });

  it('returns first sentence from exclamation-separated text', () => {
    expect(firstSentence('Amazing! But wait.')).toBe('Amazing');
  });

  it('returns first sentence from question-separated text', () => {
    expect(firstSentence('Is this correct? Yes it is.')).toBe('Is this correct');
  });

  it('returns full text if no sentence terminators', () => {
    expect(firstSentence('Just one thought')).toBe('Just one thought');
  });

  it('returns fallback for empty string', () => {
    expect(firstSentence('')).toBe('Study next useful section');
  });

  it('handles newline-separated text', () => {
    expect(firstSentence('First line\nSecond line')).toBe('First line');
  });

  it('trims whitespace from result', () => {
    expect(firstSentence('  Spaced out. Next.')).toBe('Spaced out');
  });
});

// ─── planId ──────────────────────────────────────────────────────

describe('planId', () => {
  it('generates correct format', () => {
    expect(planId('user-1', 1000)).toBe('user-1:study:1000');
  });

  it('includes userId and timestamp', () => {
    const id = planId('student-42', 1700000000000);
    expect(id).toContain('student-42');
    expect(id).toContain('1700000000000');
  });
});

// ─── makeBlock ───────────────────────────────────────────────────

describe('makeBlock', () => {
  it('creates a valid study block', () => {
    const block = makeBlock('plan-1', 'Read Chapter 1', 'Understand photosynthesis');
    expect(block.id).toBe('plan-1:block:1');
    expect(block.title).toBe('Read Chapter 1');
    expect(block.objective).toBe('Understand photosynthesis');
    expect(block.estimatedMinutes).toBe(25);
    expect(block.priority).toBe('medium');
    expect(block.status).toBe('not_started');
    expect(block.studyPlanId).toBe('plan-1');
  });

  it('validates against StudyBlockSchema', () => {
    const block = makeBlock('plan-2', 'Review notes', 'Summarize key points');
    expect(() => StudyBlockSchema.parse(block)).not.toThrow();
  });
});
