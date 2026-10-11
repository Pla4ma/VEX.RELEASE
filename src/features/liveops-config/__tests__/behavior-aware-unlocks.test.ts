import { buildFeatureAccess } from '../feature-access';
import { deriveUnlockBehaviorEvidence } from '../feature-access-behavior';
import type {
  BehaviorSignal,
} from '../../personalization/behavior-signal-schemas';
import type { MotivationProfile } from '../feature-access-types';

const signal = (
  signalType: BehaviorSignal['signalType'],
  surfaceKey: string,
): BehaviorSignal => ({
  userId: '11111111-1111-4111-8111-111111111111',
  surfaceKey,
  signalType,
  source: signalType.startsWith('study') ? 'study_layer' : 'home_content',
  timestamp: Date.now(),
});

describe('behavior-aware unlocks', () => {
  it('derives evidence from user-scoped behavior signals', () => {
    const evidence = deriveUnlockBehaviorEvidence([
      signal('study_surface_clicked', 'content_study'),
      signal('study_surface_clicked', 'content_study'),
      signal('coach_surface_clicked', 'ai_coach_advanced'),
      signal('boss_cta_clicked', 'boss_tab'),
    ], 4);

    expect(evidence.studySurfaceClicks).toBe(2);
    expect(evidence.coachInteractions).toBe(1);
    expect(evidence.bossEngagement).toBe('low');
  });

  it('does not overfit unlocks before three completed sessions', () => {
    const baseline = buildFeatureAccess({ totalCompletedSessions: 2 });
    const evidence = deriveUnlockBehaviorEvidence(
      [signal('study_surface_clicked', 'content_study')],
      2,
    );
    const withEvidence = buildFeatureAccess({
      totalCompletedSessions: 2,
      behaviorEvidence: evidence,
    });

    expect(withEvidence.features.content_study.isUnlocked).toBe(
      baseline.features.content_study.isUnlocked,
    );
  });

  it('uses study usage evidence to accelerate study unlocks after cold start', () => {
    const evidence = deriveUnlockBehaviorEvidence(
      [
        signal('study_surface_clicked', 'content_study'),
        signal('study_surface_clicked', 'content_study'),
        signal('study_surface_clicked', 'content_study'),
      ],
      5,
    );
    const result = buildFeatureAccess({
      totalCompletedSessions: 5,
      behaviorEvidence: evidence,
    });
    expect(result.features.content_study.isUnlocked).toBe(true);
  });
  it.each([0, 1, 3, 5, 7, 10, 12, 18, 20, 40])(
    'keeps core and premium truth stable at %d completed sessions',
    (completedSessions) => {
      const profiles: MotivationProfile[] = [
        { primary: 'calm', secondary: [] },
        { primary: 'study_focused', secondary: [] },
        { primary: 'game_like', secondary: [] },
        { primary: 'coach_led', secondary: [] },
        { primary: 'intense', secondary: [] },
      ];
      for (const motivationProfile of profiles) {
        const result = buildFeatureAccess({
          totalCompletedSessions: completedSessions,
          motivationProfile,
        });
        expect(result.features.focus_session.isUnlocked).toBe(true);
        expect(result.features.progress_view.isUnlocked).toBe(true);
        expect(result.features.premium_paywall.isUnlocked).toBe(
          completedSessions >= 5,
        );
      }
    },
  );

});
