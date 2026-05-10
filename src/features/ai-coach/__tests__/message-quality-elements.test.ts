import { describe, expect, it } from 'vitest';
import { MessageQualityElements, validateMessageQuality } from '../message-quality-gate';

describe('Message quality element detection', () => {
  it('detects observed behavior, recommendations, timing, reasons, actions, and confidence', () => {
    const cases = [
      ['Your 5-day streak is at risk.', MessageQualityElements.OBSERVED_BEHAVIOR],
      ['Try a 25-minute recovery session.', MessageQualityElements.SPECIFIC_RECOMMENDATION],
      ['Try a session right now.', MessageQualityElements.TIMING_SUGGESTION],
      ['Because your streak is at risk.', MessageQualityElements.REASON],
      ['Start a session now.', MessageQualityElements.NEXT_ACTION],
      ["I'm 85% sure this will work.", MessageQualityElements.CONFIDENCE_LEVEL],
    ];

    cases.forEach(([content, element], index) => {
      const result = validateMessageQuality(`element-${index}`, content, 'SESSION_SUGGESTION');
      expect(result.qualityElements).toContain(element);
    });
  });

  it('scores quality and generic messages appropriately', () => {
    const quality = validateMessageQuality(
      'quality',
      'Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your 5-day streak.',
      'STREAK_RISK'
    );
    const generic = validateMessageQuality('generic', 'Keep going! You are doing great!', 'MOTIVATION_BOOST');
    const long = validateMessageQuality(
      'long',
      `Your ${'amazing '.repeat(50)}5-day streak is at risk. Try a session.`,
      'STREAK_RISK'
    );

    expect(quality.confidence).toBeGreaterThan(0.8);
    expect(generic.confidence).toBeLessThan(0.3);
    expect(long.confidence).toBeLessThan(0.7);
  });

  it('detects all quality element types in one comprehensive message', () => {
    const result = validateMessageQuality(
      'comprehensive',
      'Your 5-day streak shows evening strength. I am 85% confident a 25-minute challenging session at 8 PM will maintain momentum because it is based on your patterns. Start this session now.',
      'STREAK_RISK'
    );

    expect(result.qualityElements).toEqual(expect.arrayContaining([
      MessageQualityElements.OBSERVED_BEHAVIOR,
      MessageQualityElements.SPECIFIC_RECOMMENDATION,
      MessageQualityElements.TIMING_SUGGESTION,
      MessageQualityElements.REASON,
      MessageQualityElements.NEXT_ACTION,
      MessageQualityElements.CONFIDENCE_LEVEL,
    ]));
    expect(result.passesQualityGate).toBe(true);
  });
});
