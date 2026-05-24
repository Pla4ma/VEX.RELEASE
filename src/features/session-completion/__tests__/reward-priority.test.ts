import { buildRewardPrioritySummary } from '../reward-priority';
import type { RewardPriorityInput } from '../reward-priority';

const baseInput: RewardPriorityInput = {
  rewards: [
    {
      detail: '+80 XP',
      kind: 'xp',
      label: '80 XP earned',
      priority: 'standard',
    },
  ],
};

function build(overrides: Partial<RewardPriorityInput>) {
  return buildRewardPrioritySummary({ ...baseInput, ...overrides });
}

describe('buildRewardPrioritySummary', () => {
  it('puts a personal best ahead of normal XP', () => {
    const summary = build({
      rewards: [
        { detail: '+80 XP', kind: 'xp', label: '80 XP earned', priority: 'standard' },
        { detail: '92 purity', kind: 'personal_best', label: 'New personal best', priority: 'major' },
      ],
    });

    expect(summary.headline.kind).toBe('personal_best');
    expect(summary.secondaryRewards).toHaveLength(1);
  });

  it('puts a band change ahead of boss damage', () => {
    const summary = build({
      rewards: [
        { detail: 'Boss took 35 damage', kind: 'boss', label: 'Major boss damage', priority: 'major' },
        { detail: 'Silver to Gold', kind: 'focus_score', label: 'Focus Score band up', priority: 'major' },
      ],
    });

    expect(summary.headline.kind).toBe('focus_score');
  });

  it('puts streak recovery ahead of small currency', () => {
    const summary = build({
      rewards: [
        { detail: '+12 coins', kind: 'currency', label: 'Coins earned', priority: 'standard' },
        { detail: 'Insurance protected day 6', kind: 'streak', label: 'Streak recovered', priority: 'major' },
      ],
    });

    expect(summary.headline.kind).toBe('streak');
  });

  it('returns a safe fallback for empty consequences', () => {
    const summary = build({ rewards: [] });

    expect(summary.headline.kind).toBe('fallback');
    expect(summary.headline.label).toBe('Session complete');
    expect(summary.secondaryRewards).toEqual([]);
  });

  it('returns one headline and grouped secondary rewards', () => {
    const summary = build({
      rewards: [
        { detail: '+1 gem', kind: 'currency', label: 'Gem earned', priority: 'standard' },
        { detail: 'Chapter memory saved', kind: 'companion', label: 'Companion memory', priority: 'supporting' },
        { detail: 'Best Deep Work score', kind: 'personal_best', label: 'New personal best', priority: 'major' },
      ],
    });

    expect(summary.headline.kind).toBe('personal_best');
    expect(summary.secondaryRewards.map((reward) => reward.kind)).toEqual(['companion', 'currency']);
  });
});
