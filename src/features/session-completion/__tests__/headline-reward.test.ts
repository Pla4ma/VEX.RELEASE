import { selectHeadlineReward } from '../headline-reward.service';
import type { HeadlineRewardConsequences } from '../headline-reward.schemas';

const baseConsequences: HeadlineRewardConsequences = {
  summary: {
    xpEarned: 240,
    coinsEarned: 12,
    gemsEarned: 1,
    sessionMode: 'FOCUS',
    focusPurityScore: 88,
    previousLevel: 4,
    newLevel: 4,
  },
};

function select(overrides: Partial<HeadlineRewardConsequences>) {
  return selectHeadlineReward({ ...baseConsequences, ...overrides });
}

describe('selectHeadlineReward', () => {
  it('selects streak_saved when a critical streak was saved', () => {
    expect(
      select({ streak: { currentDays: 6, previousDays: 5, streakSaved: true } })
        .type,
    ).toBe('streak_saved');
  });

  it.each([7, 14, 30, 100])(
    'selects streak_milestone for day %i',
    (currentDays) => {
      expect(
        select({
          streak: {
            currentDays,
            previousDays: currentDays - 1,
            streakSaved: false,
          },
        }).type,
      ).toBe('streak_milestone');
    },
  );

  it('selects companion_evolved when the companion crossed an evolution threshold', () => {
    expect(select({ companion: { evolved: true } }).type).toBe(
      'companion_evolved',
    );
  });

  it('selects boss_defeated only when the boss feature is enabled', () => {
    expect(select({ boss: { currentHealth: 0, isEnabled: true } }).type).toBe(
      'boss_defeated',
    );
    expect(select({ boss: { currentHealth: 0, isEnabled: false } }).type).toBe(
      'xp_earned',
    );
  });

  it('selects level_up when the new level is higher than the previous level', () => {
    expect(
      select({
        summary: { ...baseConsequences.summary, previousLevel: 4, newLevel: 5 },
      }).type,
    ).toBe('level_up');
  });

  it('selects challenge_complete only when challenges are enabled', () => {
    expect(
      select({ challenge: { completedThisSession: true, isEnabled: true } })
        .type,
    ).toBe('challenge_complete');
    expect(
      select({ challenge: { completedThisSession: true, isEnabled: false } })
        .type,
    ).toBe('xp_earned');
  });

  it('selects personal_best when the session set a personal record', () => {
    expect(select({ personalBest: { isPersonalBest: true } }).type).toBe(
      'personal_best',
    );
  });

  it('selects personal_best ahead of level and streak rewards', () => {
    expect(
      select({
        personalBest: { isPersonalBest: true, purityScore: 94 },
        streak: { currentDays: 7, previousDays: 6, streakSaved: false },
        summary: { ...baseConsequences.summary, previousLevel: 4, newLevel: 5 },
      }).type,
    ).toBe('personal_best');
  });

  it('selects comeback_complete when the comeback quest finished', () => {
    expect(select({ comeback: { isComplete: true } }).type).toBe(
      'comeback_complete',
    );
  });

  it('selects contract_done when the focus contract was completed', () => {
    expect(select({ contract: { status: 'done' } }).type).toBe('contract_done');
  });

  it('falls back to progress_saved when no other trigger fires', () => {
    expect(select({}).value).toBe('Progress saved');
  });

  it('keeps priority order when multiple triggers are present', () => {
    expect(
      select({
        streak: { currentDays: 5, previousDays: 4, streakSaved: true },
        summary: { ...baseConsequences.summary, previousLevel: 4, newLevel: 5 },
      }).type,
    ).toBe('streak_saved');
    expect(
      select({
        challenge: { completedThisSession: true, isEnabled: true },
        streak: { currentDays: 14, previousDays: 13, streakSaved: false },
      }).type,
    ).toBe('streak_milestone');
  });
});
