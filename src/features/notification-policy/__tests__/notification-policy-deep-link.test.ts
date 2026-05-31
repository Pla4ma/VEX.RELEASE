import {
  buildRescueDeepLink,
  isRescueDeepLinkValid,
  markExpiredAsIgnored,
} from '../nudge-deep-link';

describe('notification policy — deep link', () => {
  describe('nudge-deep-link', () => {
    it('builds valid rescue deep link', () => {
      const link = buildRescueDeepLink('plan-1', 'Review notes', 600);
      expect(link.type).toBe('start_rescue');
      expect(link.payload.rescuePlanId).toBe('plan-1');
      expect(link.payload.rescueTaskDescription).toBe('Review notes');
      expect(link.payload.suggestedDurationSeconds).toBe(600);
      expect(link.payload.source).toBe('rescue');
    });

    it('validates correct rescue deep link', () => {
      const link = buildRescueDeepLink('plan-2', 'Do 5 min', 300);
      expect(isRescueDeepLinkValid(link)).toBe(true);
    });

    it('rejects null deep link', () => {
      expect(isRescueDeepLinkValid(null)).toBe(false);
    });

    it('rejects undefined deep link', () => {
      expect(isRescueDeepLinkValid(undefined)).toBe(false);
    });

    it('rejects empty object deep link', () => {
      expect(isRescueDeepLinkValid({})).toBe(false);
    });

    it('rejects wrong type deep link', () => {
      expect(isRescueDeepLinkValid({ type: 'wrong' })).toBe(false);
    });

    it('rejects deep link without payload', () => {
      expect(isRescueDeepLinkValid({ type: 'start_rescue' })).toBe(false);
    });

    it('marks expired sent record as ignored after 30 min', () => {
      const result = markExpiredAsIgnored(
        'user-1',
        'student',
        Date.now() - 31 * 60 * 1000,
      );
      expect(result).toHaveLength(1);
      expect(result[0]!.signal).toBe('ignored');
      expect(result[0]!.userId).toBe('user-1');
      expect(result[0]!.lane).toBe('student');
    });

    it('does not mark recent sent record as ignored', () => {
      const result = markExpiredAsIgnored('user-2', 'game_like', Date.now());
      expect(result).toHaveLength(0);
    });

    it('marks expired signals from record array as ignored', () => {
      const now = Date.now();
      const records = [
        {
          userId: 'u3',
          nudgeType: 'gentle_return' as const,
          signal: 'sent' as const,
          lane: 'student' as const,
          occurredAt: now - 40 * 60 * 1000,
        },
        {
          userId: 'u3',
          nudgeType: 'gentle_return' as const,
          signal: 'sent' as const,
          lane: 'student' as const,
          occurredAt: now - 5 * 60 * 1000,
        },
      ];
      const result = markExpiredAsIgnored('u3', 'student', records);
      expect(result).toHaveLength(1);
      expect(result[0]!.signal).toBe('ignored');
    });
  });
});
