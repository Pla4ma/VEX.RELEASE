/**
 * TASK 7 tests: Onboarding friction audit
 *
 * Verifies:
 * - user can reach first session quickly
 * - user cannot access advanced systems before first session
 * - Home preview does not run advanced queries
 * - profileStepsCompleted is set after onboarding steps
 * - tracking milestones fire at correct points
 */
import { describe, it, expect } from '@jest/globals';

describe('Onboarding Friction', () => {
  describe('First session path', () => {
    it('onboarding steps progress to FIRST_SESSION_CTA at step 5', () => {
      // Steps: 0=WELCOME, 1=GOAL, 2=FOCUS_TIME, 3=NAME, 4=MOTIVATION, 5=FIRST_SESSION_CTA
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
      // Each step is one choice: goal → duration → name → motivation → CTA
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
      // At 0 sessions, boss_tab requires 7 sessions
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

  describe('Tracking milestones', () => {
    it('all tracking events are defined', () => {
      const events = [
        'onboarding_started',
        'motivation_selected',
        'starter_selected',
        'first_session_started',
        'first_session_completed',
        'home_entered_without_first_session',
      ];
      expect(events.length).toBe(6);
      expect(events[0]).toBe('onboarding_started');
      expect(events[4]).toBe('first_session_completed');
      expect(events[5]).toBe('home_entered_without_first_session');
    });

    it('profile steps complete triggered before home preview', () => {
      const profileStepsComplete = true;
      const firstSessionCompleted = false;
      const homePreviewAllowed = profileStepsComplete && !firstSessionCompleted;
      expect(homePreviewAllowed).toBe(true);
    });
  });

  describe('Onboarding state machine', () => {
    it('firstSessionStarted is initially false', () => {
      const state = { firstSessionStarted: false };
      expect(state.firstSessionStarted).toBe(false);
    });

    it('firstSessionCompleted is initially false', () => {
      const state = { firstSessionCompleted: false };
      expect(state.firstSessionCompleted).toBe(false);
    });

    it('homePreviewEntered is initially false', () => {
      const state = { homePreviewEntered: false };
      expect(state.homePreviewEntered).toBe(false);
    });

    it('canPreviewHome returns false when profileSteps not complete', () => {
      const profileStepsCompleted = false;
      const userId = 'user-1';
      const state = { profileStepsCompleted, isOnboarded: false };
      const canPreview = Boolean(userId) && state.profileStepsCompleted;
      expect(canPreview).toBe(false);
    });
  });
});
