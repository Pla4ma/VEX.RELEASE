/**
 * VEX Phase 17 — Journeys: Day 0 Home (Category 2)
 */
import { describe, expect, it } from '@jest/globals';
import { decideHomeSurfaces } from '../../features/home-experience/home-surface-decision';
import { enforceDay0SurfacePolicy } from '../../features/home-experience/day0-surface-policy';
import type { HomeSurfaceMap } from '../../features/home-experience/surface-decision-schemas';
import type { Lane } from '../../features/lane-engine/types';

const ALL_LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];
const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};

function visibleCount(map: HomeSurfaceMap): number {
  return Object.entries(map).filter(
    ([, v]) => v !== 'hidden' && v !== 'blocked',
  ).length;
}

function day0Map(lane: Lane): HomeSurfaceMap {
  const m: Record<
    Lane,
    { style: 'study_focused' | 'game_like' | 'coach_led' | 'calm'; goal: 'study' | 'work' | 'creative' | 'personal'; intensity: 'minimal' | 'medium' | 'strong' }
  > = {
    student: { style: 'study_focused', goal: 'study', intensity: 'medium' },
    game_like: { style: 'game_like', goal: 'work', intensity: 'strong' },
    deep_creative: {
      style: 'coach_led',
      goal: 'creative',
      intensity: 'medium',
    },
    minimal_normal: { style: 'calm', goal: 'personal', intensity: 'minimal' },
  };
  const p = m[lane];
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: {
      motivationStyle: p.style,
      primaryGoal: p.goal,
      gamificationIntensity: p.intensity,
      studyLayerName: 'Growth Path',
      userStage: 'new',
    },
    behaviorStats: {
      totalCompletedSessions: 0,
      studyUsageRatio: 0,
      bossChallengeEngagement: 'none',
      coachInteractions: 0,
      comebackSessions: 0,
      ignoredFeatures: [],
      premiumFeatureAttempts: [],
      completionStreak: 0,
    },
    hasActiveStudyPlan: false,
    hasActiveRecommendation: false,
    hasActiveBoss: false,
    isFirstSession: true,
    laneProfile: { primaryLane: lane },
  });
}

describe('Phase 17 — Day 0 Home surface count per lane', () => {
  it.each(ALL_LANES)('%s lane Day 0 <= 6 visible surfaces', (lane) => {
    expect(visibleCount(day0Map(lane))).toBeLessThanOrEqual(6);
  });
});

describe('Phase 17 — Study Home (student) Day 0', () => {
  const map = day0Map('student');
  it('tiny study preview visible as tiny_tease', () => {
    expect(map.study_layer).toBe('tiny_tease');
  });
  it('no upload CTA', () => {
    expect(map.study_layer).not.toBe('primary');
    expect(map.study_layer).not.toBe('secondary');
    expect(map.study_os).toMatch(/hidden|blocked/);
  });
  it('start_session is primary', () => {
    expect(map.start_session).toBe('primary');
  });
});

describe('Phase 17 — Run Home (game_like) Day 0', () => {
  const map = day0Map('game_like');
  it('run_board blocked', () => {
    expect(map.run_board).toMatch(/hidden|blocked/);
  });
  it('no shop in surface keys', () => {
    expect(Object.keys(map)).not.toContain('shop');
  });
  it('boss_full_cta blocked', () => {
    expect(map.boss_full_cta).toMatch(/hidden|blocked/);
  });
});

describe('Phase 17 — Project Home (deep_creative) Day 0', () => {
  const map = day0Map('deep_creative');
  it('project_thread blocked', () => {
    expect(map.project_thread).toMatch(/hidden|blocked/);
  });
  it('focus_window blocked', () => {
    expect(map.focus_window).toMatch(/hidden|blocked/);
  });
  it('start_session is primary', () => {
    expect(map.start_session).toBe('primary');
  });
});

describe('Phase 17 — Clean Home (minimal_normal) Day 0', () => {
  const map = day0Map('minimal_normal');
  it('no boss teaser', () => {
    expect(map.boss_teaser).toBe('hidden');
  });
  it('no boss compact', () => {
    expect(map.boss_compact).toBe('hidden');
  });
  it('no challenge teaser', () => {
    expect(map.challenge_teaser).toBe('hidden');
  });
  it('no weekly quest', () => {
    expect(map.weekly_quest).toBe('hidden');
  });
  it('has at least 3 visible surfaces', () => {
    expect(visibleCount(map)).toBeGreaterThanOrEqual(3);
  });
  it('start_session is primary', () => {
    expect(map.start_session).toBe('primary');
  });
  it('today_strip present', () => {
    expect(map.today_strip).not.toBe('hidden');
  });
});

describe('Phase 17 — Day 0 system blocks across lanes', () => {
  const blockedSurfaces = [
    'memory_insight',
    'weekly_intelligence',
    'premium_tease',
    'focus_score',
    'progress_proof',
    'progress_detail',
  ];
  it.each(ALL_LANES)('%s Day 0 blocks premature surfaces', (lane) => {
    const map = day0Map(lane);
    blockedSurfaces.forEach((k) => {
      expect(map[k as keyof HomeSurfaceMap]).toMatch(/hidden|blocked/);
    });
  });
});

describe('Phase 17 — Day 0 policy validation across lanes', () => {
  it.each(ALL_LANES)('%s passes enforceDay0SurfacePolicy', (lane) => {
    const result = enforceDay0SurfacePolicy(day0Map(lane));
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});
