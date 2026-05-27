describe('Risk 3 — Boss HUD display policy consumption', () => {
  it('display policy correctly hides BossCombatHUD for all styles', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');

    const calm = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'calm',
      primaryGoal: 'focus',
      sessionMode: SessionMode.FLOW,
    });
    expect(calm.showBossHUD).toBe(false);

    const study = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      sessionMode: SessionMode.STUDY,
    });
    expect(study.showBossHUD).toBe(false);
    expect(study.showStudyTarget).toBe(true);

    const gameActive = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible',
      focusStage: 'active',
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });
    expect(gameActive.showBossHUD).toBe(false);
    expect(gameActive.showBossTinyIndicator).toBe(true);
    expect(gameActive.showMomentumScore).toBe(false);
  });

  it('purity score hidden by default in all display policies', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');

    const styles = ['calm', 'study_focused', 'game_like', 'intense', 'coach_led'] as const;
    for (const style of styles) {
      const policy = resolveActiveSessionDisplayPolicy({
        focusStage: 'active',
        motivationStyle: style,
        primaryGoal: 'focus',
        sessionMode: SessionMode.FLOW,
      });
      expect(policy.showPurityScore).toBe(false);
    }
  });
});
