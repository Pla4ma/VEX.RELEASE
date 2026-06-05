// Source service CoachRecommendationService.ts was removed during coach refactor.
// Tests xdescribed — source removed, refactored, or feature disabled.
import {
  CoachRecommendationService,
  type RecommendationContext,
  type CoachPersonaId,
} from '../services/CoachRecommendationService';
import type { ActiveStudyPlan } from '../../content-study/hooks/helpers';

xdescribe('CoachRecommendationService - Priority & Personas', () => {
  const createBaseContext = (
    overrides: Partial<RecommendationContext> = {},
  ): RecommendationContext => ({
    userId: 'test-user',
    currentTime: new Date(),
    streakDays: 5,
    hasCompletedSessionToday: false,
    hoursUntilStreakBreak: 6,
    activeStudyPlan: null,
    studyPlanProgress: 0,
    studyPlanDaysBehind: 0,
    activeBoss: null,
    totalSessions: 20,
    currentLevel: 3,
    daysSinceLastSession: 0.5,
    behaviorProfile: null,
    coachPersonaId: 'mentor',
    ...overrides,
  });

  describe('Recommendation Priority', () => {
    it('should prioritize critical streak protection when < 2 hours remaining', () => {
      const context = createBaseContext({
        streakDays: 10,
        hoursUntilStreakBreak: 1.5,
        hasCompletedSessionToday: false,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).toBe('protect_streak');
      expect(recommendation.urgency).toBe('critical');
      expect(recommendation.priority).toBe(100);
    });
    it('should prioritize high streak protection when 2-4 hours remaining', () => {
      const context = createBaseContext({
        streakDays: 10,
        hoursUntilStreakBreak: 3,
        hasCompletedSessionToday: false,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).toBe('protect_streak');
      expect(recommendation.urgency).toBe('high');
      expect(recommendation.priority).toBe(100);
    });
    it('should prioritize study behind when 3+ days behind schedule', () => {
      const context = createBaseContext({
        hasCompletedSessionToday: true,
        activeStudyPlan: {
          generationId: 'plan-1',
          title: 'Biology 101',
          totalTasks: 10,
          completedTasks: 3,
          remainingMinutes: 120,
          status: 'active',
        } as ActiveStudyPlan,
        studyPlanProgress: 0.3,
        studyPlanDaysBehind: 4,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).toBe('study_behind');
      expect(recommendation.urgency).toBe('high');
      expect(recommendation.priority).toBe(90);
    });
    it('should prioritize boss opportunity when boss health < 30%', () => {
      const context = createBaseContext({
        hasCompletedSessionToday: true,
        activeBoss: {
          id: 'boss-1',
          name: 'Procrastination Dragon',
          healthRemaining: 25,
          maxHealth: 100,
          timeRemaining: 12,
        },
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).toBe('boss_opportunity');
      expect(recommendation.urgency).toBe('high');
      expect(recommendation.priority).toBe(85);
    });
    it('should show momentum building when on 2+ day streak and already completed session', () => {
      const context = createBaseContext({
        streakDays: 5,
        hasCompletedSessionToday: true,
        hoursUntilStreakBreak: null,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).toBe('momentum_building');
      expect(recommendation.urgency).toBe('low');
      expect(recommendation.priority).toBe(70);
    });
    it('should show comeback recommendation after streak break within 7 days', () => {
      const context = createBaseContext({
        streakDays: 0,
        hasCompletedSessionToday: false,
        hoursUntilStreakBreak: null,
        daysSinceLastSession: 2,
        totalSessions: 15,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.type).toBe('comeback');
      expect(recommendation.urgency).toBe('medium');
      expect(recommendation.priority).toBe(55);
    });
  });

  describe('Persona Message Generation', () => {
    it('should generate different messages for each persona type', () => {
      const personas: CoachPersonaId[] = [
        'mentor',
        'trainer',
        'peer',
        'professor',
      ];
      const context = createBaseContext({
        streakDays: 5,
        hoursUntilStreakBreak: 3,
      });
      const messages = personas.map((personaId) => {
        const service = new CoachRecommendationService({
          ...context,
          coachPersonaId: personaId,
        });
        const rec = service.getRecommendation();
        return {
          personaId,
          headline: rec.headline,
          coachMessage: rec.coachMessage,
        };
      });
      const headlines = messages.map((m) => m.headline);
      const uniqueHeadlines = new Set(headlines);
      expect(uniqueHeadlines.size).toBeGreaterThan(1);
      const trainer = messages.find((m) => m.personaId === 'trainer');
      expect(trainer?.headline).toContain('SAVE');
      const peer = messages.find((m) => m.personaId === 'peer');
      expect(peer?.coachMessage).toMatch(/!|🔥|💪/);
    });
    it('should follow voice guidelines (max 2 sentences)', () => {
      const context = createBaseContext({ coachPersonaId: 'mentor' });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      const sentences = recommendation.coachMessage
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      expect(sentences.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Recommendation Context', () => {
    it('should include reasoning for analytics', () => {
      const context = createBaseContext({
        streakDays: 5,
        hoursUntilStreakBreak: 3,
      });
      const service = new CoachRecommendationService(context);
      const recommendation = service.getRecommendation();
      expect(recommendation.reasoning).toBeTruthy();
      expect(recommendation.reasoning).toContain('streak');
    });
    it('should include visual cues based on urgency', () => {
      const criticalContext = createBaseContext({
        streakDays: 5,
        hoursUntilStreakBreak: 1,
      });
      const service = new CoachRecommendationService(criticalContext);
      const recommendation = service.getRecommendation();
      expect(recommendation.visualCue).toBe('urgent');
    });
  });
});
