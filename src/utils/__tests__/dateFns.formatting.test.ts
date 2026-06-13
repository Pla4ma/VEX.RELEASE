import { formatDistanceToNow } from '../dateFns';

describe('dateFns formatting', () => {
  describe('formatDistanceToNow', () => {
    it('returns "less than a minute ago" for recent times', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      expect(formatDistanceToNow(thirtySecondsAgo)).toBe('less than a minute ago');
    });

    it('returns minutes ago for < 1 hour', () => {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      expect(formatDistanceToNow(fifteenMinutesAgo)).toBe('15 minutes ago');
    });

    it('returns singular minute for 1 minute', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      expect(formatDistanceToNow(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('returns hours ago for < 1 day', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      expect(formatDistanceToNow(threeHoursAgo)).toBe('3 hours ago');
    });

    it('returns days ago for >= 1 day', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatDistanceToNow(twoDaysAgo)).toBe('2 days ago');
    });
  });
});
