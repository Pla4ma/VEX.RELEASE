import { REWARD_CONFIG, getRewardColor, type RewardType } from '../micro-reward-helpers';

describe('micro-reward-helpers', () => {
  describe('REWARD_CONFIG', () => {
    it('has config for all reward types', () => {
      const types: RewardType[] = ['xp', 'coins', 'gems', 'streak', 'level', 'achievement', 'milestone'];
      for (const type of types) {
        expect(REWARD_CONFIG[type]).toBeDefined();
        expect(REWARD_CONFIG[type].icon).toBeDefined();
        expect(REWARD_CONFIG[type].label).toBeDefined();
      }
    });

    it('has correct labels', () => {
      expect(REWARD_CONFIG.xp.label).toBe('XP Gained');
      expect(REWARD_CONFIG.coins.label).toBe('Coins');
      expect(REWARD_CONFIG.gems.label).toBe('Gems');
      expect(REWARD_CONFIG.streak.label).toBe('Streak');
      expect(REWARD_CONFIG.level.label).toBe('Level Up');
      expect(REWARD_CONFIG.achievement.label).toBe('Achievement');
      expect(REWARD_CONFIG.milestone.label).toBe('Milestone');
    });
  });

  describe('getRewardColor', () => {
    const mockTheme = {
      colors: {
        primary: { 500: '#FF0000' },
        warning: { dark: '#FFAA00' },
        accent: { blue: '#0000FF', orange: '#FF8800', purple: '#8800FF', pink: '#FF0088' },
        success: { dark: '#00FF00' },
      },
    } as any;

    it('returns correct color for each reward type', () => {
      expect(getRewardColor('xp', mockTheme)).toBe('#FF0000');
      expect(getRewardColor('coins', mockTheme)).toBe('#FFAA00');
      expect(getRewardColor('gems', mockTheme)).toBe('#0000FF');
      expect(getRewardColor('streak', mockTheme)).toBe('#FF8800');
      expect(getRewardColor('level', mockTheme)).toBe('#00FF00');
      expect(getRewardColor('achievement', mockTheme)).toBe('#8800FF');
      expect(getRewardColor('milestone', mockTheme)).toBe('#FF0088');
    });

    it('falls back to primary for unknown type', () => {
      expect(getRewardColor('xp', mockTheme)).toBe(mockTheme.colors.primary[500]);
    });
  });
});
