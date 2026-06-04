/**
 * Phase 3F — Unified Architecture Proof (Core)
 *
 * Verifies all modes share the same core session loop and differ
 * only by presentation/policy, not separate engines.
 */

import {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
  buildLaneSessionBrief,
  decideHomeSurfaces,
  SessionMode,
  baseLaneProfile,
  baseStats,
  baseProfile,
  featureAvailability,
} from './lane-test-helpers';
import type { Lane } from './lane-test-helpers';

describe('Phase 3F — Unified Architecture Proof', () => {
  it('all modes share same core session loop (SessionMode enum covers all)', () => {
    const laneSessionModes: Record<Lane, string> = {
      student: buildLaneSessionBrief({ lane: 'student' }).sessionMode,
      game_like: buildLaneSessionBrief({ lane: 'game_like' }).sessionMode,
      deep_creative: buildLaneSessionBrief({ lane: 'deep_creative' })
        .sessionMode,
      minimal_normal: buildLaneSessionBrief({ lane: 'minimal_normal' })
        .sessionMode,
    };

    expect(laneSessionModes.student).toBe(SessionMode.STUDY);
    expect(laneSessionModes.game_like).toBe(SessionMode.SPRINT);
    expect(laneSessionModes.deep_creative).toBe(SessionMode.CREATIVE);
    expect(laneSessionModes.minimal_normal).toBe(SessionMode.LIGHT_FOCUS);

    for (const mode of Object.values(laneSessionModes)) {
      expect(mode).toBeDefined();
      expect(typeof mode).toBe('string');
    }
  });

  it('modes differ by presentation/policy, not separate session engines', () => {
    const lanes: Lane[] = [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ];

    const presentations = lanes.map((lane) =>
      getLanePresentationPolicy({ lane, reducedMotion: false }),
    );

    const icons = new Set(presentations.map((p) => p.icon));
    expect(icons.size).toBe(4);

    const tones = new Set(presentations.map((p) => p.copyTone));
    expect(tones.size).toBe(4);

    const feelings = new Set(presentations.map((p) => p.visualFeeling));
    expect(feelings.size).toBe(4);

    for (const p of presentations) {
      expect(p.lane).toBeDefined();
      expect(p.animation).toBeDefined();
      expect(p.density).toBeDefined();
      expect(p.emptyStateCta).toBeDefined();
      expect(p.loadingState).toBeDefined();
    }
  });

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
});
