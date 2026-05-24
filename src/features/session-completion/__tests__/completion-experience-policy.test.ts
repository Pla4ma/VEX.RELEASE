import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import {
  type CompletionExperiencePolicyInput,
  resolveCompletionExperiencePolicy,
} from '../completion-experience-policy';

const baseSummary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 0,
  completionPercentage: 100,
  createdAt: 500000,
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 92,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: 'session-123',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: 'user-123',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

const baseInput: CompletionExperiencePolicyInput = {
  consequences: {},
  featureAvailability: {
    boss: true,
    challenges: true,
    contractUsed: false,
    premiumChest: true,
    progress: true,
    study: true,
  },
  firstWeekStage: 'ACTIVATING',
  motivationStyle: 'calm',
  premiumState: 'public_v1',
  primaryGoal: null,
  sessionMode: SessionMode.FLOW,
  summary: baseSummary,
};

describe('CompletionExperiencePolicy', () => {
  it('renders max 4 major beats', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);
    const beats = [
      policy.heroBeat,
      policy.progressBeat,
      policy.reflectionBeat,
      policy.adaptivePayoff,
    ];

    expect(beats).toHaveLength(4);
  });

  it('calm completion has no chest, battle pass, or boss combat', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { boss: { damageDealt: 10 } },
    });

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining([
        'chest_reward_animation',
        'premium_chest',
        'battle_pass_card',
        'boss_consequence_card',
      ]),
    );
  });

  it('study completion shows study progress', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      motivationStyle: 'student',
      primaryGoal: 'STUDY',
      sessionMode: SessionMode.STUDY,
    });

    expect(policy.adaptivePayoff).toBe('study_progress');
    expect(policy.hiddenCompletionSurfaces).not.toContain('study_progress_card');
  });

  it('game-like completion shows boss damage', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { boss: { damageDealt: 18 } },
      motivationStyle: 'game_like',
    });

    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).not.toContain('boss_consequence_card');
  });

  it('public v1 completion does not show battle pass', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.hiddenCompletionSurfaces).toContain('battle_pass_card');
  });

  it('public v1 completion does not show shop, inventory, coins, or gems', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['shop_inventory_prompts', 'coins_gems_wallet']),
    );
  });

  it('premium chest is one adaptive payoff for strong premium sessions', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      premiumState: 'premium',
    });

    expect(policy.adaptivePayoff).toBe('premium_chest');
    expect(policy.hiddenCompletionSurfaces).not.toContain('premium_chest');
    expect(policy.hiddenCompletionSurfaces).not.toContain('chest_reward_animation');
    expect(policy.hiddenCompletionSurfaces).not.toContain('shop_inventory_prompts');
  });

  it('rival and squad consequences are hidden', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { rival: { gapClosed: 3 }, squad: { delta: 1 } },
    });

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['rival_consequence_cards', 'squad_consequence_cards']),
    );
  });

  it('completion still gives XP, streak, and progress', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.progressBeat.kind).toBe('xp_streak_progress');
  });

  it('duplicate completion event does not duplicate reward surfaces', () => {
    const first = resolveCompletionExperiencePolicy(baseInput);
    const second = resolveCompletionExperiencePolicy(baseInput);

    expect(second.hiddenCompletionSurfaces).toEqual(first.hiddenCompletionSurfaces);
    expect(new Set(second.hiddenCompletionSurfaces).size).toBe(
      second.hiddenCompletionSurfaces.length,
    );
  });

  it('completion UI policy does not mutate rewards directly', () => {
    const before = { ...baseSummary };
    resolveCompletionExperiencePolicy(baseInput);

    expect(baseSummary).toEqual(before);
  });
});
