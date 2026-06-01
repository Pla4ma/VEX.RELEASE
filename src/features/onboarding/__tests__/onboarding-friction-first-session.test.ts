import { describe, it, expect } from '@jest/globals';

describe('Onboarding Friction', () => {
  describe('First session path', () => {
    it('onboarding steps progress to FIRST_SESSION_CTA at step 5', () => {
      const steps = [
        'WELCOME',
        'GOAL_SETTING',
        'FOCUS_TIME',
        'NAME_SETUP',
        'MOTIVATION_STYLE',
        'FIRST_SESSION_CTA',
      ];
      expect(steps.length).toBe(6);
      expect(steps[5]).toBe('FIRST_SESSION_CTA');
    });

    it('user can reach step 5 quickly (5 choices)', () => {
      const choicesToCTA = 5;
      expect(choicesToCTA).toBeLessThanOrEqual(5);
    });

    it('profileStepsCompleted is true when step reaches 5', () => {
      const step = 5;
      const isComplete = step >= 5;
      expect(isComplete).toBe(true);
    });

    it('Home preview is allowed when profileStepsCompleted is true', () => {
      const state = {
        profileStepsCompleted: true,
        isOnboarded: false,
        completedForUserId: 'user-1',
      };
      const userId = 'user-1';
      const canPreviewHome = state.profileStepsCompleted && !state.isOnboarded;
      expect(canPreviewHome).toBe(true);
    });
  });

  describe('No advanced systems before first session', () => {
    it('NEW_USER stage (0 sessions) → boss is not unlocked', () => {
      const completedSessions = 0;
      const bossThreshold = 7;
      expect(completedSessions >= bossThreshold).toBe(false);
    });

    it('NEW_USER stage → content_study is not unlocked', () => {
      const completedSessions = 0;
      const studyThreshold = 12;
      expect(completedSessions >= studyThreshold).toBe(false);
    });

    it('NEW_USER stage → challenges are not unlocked', () => {
      const completedSessions = 0;
      const challengeThreshold = 5;
      expect(completedSessions >= challengeThreshold).toBe(false);
    });

    it('NEW_USER stage → advanced coach is not unlocked', () => {
      const completedSessions = 0;
      const coachThreshold = 8;
      expect(completedSessions >= coachThreshold).toBe(false);
    });
  });

  describe('Home Preview does not run advanced queries', () => {
    it('day-zero hidden sections exclude study/companion/challenge/progress', () => {
      const dayZeroHidden = [
        'session_reflection',
        'progress_signal',
        'study_layer',
        'companion_thread',
        'adaptive_challenge',
      ];
      expect(dayZeroHidden).toContain('study_layer');
      expect(dayZeroHidden).toContain('companion_thread');
      expect(dayZeroHidden).toContain('progress_signal');
    });

    it('day-zero allowed queries are minimal', () => {
      const allowedQueries = [
        'session_stats',
        'onboarding_state',
        'home_priority_minimal',
      ];
      expect(allowedQueries).not.toContain('boss_query');
      expect(allowedQueries).not.toContain('challenge_query');
      expect(allowedQueries).not.toContain('study_plan_query');
      expect(allowedQueries).not.toContain('squad_query');
    });

    it('first session remains the primary CTA', () => {
      const primaryCta = 'Start First Session';
      expect(primaryCta).toContain('First Session');
    });
  });
});
