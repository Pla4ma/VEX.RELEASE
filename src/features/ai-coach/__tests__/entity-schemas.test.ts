import {
  CoachPersonaSchema,
  CoachMessageTemplateSchema,
  BehaviorSignalSchema,
  BehaviorProfileSchema,
  InterventionRuleSchema,
} from '../schemas';
describe('AI Coach Schemas — Entity Validation', () => {
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
        conditions: [{ type: 'STREAK_DAYS', operator: 'gt', value: 3 }],
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
        priority: 15,
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
        confidence: 1.5,
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
        confidenceLevel: 'VERY_HIGH',
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
});
