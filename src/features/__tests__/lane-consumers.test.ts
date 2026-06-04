import {
  baseLaneProfile,
  baseStats,
  baseProfile,
  featureAvailability,
  completionInput,
  resolveCompletionExperiencePolicy,
  buildLaneSessionBrief,
  decideHomeSurfaces,
  SessionMode,
} from './lane-polish/helpers';
import type {
  Lane,
  CompletionExperiencePolicy,
} from './lane-polish/helpers';

describe('Phase 3F — Consumers', () => {
  it('Home consumes LaneProfile to decide surfaces per lane', () => {
    const input = {
      behaviorStats: { ...baseStats, totalCompletedSessions: 4 },
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      personalizationProfile: baseProfile,
    };

    const studentMap = decideHomeSurfaces({
      ...input,
      laneProfile: baseLaneProfile({ primaryLane: 'student' }),
    });
    expect(studentMap.study_os).not.toBe('hidden');

    const runMap = decideHomeSurfaces({
      ...input,
      behaviorStats: {
        ...input.behaviorStats,
        bossChallengeEngagement: 'medium',
      },
      hasActiveBoss: true,
      hasActiveStudyPlan: false,
      personalizationProfile: { ...baseProfile, motivationStyle: 'game_like' },
      laneProfile: baseLaneProfile({ primaryLane: 'game_like' }),
    });
    expect(runMap.run_board).not.toBe('hidden');

    const projectMap = decideHomeSurfaces({
      ...input,
      behaviorStats: { ...input.behaviorStats, projectFocusUsageRatio: 0.6 },
      hasActiveStudyPlan: false,
      personalizationProfile: { ...baseProfile, primaryGoal: 'creative' },
      laneProfile: baseLaneProfile({ primaryLane: 'deep_creative' }),
    });
    expect(projectMap.project_thread).not.toBe('hidden');

    const cleanMap = decideHomeSurfaces({
      ...input,
      hasActiveStudyPlan: false,
      personalizationProfile: {
        ...baseProfile,
        motivationStyle: 'calm',
        gamificationIntensity: 'minimal',
      },
      laneProfile: baseLaneProfile({ primaryLane: 'minimal_normal' }),
    });
    expect(cleanMap.today_strip).not.toBe('hidden');
  });

  it('SessionStart consumes LaneProfile to produce lane-aware brief', () => {
    const lanes: Lane[] = [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ];
    const briefs = lanes.map((lane) =>
      buildLaneSessionBrief({
        laneProfile: baseLaneProfile({ primaryLane: lane }),
        durationSeconds: 25 * 60,
      }),
    );

    const ctaLabels = briefs.map((b) => b.ctaLabel);
    const uniqueCtas = new Set(ctaLabels);
    expect(uniqueCtas.size).toBe(4);

    const expectedCtas = [
      'Start study block',
      'Start clean run',
      'Resume project block',
      'Start clean action',
    ];
    for (const expected of expectedCtas) {
      expect(ctaLabels).toContain(expected);
    }

    for (const brief of briefs) {
      expect(brief.sessionMode).toBeDefined();
      expect(brief.suggestedDurationSeconds).toBeGreaterThan(0);
      expect(brief.focusStrategyLoadout.length).toBeGreaterThan(0);
      expect(brief.successCondition).toBeDefined();
    }
  });

  it('Completion consumes LaneProfile for lane-aware experience', () => {
    const completionPolicies: Record<Lane, CompletionExperiencePolicy> = {
      student: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'student',
          motivationStyle: 'study_focused',
          primaryGoal: 'STUDY',
          sessionMode: SessionMode.STUDY,
          summary: {
            sessionId: 'arch-student',
            finalScore: 92,
            focusQuality: 88,
          },
        }),
      ),
      game_like: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'game_like',
          motivationStyle: 'game_like',
          sessionMode: SessionMode.SPRINT,
          consequences: { boss: { damage: 50 } },
          summary: { sessionId: 'arch-run', finalScore: 90, focusQuality: 85 },
        }),
      ),
      deep_creative: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'deep_creative',
          motivationStyle: 'creator',
          primaryGoal: 'CREATIVE',
          sessionMode: SessionMode.CREATIVE,
          summary: {
            sessionId: 'arch-project',
            finalScore: 88,
            plannedDuration: 1800,
            effectiveDuration: 1800,
          },
        }),
      ),
      minimal_normal: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'minimal_normal',
          motivationStyle: 'calm',
          sessionMode: SessionMode.LIGHT_FOCUS,
          summary: { sessionId: 'arch-clean', finalScore: 95 },
        }),
      ),
    };

    const payoffs = Object.values(completionPolicies).map(
      (p) => p.adaptivePayoff,
    );
    const uniquePayoffs = new Set(payoffs);
    expect(uniquePayoffs.size).toBeGreaterThanOrEqual(2);

    const animations = Object.values(completionPolicies).map(
      (p) => p.animationLevel,
    );
    expect(animations).toContain('minimal');
    expect(animations).toContain('medium_high');
    expect(animations).toContain('low_medium');

    for (const policy of Object.values(completionPolicies)) {
      expect(policy.heroBeat).toBeDefined();
      expect(policy.hiddenCompletionSurfaces).toBeDefined();
      expect(policy.nextAction).toBeDefined();
    }
  });
});
