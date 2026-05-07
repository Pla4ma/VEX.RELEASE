/**
 * AI Coach Message Quality Gate Tests
 * Phase 7 - P7-02 Verification
 */

import { describe, it, expect } from 'vitest';
import {
  validateMessageQuality,
  APPROVED_MESSAGE_EXAMPLES,
  REJECTED_MESSAGE_EXAMPLES,
  createMockQualityAnalysis,
  batchValidateMessages,
  MessageQualityElements,
  type MessageQualityAnalysis,
} from '../message-quality-gate';

describe('Message Quality Gate', () => {
  describe('Quality Validation', () => {
    it('should approve high-quality messages with multiple elements', () => {
      const result = validateMessageQuality(
        'msg-1',
        'Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your 5-day streak.',
        'STREAK_RISK'
      );

      expect(result.passesQualityGate).toBe(true);
      expect(result.qualityElements).toContain(MessageQualityElements.OBSERVED_BEHAVIOR);
      expect(result.qualityElements).toContain(MessageQualityElements.SPECIFIC_RECOMMENDATION);
      expect(result.qualityElements).toContain(MessageQualityElements.TIMING_SUGGESTION);
      expect(result.isGeneric).toBe(false);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestedAction).toBe('approve');
    });

    it('should reject generic encouragement messages', () => {
      const result = validateMessageQuality(
        'msg-2',
        'Keep going! You are doing great!',
        'STREAK_RISK'
      );

      expect(result.passesQualityGate).toBe(false);
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.length).toBeGreaterThan(0);
      expect(result.suggestedAction).toBe('reject');
    });

    it('should reject messages with fewer than 2 quality elements', () => {
      const result = validateMessageQuality(
        'msg-3',
        'Try a session.',
        'SESSION_SUGGESTION'
      );

      expect(result.passesQualityGate).toBe(false);
      expect(result.qualityElements.length).toBeLessThan(2);
      expect(result.suggestedAction).toMatch(/reject|improve/); // Accept either reject or improve
    });

    it('should require at least 2 quality elements for approval', () => {
      const messageWithOneElement = 'Your 5-day streak is at risk.';
      const result = validateMessageQuality('msg-4', messageWithOneElement, 'STREAK_RISK');
      
      expect(result.qualityElements).toContain(MessageQualityElements.OBSERVED_BEHAVIOR);
      expect(result.qualityElements.length).toBe(1);
      expect(result.passesQualityGate).toBe(false);
    });

    it('should approve messages with exactly 2 quality elements', () => {
      const messageWithTwoElements = 'Your 5-day streak is at risk. Try a 25-minute session tonight.';
      const result = validateMessageQuality('msg-5', messageWithTwoElements, 'STREAK_RISK');
      
      expect(result.qualityElements.length).toBeGreaterThanOrEqual(2);
      expect(result.passesQualityGate).toBe(true);
    });
  });

  describe('Generic Pattern Detection', () => {
    it('should detect "Keep going" as generic', () => {
      const result = validateMessageQuality('msg-6', 'Keep going with your focus!', 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some(reason => reason.includes('keep going'))).toBe(true);
    });

    it('should detect "You are doing great" as generic', () => {
      const result = validateMessageQuality('msg-7', 'You are doing great!', 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some(reason => reason.includes('you are doing great'))).toBe(true);
    });

    it('should detect "Try focusing more" as generic', () => {
      const result = validateMessageQuality('msg-8', 'Try focusing more today.', 'SESSION_SUGGESTION');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some(reason => reason.includes('try focusing more'))).toBe(true);
    });

    it('should detect "Come back today" as generic', () => {
      const result = validateMessageQuality('msg-9', 'Come back today!', 'COMEBACK_SUPPORT');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some(reason => reason.includes('come back today'))).toBe(true);
    });

    it('should reject overly short messages', () => {
      const result = validateMessageQuality('msg-10', 'Good job!', 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some(reason => reason.includes('Message too short'))).toBe(true);
    });

    it('should reject messages without specific data', () => {
      const result = validateMessageQuality('msg-11', 'Your progress is wonderful! Keep believing in yourself!', 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      expect(result.genericReasons.some(reason => reason.includes('No specific user data'))).toBe(true);
    });

    it('should reject all-encouragement messages', () => {
      const result = validateMessageQuality('msg-12', 'You are amazing and incredible! Keep going and stay strong!', 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      // Should detect at least one generic phrase
      expect(result.genericReasons.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Element Detection', () => {
    it('should detect observed behavior patterns', () => {
      const messages = [
        'Your 5-day streak is at risk.',
        'Your last 3 sessions show improvement.',
        'You\'ve completed 12 sessions this week.',
        'Your streak is at 7 days.',
        'Your average session quality is 85%.',
      ];

      messages.forEach((content, i) => {
        const result = validateMessageQuality(`msg-${i + 13}`, content, 'PROGRESS_REMINDER');
        expect(result.qualityElements).toContain(MessageQualityElements.OBSERVED_BEHAVIOR);
      });
    });

    it('should detect specific recommendation patterns', () => {
      const messages = [
        'Try a 25-minute recovery session.',
        'Suggest a 30-minute challenging session.',
        'Consider an easy difficulty session.',
        'Aim for 45 minutes.',
        'Try the focus challenge.',
      ];

      messages.forEach((content, i) => {
        const result = validateMessageQuality(`msg-${i + 18}`, content, 'SESSION_SUGGESTION');
        expect(result.qualityElements).toContain(MessageQualityElements.SPECIFIC_RECOMMENDATION);
      });
    });

    it('should detect timing suggestion patterns', () => {
      const messages = [
        'Try a session right now.',
        'Perfect timing this afternoon.',
        'Good time to focus tonight.',
        'Your optimal time is 8 PM.',
        'Try before 9 PM.',
      ];

      messages.forEach((content, i) => {
        const result = validateMessageQuality(`msg-${i + 23}`, content, 'SESSION_SUGGESTION');
        expect(result.qualityElements).toContain(MessageQualityElements.TIMING_SUGGESTION);
      });
    });

    it('should detect reason patterns', () => {
      const messages = [
        'Because your streak is at risk.',
        'Since you\'ve been consistent.',
        'Due to your recent progress.',
        'This will help you maintain focus.',
        'Based on your patterns.',
      ];

      messages.forEach((content, i) => {
        const result = validateMessageQuality(`msg-${i + 28}`, content, 'DIFFICULTY_ADJUST');
        expect(result.qualityElements).toContain(MessageQualityElements.REASON);
      });
    });

    it('should detect next action patterns', () => {
      const messages = [
        'Start a session now.',
        'Complete the challenge.',
        'Accept the mission.',
        'Adjust your difficulty.',
        'View your progress.',
      ];

      messages.forEach((content, i) => {
        const result = validateMessageQuality(`msg-${i + 33}`, content, 'CHALLENGE_PROMPT');
        expect(result.qualityElements).toContain(MessageQualityElements.NEXT_ACTION);
      });
    });

    it('should detect confidence level patterns', () => {
      const messages = [
        'I\'m 85% sure this will work.',
        'I\'m confident based on your data.',
        'Highly likely to succeed.',
        'Your patterns suggest this timing.',
        'According to your recent sessions.',
      ];

      messages.forEach((content, i) => {
        const result = validateMessageQuality(`msg-${i + 38}`, content, 'SESSION_SUGGESTION');
        expect(result.qualityElements).toContain(MessageQualityElements.CONFIDENCE_LEVEL);
      });
    });
  });

  describe('Confidence Scoring', () => {
    it('should give high confidence to quality messages', () => {
      const result = validateMessageQuality(
        'msg-43',
        'Your strongest sessions this week started after 8 PM. Try a 25-minute Recovery session tonight to protect your 5-day streak.',
        'STREAK_RISK'
      );

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should penalize generic messages heavily', () => {
      const result = validateMessageQuality(
        'msg-44',
        'Keep going! You are doing great!',
        'MOTIVATION_BOOST'
      );

      expect(result.confidence).toBeLessThan(0.3);
    });

    it('should reward appropriate message length', () => {
      const goodLength = 'Your 5-day streak is at risk. Try a 25-minute session tonight to protect it.';
      const result = validateMessageQuality('msg-45', goodLength, 'STREAK_RISK');
      
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should penalize overly long messages', () => {
      const tooLong = 'Your ' + 'amazing '.repeat(50) + '5-day streak is at risk. Try a session.';
      const result = validateMessageQuality('msg-46', tooLong, 'STREAK_RISK');
      
      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  describe('Example Messages', () => {
    it('should approve all approved message examples', () => {
      APPROVED_MESSAGE_EXAMPLES.forEach((example, i) => {
        const result = validateMessageQuality(`example-${i}`, example.content, example.category);
        
        expect(result.passesQualityGate).toBe(true);
        expect(result.isGeneric).toBe(false);
        expect(result.suggestedAction).toBe('approve');
        
        // Check that expected elements are detected
        example.expectedElements.forEach(element => {
          expect(result.qualityElements).toContain(element);
        });
      });
    });

    it('should reject all rejected message examples', () => {
      REJECTED_MESSAGE_EXAMPLES.forEach((example, i) => {
        const result = validateMessageQuality(`rejected-${i}`, example.content, example.category);
        
        expect(result.passesQualityGate).toBe(false);
        expect(result.isGeneric).toBe(true);
        expect(result.suggestedAction).toBe('reject');
        
        // Check that rejection reasons are detected
        example.rejectionReasons.forEach(reason => {
          expect(result.genericReasons.some(r => r.includes(reason.slice(0, 20)))).toBe(true);
        });
      });
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple messages efficiently', () => {
      const messages = [
        { id: 'batch-1', content: 'Good job!', category: 'MOTIVATION_BOOST' },
        { id: 'batch-2', content: 'Your 5-day streak is at risk. Try 25 minutes tonight.', category: 'STREAK_RISK' },
        { id: 'batch-3', content: 'Keep going!', category: 'MOTIVATION_BOOST' },
      ];

      const results = batchValidateMessages(messages);

      expect(results).toHaveLength(3);
      expect(results[0].passesQualityGate).toBe(false);
      expect(results[1].passesQualityGate).toBe(true);
      expect(results[2].passesQualityGate).toBe(false);
    });

    it('should maintain message order in batch results', () => {
      const messages = [
        { id: 'order-1', content: 'Message 1', category: 'MOTIVATION_BOOST' },
        { id: 'order-2', content: 'Message 2', category: 'MOTIVATION_BOOST' },
        { id: 'order-3', content: 'Message 3', category: 'MOTIVATION_BOOST' },
      ];

      const results = batchValidateMessages(messages);

      expect(results[0].messageId).toBe('order-1');
      expect(results[1].messageId).toBe('order-2');
      expect(results[2].messageId).toBe('order-3');
    });
  });

  describe('Mock Data Generation', () => {
    it('should create valid mock quality analysis', () => {
      const mock = createMockQualityAnalysis();
      expect(mock.passesQualityGate).toBe(true);
      expect(mock.confidence).toBe(0.85);
      expect(mock.suggestedAction).toBe('approve');
    });

    it('should accept overrides in mock generation', () => {
      const mock = createMockQualityAnalysis({
        isGeneric: true,
        confidence: 0.2,
        suggestedAction: 'reject',
      });

      expect(mock.isGeneric).toBe(true);
      expect(mock.confidence).toBe(0.2);
      expect(mock.suggestedAction).toBe('reject');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const result = validateMessageQuality('msg-47', '', 'MOTIVATION_BOOST');
      expect(result.isGeneric).toBe(true);
      expect(result.passesQualityGate).toBe(false);
    });

    it('should handle very long content gracefully', () => {
      const longContent = 'Your '.repeat(1000) + 'streak is at risk.';
      const result = validateMessageQuality('msg-48', longContent, 'STREAK_RISK');
      expect(result).toBeDefined();
      expect(result.content.length).toBeLessThanOrEqual(1000); // Should be truncated by schema
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Your 5-day streak 🔥 is at risk! Try 25 mins tonight 😊';
      const result = validateMessageQuality('msg-49', specialContent, 'STREAK_RISK');
      expect(result).toBeDefined();
      expect(result.qualityElements.length).toBeGreaterThan(0);
    });

    it('should handle all message categories', () => {
      const categories = [
        'STREAK_RISK', 'SESSION_SUGGESTION', 'MILESTONE_HYPE', 'COMEBACK_SUPPORT',
        'POST_FAILURE', 'PROGRESS_REMINDER', 'DIFFICULTY_ADJUST', 'CHALLENGE_PROMPT',
        'MOTIVATION_BOOST', 'BREAK_SUGGESTION', 'OVERLOAD_WARNING'
      ];

      categories.forEach(category => {
        const result = validateMessageQuality(
          `msg-${category}`,
          'Your 5-day streak is at risk. Try 25 minutes tonight.',
          category
        );
        expect(result.category).toBe(category);
      });
    });
  });

  describe('Quality Elements Coverage', () => {
    it('should detect all quality element types', () => {
      const comprehensiveMessage = 
        'Your 5-day streak shows evening strength (observed behavior). ' +
        'I\'m 85% confident a 25-minute challenging session at 8 PM (specific recommendation + timing) ' +
        'will maintain your momentum because your patterns support it (reason). ' +
        'Start this session now to continue your progress (next action).';

      const result = validateMessageQuality('msg-50', comprehensiveMessage, 'STREAK_RISK');

      expect(result.qualityElements).toContain(MessageQualityElements.OBSERVED_BEHAVIOR);
      expect(result.qualityElements).toContain(MessageQualityElements.SPECIFIC_RECOMMENDATION);
      expect(result.qualityElements).toContain(MessageQualityElements.TIMING_SUGGESTION);
      expect(result.qualityElements).toContain(MessageQualityElements.REASON);
      expect(result.qualityElements).toContain(MessageQualityElements.NEXT_ACTION);
      expect(result.qualityElements).toContain(MessageQualityElements.CONFIDENCE_LEVEL);
      expect(result.qualityElements.length).toBeGreaterThanOrEqual(2);
      expect(result.passesQualityGate).toBe(true);
    });
  });
});