import { buildMissionPriorityInput, shouldComputeMissionInput } from '../useOptionalMissionInput';
import type { HomeSurfaceMap } from '../../../../features/home-experience/surface-decision-schemas';

const emptySurfaceMap: HomeSurfaceMap = {
  start_session: 'primary',
  coach_presence: 'hidden',
  progress_proof: 'hidden',
  focus_score: 'hidden',
  progress_detail: 'hidden',
  study_layer: 'hidden',
  companion_thread: 'hidden',
  boss_teaser: 'hidden',
  boss_compact: 'hidden',
  boss_full_cta: 'hidden',
  challenge_teaser: 'hidden',
  unlock_strip: 'hidden',
  premium_tease: 'hidden',
  weekly_quest: 'hidden',
};

function makeController(overrides: Record<string, unknown> = {}) {
  return {
    isFirstRun: false,
    completionSync: { status: 'synced' },
    streakQuery: { data: null },
    comebackQuery: { data: null },
    activeBossQuery: { data: null },
    ...overrides,
  } as unknown as Parameters<typeof buildMissionPriorityInput>[0]['controller'];
}

describe('buildMissionPriorityInput', () => {
  it('returns empty object when no mission surfaces are allowed', () => {
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: emptySurfaceMap,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns empty object when surfaceMap is undefined', () => {
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: undefined,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns empty object when all surfaces are blocked', () => {
    const blockedMap: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'blocked', weekly_quest: 'blocked', boss_compact: 'blocked' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: blockedMap,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('computes mission input when challenge_teaser surface is allowed', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [{ id: 'c1', title: 'Test', description: 'D', currentProgress: 0, targetProgress: 1, rewardAmount: 10, rewardType: 'XP', isCompleted: false, isClaimed: false, timeRemainingMinutes: 60 }],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.hasActiveDailyChallenge).toBe(true);
  });

  it('computes mission input when weekly_quest surface is allowed', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, weekly_quest: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it('computes mission input when boss_compact surface is allowed', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, boss_compact: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.isBossEnabled).toBe(true);
  });

  it('sets isBossNearDefeat when boss health <= 25', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, boss_compact: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: 20,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.isBossNearDefeat).toBe(true);
  });

  it('sets isBossNearDefeat false when boss health > 25', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, boss_compact: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: 80,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.isBossNearDefeat).toBe(false);
  });

  it('sets isStreakCritical when hours remaining <= 4', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: 2,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.isStreakCritical).toBe(true);
  });

  it('sets hasCoachAction when intervention is present and not loading', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: { id: 'i1', type: 'STREAK_RISK', message: 'Act now', priority: 5, hoursRemaining: 1, metadata: {} },
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.hasCoachAction).toBe(true);
  });

  it('sets hasCoachAction false when intervention is loading', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController(),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: { id: 'i1', type: 'STREAK_RISK', message: 'Act now', priority: 5, hoursRemaining: 1, metadata: {} },
      interventionLoading: true,
      companionMood: 'happy',
    });
    expect(result.hasCoachAction).toBe(false);
  });

  it('mission logic does not set hasSquadWeeklyGoal or isSquadsEnabled', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    const result = buildMissionPriorityInput({
      controller: makeController({ isFirstRun: true }),
      surfaceMap: map,
      todaysChallenges: [],
      streakHoursRemaining: null,
      bossPercentHealthRemaining: undefined,
      intervention: null,
      interventionLoading: false,
      companionMood: 'happy',
    });
    expect(result.hasSquadWeeklyGoal).toBe(false);
    expect(result.isSquadsEnabled).toBe(false);
  });
});

describe('shouldComputeMissionInput', () => {
  it('returns false on Day 0', () => {
    expect(shouldComputeMissionInput(undefined, true, false)).toBe(false);
    expect(shouldComputeMissionInput(emptySurfaceMap, true, false)).toBe(false);
  });

  it('returns false for Activating stage', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    expect(shouldComputeMissionInput(map, false, true)).toBe(false);
  });

  it('returns false when surfaceMap is undefined', () => {
    expect(shouldComputeMissionInput(undefined, false, false)).toBe(false);
  });

  it('returns false when no mission surfaces are allowed', () => {
    expect(shouldComputeMissionInput(emptySurfaceMap, false, false)).toBe(false);
  });

  it('returns true when challenge_teaser is allowed and not Day 0/Activating', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'secondary' };
    expect(shouldComputeMissionInput(map, false, false)).toBe(true);
  });

  it('returns true when weekly_quest is allowed and not Day 0/Activating', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, weekly_quest: 'secondary' };
    expect(shouldComputeMissionInput(map, false, false)).toBe(true);
  });

  it('returns true when boss_compact is allowed and not Day 0/Activating', () => {
    const map: HomeSurfaceMap = { ...emptySurfaceMap, boss_compact: 'secondary' };
    expect(shouldComputeMissionInput(map, false, false)).toBe(true);
  });

  it('returns false when surfaces are blocked', () => {
    const blockedMap: HomeSurfaceMap = { ...emptySurfaceMap, challenge_teaser: 'blocked', weekly_quest: 'blocked', boss_compact: 'blocked' };
    expect(shouldComputeMissionInput(blockedMap, false, false)).toBe(false);
  });
});
