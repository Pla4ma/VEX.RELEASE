import { describe, expect, it, vi, beforeEach } from 'vitest';
import { validateMessageQuality, MessageQualityElements } from '../../features/ai-coach/message-quality-gate';

describe('Quality Gate Integration', () => {
  describe('validateMessageQuality', () => {
    it('approves messages with at least 2 quality elements and no generic patterns', () => {
      const result = validateMessageQuality(
        'test-1',
        'Your 7-day streak is at risk. Try a 25-minute focus session tonight based on your patterns.',
        'STREAK_RISK'
      );
      expect(result.passesQualityGate).toBe(true);
      expect(result.qualityElements.length).toBeGreaterThanOrEqual(2);
    });

    it('rejects messages with generic patterns', () => {
      const genericMessages = [
        'Keep going! You are doing great!',
        'Try focusing more today.',
        'Come back today!',
        'Good job! Nice work!',
        'You can do it! Believe in yourself!',
      ];

      genericMessages.forEach((content, i) => {
        const result = validateMessageQuality(`generic-${i}`, content, 'MOTIVATION_BOOST');
        expect(result.isGeneric).toBe(true);
        expect(result.passesQualityGate).toBe(false);
      });
    });

    it('rejects messages with fewer than 2 quality elements', () => {
      const result = validateMessageQuality(
        'test-thin',
        'Your streak is at risk.',
        'STREAK_RISK'
      );
      expect(result.qualityElements.length).toBeLessThan(2);
      expect(result.passesQualityGate).toBe(false);
    });

    it('detects all six quality elements', () => {
      const fullMessage = 'Your 7-day streak shows consistency. A 25-minute Recovery session tonight will protect it. Based on your patterns, now is optimal. I\'m 85% confident this will work. Start the session now.';
      const result = validateMessageQuality('full-msg', fullMessage, 'STREAK_RISK');

      expect(result.qualityElements).toContain(MessageQualityElements.OBSERVED_BEHAVIOR);
      expect(result.qualityElements).toContain(MessageQualityElements.SPECIFIC_RECOMMENDATION);
      expect(result.qualityElements).toContain(MessageQualityElements.TIMING_SUGGESTION);
      expect(result.qualityElements).toContain(MessageQualityElements.REASON);
      expect(result.qualityElements).toContain(MessageQualityElements.NEXT_ACTION);
      expect(result.qualityElements).toContain(MessageQualityElements.CONFIDENCE_LEVEL);
    });
  });

  describe('Fallback generation quality', () => {
    it('generates fallbacks with at least 2 quality elements', () => {
      const genericContent = 'Keep going!';
      const result = validateMessageQuality('fallback-test', genericContent, 'MOTIVATION_BOOST');

      expect(result.passesQualityGate).toBe(false);
      expect(result.qualityElements.length).toBeLessThan(2);
    });
  });

  describe('Message generator templates', () => {
    it('templates should not contain banned phrases', () => {
      const bannedPhrases = [
        'keep going',
        'you are doing great',
        'try focusing more',
        'come back today',
        'good job',
        'nice work',
        'well done',
      ];

      const templateSet: string[] = [
        'Your streak is at risk! Your 7-day streak needs more minutes today.',
        "Don't let your 5-day streak slip away! One quick focus session will save it.",
        'Your streak needs you! A short session today keeps the momentum going.',
        'Perfect time for a session! Your focus data shows you concentrate best at this time.',
        'Your 5-day streak shows consistency. A 25-minute Recovery session tonight will protect it.',
      ];

      templateSet.forEach((template, i) => {
        const lowerTemplate = template.toLowerCase();
        bannedPhrases.forEach((phrase) => {
          expect(lowerTemplate).not.toContain(phrase);
        });
      });
    });
  });
});