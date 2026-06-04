/**
 * Phase 3D — Run Mode Polish
 */

import {
  getLaneMechanicPolicy,
  buildLaneSessionBrief,
  resolveCompletionExperiencePolicy,
  decideHomeSurfaces,
  SessionMode,
  baseLaneProfile,
  baseStats,
  baseProfile,
  featureAvailability,
  completionInput,
} from './lane-test-helpers';
import type { Lane } from './lane-test-helpers';

describe('Phase 3D — Run Mode Polish', () => {
  const runProfile = baseLaneProfile({ primaryLane: 'game_like' });

  it('Run has no economy, shop, gems, wagers, or coins', () => {
    const policy = getLaneMechanicPolicy(runProfile);

    const economyMarkers = ['shop', 'gems', 'wagers', 'trading', 'paid_saves'];
    for (const marker of economyMarkers) {
      expect(policy.blockedMechanics).toContain(
        marker as (typeof policy.blockedMechanics)[number],
      );
    }

    const brief = buildLaneSessionBrief({
      lane: 'game_like',
      durationSeconds: 25 * 60,
    });
    const json = JSON.stringify(brief);
    expect(json).not.toMatch(
      /coin|gem|shop|wallet|wager|bounty|battle.?pass|paid.?save|inventory/i,
    );
  });

  it('Run completion hides boss_consequence_card without boss consequences', () => {
    const input = completionInput({
      lane: 'game_like',
      motivationStyle: 'coach_led',
      sessionMode: SessionMode.SPRINT,
      summary: {
        sessionId: 'run-no-boss-id',
        finalScore: 90,
        focusQuality: 85,
      },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.adaptivePayoff).not.toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).toContain('boss_consequence_card');
  });

  it('PersonalBoss requires evidence: boss_damage fires with game_like motivation + boss consequences', () => {
    const input = completionInput({
      lane: 'game_like',
      motivationStyle: 'game_like',
      sessionMode: SessionMode.SPRINT,
      consequences: { boss: { damage: 50 } },
      summary: { sessionId: 'run-boss-id', finalScore: 90, focusQuality: 85 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).not.toContain(
      'boss_consequence_card',
    );
  });

  it('Run completion hides all currency/economy surfaces', () => {
    const input = completionInput({
      lane: 'game_like',
      motivationStyle: 'game_like',
      sessionMode: SessionMode.SPRINT,
      consequences: { boss: { damage: 50 } },
      summary: {
        sessionId: 'run-currency-id',
        finalScore: 90,
        focusQuality: 85,
      },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    const currencySurfaces = [
      'coins_gems_wallet',
      'premium_chest',
      'battle_pass_card',
      'shop_inventory_prompts',
      'chest_reward_animation',
    ];
    for (const surface of currencySurfaces) {
      expect(policy.hiddenCompletionSurfaces).toContain(
        surface as (typeof policy.hiddenCompletionSurfaces)[number],
      );
    }
  });

  it('non-Run modes do not see full Run systems on home surfaces', () => {
    for (const lane of [
      'student',
      'deep_creative',
      'minimal_normal',
    ] as const) {
      const map = decideHomeSurfaces({
        behaviorStats: baseStats,
        featureAvailability,
        hasActiveBoss: false,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: false,
        isFirstSession: false,
        personalizationProfile: baseProfile,
        laneProfile: baseLaneProfile({ primaryLane: lane }),
      });

      expect(map.run_board ?? 'hidden').not.toBe('primary');
      expect(map.run_board ?? 'hidden').not.toBe('spotlight');

      const policy = getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: lane }),
      );
      const hasRunMechanics = policy.preferredMechanics.some((m) =>
        ['focus_run', 'personal_boss', 'companion_party_member'].includes(m),
      );
      if (lane === 'minimal_normal') {
        expect(hasRunMechanics).toBe(false);
      }
    }
  });

  it('non-Run completion does not use boss_damage payoff', () => {
    const nonRunLanes: Lane[] = ['student', 'deep_creative', 'minimal_normal'];
    for (const lane of nonRunLanes) {
      const input = completionInput({
        lane,
        motivationStyle: lane === 'minimal_normal' ? 'calm' : 'coach_led',
        primaryGoal: lane === 'student' ? 'STUDY' : 'WORK',
        sessionMode:
          lane === 'student' ? SessionMode.STUDY : SessionMode.LIGHT_FOCUS,
        consequences: { boss: { damage: 50 } },
        summary: {
          sessionId: `non-run-${lane}`,
          finalScore: 90,
          focusQuality: 85,
        },
      });

      const policy = resolveCompletionExperiencePolicy(input);
      expect(policy.adaptivePayoff).not.toBe('boss_damage');
    }
  });
});
