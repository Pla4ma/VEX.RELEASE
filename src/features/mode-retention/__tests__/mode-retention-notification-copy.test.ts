import { getModeNotificationCopy } from '../service';
import { ModeNotificationCopySchema } from '../schemas';

const ALL_LANES = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;

describe('mode-retention comprehensive', () => {
  describe('getModeNotificationCopy', () => {
    it('returns valid notification copy for each lane', () => {
      for (const lane of ALL_LANES) {
        const notif = getModeNotificationCopy(lane);
        expect(ModeNotificationCopySchema.safeParse(notif).success).toBe(true);
        expect(notif.lane).toBe(lane);
        expect(notif.maxPerDay).toBeGreaterThanOrEqual(0);
        expect(notif.maxPerDay).toBeLessThanOrEqual(3);
      }
    });

    it('all notifications have maxPerDay of 1', () => {
      for (const lane of ALL_LANES) {
        expect(getModeNotificationCopy(lane).maxPerDay).toBe(1);
      }
    });

    it('titles are unique per lane', () => {
      const titles = ALL_LANES.map((l) => getModeNotificationCopy(l).title);
      expect(new Set(titles).size).toBe(4);
    });
  });
});
