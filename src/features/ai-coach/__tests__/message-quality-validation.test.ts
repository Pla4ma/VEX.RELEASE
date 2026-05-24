import { describe, expect, it } from '@jest/globals';
import { MessageQualityElements, validateMessageQuality } from '../message-quality-gate';

describe('Message quality validation', () => {
  it('approves high-quality messages with multiple elements', () => {
    const result = validateMessageQuality(
      'msg-1',
      'Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your 5-day streak.',
      'STREAK_RISK'
    );

    expect(result.passesQualityGate).toBe(true);
    expect(result.qualityElements).toContain(MessageQualityElements.OBSERVED_BEHAVIOR);
    expect(result.qualityElements).toContain(MessageQualityElements.SPECIFIC_RECOMMENDATION);
    expect(result.qualityElements).toContain(MessageQualityElements.TIMING_SUGGESTION);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('rejects generic and underspecified messages', () => {
    const generic = validateMessageQuality('msg-2', 'Keep going! You are doing great!', 'STREAK_RISK');
    const thin = validateMessageQuality('msg-3', 'Try a session.', 'SESSION_SUGGESTION');
    const oneElement = validateMessageQuality('msg-4', 'Your 5-day streak is at risk.', 'STREAK_RISK');

    expect(generic.passesQualityGate).toBe(false);
    expect(generic.isGeneric).toBe(true);
    expect(thin.qualityElements.length).toBeLessThan(2);
    expect(oneElement.qualityElements.length).toBe(1);
    expect(oneElement.passesQualityGate).toBe(false);
  });

  it('approves messages with exactly two quality elements', () => {
    const result = validateMessageQuality(
      'msg-5',
      'Your 5-day streak is at risk. Try a 25-minute session tonight.',
      'STREAK_RISK'
    );

    expect(result.qualityElements.length).toBeGreaterThanOrEqual(2);
    expect(result.passesQualityGate).toBe(true);
  });

  it('detects banned generic patterns', () => {
    const messages = [
      ['Keep going with your focus!', 'keep going'],
      ['You are doing great!', 'you are doing great'],
      ['Try focusing more today.', 'try focusing more'],
      ['Come back today!', 'come back today'],
      ['Good job!', 'Message too short'],
      ['Your progress is wonderful! Keep believing in yourself!', 'No specific user data'],
    ];

    messages.forEach(([content, reason], index) => {
      const result = validateMessageQuality(`generic-${index}`, content, 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some((item) => item.includes(reason))).toBe(true);
    });
  });
});
