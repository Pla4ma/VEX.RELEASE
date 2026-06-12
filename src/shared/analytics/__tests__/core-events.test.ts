import {
  AuthEvents,
  SessionEvents,
  ProgressionEvents,
  FeatureEvents,
  OnboardingEvents,
} from '../core-events';
import type { BaseEventProperties, SessionEventProperties, EconomyEventProperties } from '../analytics-event-properties';

describe('core-events', () => {
  describe('AuthEvents', () => {
    it('has stable event names', () => {
      expect(AuthEvents.USER_SIGNED_UP).toBe('user_signed_up');
      expect(AuthEvents.USER_LOGGED_IN).toBe('user_logged_in');
      expect(AuthEvents.USER_LOGGED_OUT).toBe('user_logged_out');
      expect(AuthEvents.LOGIN_FAILED).toBe('login_failed');
      expect(AuthEvents.PASSWORD_RESET_REQUESTED).toBe('password_reset_requested');
      expect(AuthEvents.PASSWORD_RESET_COMPLETED).toBe('password_reset_completed');
    });

    it('all values are snake_case strings', () => {
      for (const value of Object.values(AuthEvents)) {
        expect(value).toMatch(/^[a-z_]+$/);
      }
    });
  });

  describe('SessionEvents', () => {
    it('has stable event names', () => {
      expect(SessionEvents.SESSION_STARTED).toBe('session_started');
      expect(SessionEvents.SESSION_COMPLETED).toBe('session_completed');
      expect(SessionEvents.SESSION_ABANDONED).toBe('session_abandoned');
      expect(SessionEvents.SESSION_PAUSED).toBe('session_paused');
      expect(SessionEvents.SESSION_RESUMED).toBe('session_resumed');
      expect(SessionEvents.SESSION_EXTENDED).toBe('session_extended');
      expect(SessionEvents.FOCUS_INTERVAL_COMPLETED).toBe('focus_interval_completed');
      expect(SessionEvents.BOSS_BATTLE_STARTED).toBe('boss_battle_started');
      expect(SessionEvents.BOSS_BATTLE_COMPLETED).toBe('boss_battle_completed');
      expect(SessionEvents.BOSS_BATTLE_FAILED).toBe('boss_battle_failed');
    });

    it('all values are snake_case strings', () => {
      for (const value of Object.values(SessionEvents)) {
        expect(value).toMatch(/^[a-z_]+$/);
      }
    });
  });

  describe('ProgressionEvents', () => {
    it('has stable event names', () => {
      expect(ProgressionEvents.XP_GRANTED).toBe('xp_granted');
      expect(ProgressionEvents.XP_GAINED).toBe('xp_gained');
      expect(ProgressionEvents.LEVEL_UP).toBe('level_up');
      expect(ProgressionEvents.STREAK_UPDATED).toBe('streak_updated');
      expect(ProgressionEvents.STREAK_BROKEN).toBe('streak_broken');
      expect(ProgressionEvents.STREAK_MILESTONE_REACHED).toBe('streak_milestone_reached');
      expect(ProgressionEvents.ACHIEVEMENT_UNLOCKED).toBe('achievement_unlocked');
      expect(ProgressionEvents.RANK_CHANGED).toBe('rank_changed');
    });
  });

  describe('FeatureEvents', () => {
    it('has stable event names', () => {
      expect(FeatureEvents.SETTINGS_CHANGED).toBe('settings_changed');
      expect(FeatureEvents.TUTORIAL_COMPLETED).toBe('tutorial_completed');
      expect(FeatureEvents.TUTORIAL_SKIPPED).toBe('tutorial_skipped');
      expect(FeatureEvents.HELP_CENTER_OPENED).toBe('help_center_opened');
      expect(FeatureEvents.FEEDBACK_SUBMITTED).toBe('feedback_submitted');
      expect(FeatureEvents.NETWORK_STATUS_CHANGED).toBe('network_status_changed');
      expect(FeatureEvents.BANNER_DISMISSED).toBe('banner_dismissed');
      expect(FeatureEvents.BANNER_REAPPEARED).toBe('banner_reappeared');
    });
  });

  describe('OnboardingEvents', () => {
    it('has stable event names', () => {
      expect(OnboardingEvents.ONBOARDING_STARTED).toBe('onboarding_started');
      expect(OnboardingEvents.ONBOARDING_GOAL_SET).toBe('onboarding_goal_set');
      expect(OnboardingEvents.ONBOARDING_COMPLETED).toBe('onboarding_completed');
    });
  });
});

describe('analytics-event-properties', () => {
  it('BaseEventProperties accepts standard fields', () => {
    const props: BaseEventProperties = {
      user_id: 'user-1',
      session_id: 'session-1',
      timestamp: Date.now(),
      outcome: 'success',
      platform: 'ios',
    };
    expect(props.user_id).toBe('user-1');
    expect(props.outcome).toBe('success');
    expect(props.platform).toBe('ios');
  });

  it('SessionEventProperties extends base with session fields', () => {
    const props: SessionEventProperties = {
      duration_seconds: 300,
      completion_percentage: 100,
      session_type: 'focus',
      difficulty: 'medium',
      xp_earned: 50,
    };
    expect(props.duration_seconds).toBe(300);
    expect(props.session_type).toBe('focus');
  });

  it('EconomyEventProperties extends base with economy fields', () => {
    const props: EconomyEventProperties = {
      currency_type: 'coins',
      amount: 100,
      item_id: 'item-1',
      item_rarity: 'RARE',
      price: 9.99,
    };
    expect(props.currency_type).toBe('coins');
    expect(props.item_rarity).toBe('RARE');
  });
});
