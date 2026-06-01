import {
  ComebackPlanSchema,
  CoachMessageSchema,
  GenerateMessageInputSchema,
  ProcessBehaviorSignalInputSchema,
  ActivateComebackInputSchema,
} from '../schemas';
describe('AI Coach Schemas — Plans, Messages & Inputs', () => {
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
        expect(() =>
          ProcessBehaviorSignalInputSchema.parse(valid),
        ).not.toThrow();
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
