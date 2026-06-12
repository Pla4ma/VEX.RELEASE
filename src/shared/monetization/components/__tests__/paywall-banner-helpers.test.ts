import { getTriggerMessage, type PaywallTriggerType } from '../paywall-banner-helpers';

describe('paywall-banner-helpers', () => {
  describe('getTriggerMessage', () => {
    it('returns BOSS_DEFEAT message with tier', () => {
      const msg = getTriggerMessage('BOSS_DEFEAT', 5);
      expect(msg.headline).toContain('boss tier');
      expect(msg.subtext).toContain('Tier 5');
    });

    it('returns BOSS_DEFEAT message without tier', () => {
      const msg = getTriggerMessage('BOSS_DEFEAT');
      expect(msg.subtext).toContain('Tier ++');
    });

    it('returns STREAK_MILESTONE message with days', () => {
      const msg = getTriggerMessage('STREAK_MILESTONE', undefined, 30);
      expect(msg.headline).toContain('streak');
      expect(msg.subtext).toContain('30');
    });

    it('returns STREAK_MILESTONE message without days', () => {
      const msg = getTriggerMessage('STREAK_MILESTONE');
      expect(msg.subtext).toContain('your');
    });

    it('returns S_GRADE message with bonus XP', () => {
      const msg = getTriggerMessage('S_GRADE', undefined, undefined, 50);
      expect(msg.headline).toContain('XP');
      expect(msg.subtext).toContain('50');
    });

    it('returns S_GRADE message without bonus XP', () => {
      const msg = getTriggerMessage('S_GRADE');
      expect(msg.subtext).toContain('Multiply');
    });

    it('returns default for unknown trigger', () => {
      const msg = getTriggerMessage('UNKNOWN' as PaywallTriggerType);
      expect(msg.headline).toBe('Unlock Premium features');
      expect(msg.subtext).toBe('Get the most out of your focus sessions.');
    });

    it('all triggers include emoji field as empty string', () => {
      const triggers: PaywallTriggerType[] = ['BOSS_DEFEAT', 'STREAK_MILESTONE', 'S_GRADE'];
      for (const trigger of triggers) {
        const msg = getTriggerMessage(trigger);
        expect(msg.emoji).toBe('');
      }
    });

    it('all triggers have non-empty headline and subtext', () => {
      const triggers: PaywallTriggerType[] = ['BOSS_DEFEAT', 'STREAK_MILESTONE', 'S_GRADE'];
      for (const trigger of triggers) {
        const msg = getTriggerMessage(trigger);
        expect(msg.headline.length).toBeGreaterThan(0);
        expect(msg.subtext.length).toBeGreaterThan(0);
      }
    });
  });
});
