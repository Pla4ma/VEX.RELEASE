/**
 * AI Coach Schema Validation Tests
 */

import {
  CoachPersonaSchema,
  CoachMessageTemplateSchema,
  BehaviorSignalSchema,
  BehaviorProfileSchema,
  InterventionRuleSchema,
  InterventionExecutionSchema,
  SessionRecommendationSchema,
  ComebackPlanSchema,
  CoachMessageSchema,
  CoachStateSchema,
  GenerateMessageInputSchema,
  ProcessBehaviorSignalInputSchema,
  ActivateComebackInputSchema,
} from '../schemas';

describe('AI Coach Schemas', () => {
  describe('CoachPersonaSchema', () => {
    it('validates correct persona', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Encouraging Mentor',
        description: 'Always supportive and positive',
        avatarUrl: 'https://example.com/avatar.png',
        voiceTone: 'ENCOURAGING',
        style: 'MENTOR',
        catchphrase: 'You have got this!',
        defaultEnabled: true,
      };

      expect(() => CoachPersonaSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid voice tone', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test',
        voiceTone: 'INVALID_TONE',
        style: 'MENTOR',
        catchphrase: 'Test',
        defaultEnabled: true,
      };

      expect(() => CoachPersonaSchema.parse(invalid)).toThrow();
    });
  });

  describe('CoachMessageTemplateSchema', () => {
    it('validates correct template', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        personaId: '123e4567-e89b-12d3-a456-426614174000',
        category: 'STREAK_RISK',
        subcategory: 'urgent',
        priority: 8,
        content: 'Your streak is at risk! {{hoursRemaining}} hours left.',
        conditions: [
          { type: 'STREAK_DAYS', operator: 'gt', value: 3 },
        ],
        variations: ['Alternative message'],
        cooldownHours: 4,
      };

      expect(() => CoachMessageTemplateSchema.parse(valid)).not.toThrow();
    });

    it('rejects priority out of range', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        personaId: '123e4567-e89b-12d3-a456-426614174000',
        category: 'STREAK_RISK',
        subcategory: 'urgent',
        priority: 15, // Too high
        content: 'Test',
        conditions: [],
        variations: [],
        cooldownHours: 4,
      };

      expect(() => CoachMessageTemplateSchema.parse(invalid)).toThrow();
    });
  });

  describe('BehaviorSignalSchema', () => {
    it('validates correct signal', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        signalType: 'SESSION_QUALITY_TREND',
        value: 0.85,
        confidence: 0.9,
        timestamp: Date.now(),
        metadata: { source: 'session' },
        expiresAt: Date.now() + 86400000,
      };

      expect(() => BehaviorSignalSchema.parse(valid)).not.toThrow();
    });

    it('rejects confidence out of range', () => {
      const invalid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        signalType: 'SESSION_QUALITY_TREND',
        value: 0.85,
        confidence: 1.5, // Too high
        timestamp: Date.now(),
        metadata: {},
        expiresAt: Date.now() + 86400000,
      };

      expect(() => BehaviorSignalSchema.parse(invalid)).toThrow();
    });
  });

  describe('BehaviorProfileSchema', () => {
    it('validates correct profile', () => {
      const valid = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        signals: [],
        lastUpdated: Date.now(),
        confidenceLevel: 'MEDIUM',
        coldStart: false,
        dataPoints: 15,
      };

      expect(() => BehaviorProfileSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid confidence level', () => {
      const invalid = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        signals: [],
        lastUpdated: Date.now(),
        confidenceLevel: 'VERY_HIGH', // Invalid
        coldStart: false,
        dataPoints: 15,
      };

      expect(() => BehaviorProfileSchema.parse(invalid)).toThrow();
    });
  });

  describe('InterventionRuleSchema', () => {
    it('validates correct rule', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Streak Risk Alert',
        trigger: { type: 'STREAK_AT_RISK', threshold: 24 },
        conditions: [{ field: 'streakDays', operator: 'gt', value: 3 }],
        action: {
          type: 'SEND_MESSAGE',
          messageTemplateId: '123e4567-e89b-12d3-a456-426614174000',
          deliveryMethod: 'BOTH',
          delayMinutes: 0,
        },
        priority: 10,
        cooldownHours: 4,
        maxPerDay: 3,
        enabled: true,
      };

      expect(() => InterventionRuleSchema.parse(valid)).not.toThrow();
    });
  });

  describe('ComebackPlanSchema', () => {
    it('validates correct comeback plan', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        previousStreak: 15,
        daysInactive: 5,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        sessionsCompleted: 1,
        targetSessions: 3,
        bonusMultiplier: 2.0,
        messages: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            day: 1,
            content: 'Welcome back!',
            sent: true,
            sentAt: Date.now(),
          },
        ],
      };

      expect(() => ComebackPlanSchema.parse(valid)).not.toThrow();
    });
  });

  describe('CoachMessageSchema', () => {
    it('validates correct message', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        personaId: '123e4567-e89b-12d3-a456-426614174000',
        category: 'STREAK_RISK',
        content: 'Your streak is at risk!',
        deliveryMethod: 'BOTH',
        priority: 8,
        status: 'SENT',
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: Date.now(),
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      };

      expect(() => CoachMessageSchema.parse(valid)).not.toThrow();
    });
  });

  describe('Input Schemas', () => {
    describe('GenerateMessageInputSchema', () => {
      it('validates correct input', () => {
        const valid = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          category: 'STREAK_RISK',
          context: { streakDays: 5 },
          preferredDelivery: 'BOTH',
        };

        expect(() => GenerateMessageInputSchema.parse(valid)).not.toThrow();
      });

      it('rejects invalid category', () => {
        const invalid = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          category: 'INVALID_CATEGORY',
          context: {},
          preferredDelivery: 'BOTH',
        };

        expect(() => GenerateMessageInputSchema.parse(invalid)).toThrow();
      });
    });

    describe('ProcessBehaviorSignalInputSchema', () => {
      it('validates correct input', () => {
        const valid = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          signalType: 'SESSION_QUALITY_TREND',
          value: 0.85,
        };

        expect(() => ProcessBehaviorSignalInputSchema.parse(valid)).not.toThrow();
      });
    });

    describe('ActivateComebackInputSchema', () => {
      it('validates correct input', () => {
        const valid = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          previousStreak: 10,
          daysInactive: 5,
        };

        expect(() => ActivateComebackInputSchema.parse(valid)).not.toThrow();
      });

      it('rejects negative days inactive', () => {
        const invalid = {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          previousStreak: 10,
          daysInactive: -1,
        };

        expect(() => ActivateComebackInputSchema.parse(invalid)).toThrow();
      });
    });
  });
});
