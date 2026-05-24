import { SessionMode } from '../../../../session/modes';
import {
  COMPLETION_REWARD_EFFECTS,
  resolveActiveSessionDisplayPolicy,
} from '../active-session-display-policy';

describe('resolveActiveSessionDisplayPolicy', () => {
  it('hides BossCombatHUD for calm active focus', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'calm',
      primaryGoal: 'focus',
      sessionMode: SessionMode.FLOW,
    });

    expect(policy.showBossHUD).toBe(false);
    expect(policy.showBossTinyIndicator).toBe(false);
  });

  it('shows study target, not boss HUD, for study active focus', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      sessionMode: SessionMode.STUDY,
      studyLayerLabel: 'Study OS',
    });

    expect(policy.showStudyTarget).toBe(true);
    expect(policy.showBossHUD).toBe(false);
  });

  it('shows only tiny boss indicator for game-like active focus', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible',
      focusStage: 'active',
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });

    expect(policy.showBossTinyIndicator).toBe(true);
    expect(policy.showBossHUD).toBe(false);
    expect(policy.showMomentumScore).toBe(false);
  });

  it('hides coach banner during normal active focus', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'coach_led',
      primaryGoal: 'work',
      sessionMode: SessionMode.FLOW,
    });

    expect(policy.showCoachBanner).toBe(false);
  });

  it('allows coach banner only during pause or interruption', () => {
    const paused = resolveActiveSessionDisplayPolicy({
      focusStage: 'paused',
      motivationStyle: 'coach_led',
      primaryGoal: 'work',
      sessionMode: SessionMode.FLOW,
    });
    const interrupted = resolveActiveSessionDisplayPolicy({
      focusStage: 'interruption',
      motivationStyle: 'coach_led',
      primaryGoal: 'work',
      sessionMode: SessionMode.FLOW,
    });

    expect(paused.showCoachBanner).toBe(true);
    expect(interrupted.showCoachBanner).toBe(true);
  });

  it('hides purity score by default', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'intense',
      primaryGoal: 'work',
      sessionMode: SessionMode.SPRINT,
    });

    expect(policy.showPurityScore).toBe(false);
  });

  it('prevents multiple active overlays from stacking', () => {
    const policy = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'study_focused',
      plannedQuizBreakOptedIn: true,
      primaryGoal: 'study',
      sessionMode: SessionMode.STUDY,
    });

    expect(policy.showModeOverlay).toBe(false);
    expect(policy.showCoachBanner).toBe(false);
    expect(policy.showContractReminder).toBe(false);
  });

  it('keeps boss and reward effects on completion', () => {
    expect(COMPLETION_REWARD_EFFECTS).toEqual([
      'boss_damage_reveal',
      'xp_explosion',
      'chest_reward_animation',
      'coach_reflection',
    ]);
  });
});
