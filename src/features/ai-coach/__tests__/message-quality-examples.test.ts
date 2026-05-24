import { describe, expect, it } from '@jest/globals';
import {
  APPROVED_MESSAGE_EXAMPLES,
  batchValidateMessages,
  createMockQualityAnalysis,
  REJECTED_MESSAGE_EXAMPLES,
  validateMessageQuality,
} from '../message-quality-gate';

describe('Message quality examples and edge cases', () => {
  it('approves and rejects curated example sets', () => {
    APPROVED_MESSAGE_EXAMPLES.forEach((example, index) => {
      const result = validateMessageQuality(`approved-${index}`, example.content, example.category);
      expect(result.passesQualityGate).toBe(true);
      expect(result.isGeneric).toBe(false);
      expect(result.qualityElements).toEqual(expect.arrayContaining(example.expectedElements));
    });

    REJECTED_MESSAGE_EXAMPLES.forEach((example, index) => {
      const result = validateMessageQuality(`rejected-${index}`, example.content, example.category);
      expect(result.passesQualityGate).toBe(false);
      expect(result.isGeneric).toBe(true);
    });
  });

  it('validates batches and preserves order', () => {
    const results = batchValidateMessages([
      { id: 'batch-1', content: 'Good job!', category: 'MOTIVATION_BOOST' },
      { id: 'batch-2', content: 'Your 5-day streak is at risk. Try 25 minutes tonight.', category: 'STREAK_RISK' },
      { id: 'batch-3', content: 'Keep going!', category: 'MOTIVATION_BOOST' },
    ]);

    expect(results.map((result) => result.messageId)).toEqual(['batch-1', 'batch-2', 'batch-3']);
    expect(results.map((result) => result.passesQualityGate)).toEqual([false, true, false]);
  });

  it('creates mock quality analysis with overrides', () => {
    expect(createMockQualityAnalysis().suggestedAction).toBe('approve');
    expect(createMockQualityAnalysis({
      isGeneric: true,
      confidence: 0.2,
      suggestedAction: 'reject',
    })).toMatchObject({ isGeneric: true, confidence: 0.2, suggestedAction: 'reject' });
  });

  it('handles empty, long, special, and category-varied content', () => {
    expect(validateMessageQuality('empty', '', 'MOTIVATION_BOOST').passesQualityGate).toBe(false);
    expect(validateMessageQuality('long', `${'Your '.repeat(1000)}streak is at risk.`, 'STREAK_RISK'))
      .toBeDefined();
    expect(validateMessageQuality('special', 'Your 5-day streak is at risk! Try 25 mins tonight.', 'STREAK_RISK'))
      .toBeDefined();

    [
      'STREAK_RISK',
      'SESSION_SUGGESTION',
      'MILESTONE_HYPE',
      'COMEBACK_SUPPORT',
      'POST_FAILURE',
      'PROGRESS_REMINDER',
      'DIFFICULTY_ADJUST',
      'CHALLENGE_PROMPT',
      'MOTIVATION_BOOST',
      'BREAK_SUGGESTION',
      'OVERLOAD_WARNING',
    ].forEach((category) => {
      expect(validateMessageQuality(
        `category-${category}`,
        'Your 5-day streak is at risk. Try 25 minutes tonight.',
        category
      ).category).toBe(category);
    });
  });
});
