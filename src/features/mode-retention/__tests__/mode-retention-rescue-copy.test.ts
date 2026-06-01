import { getModeRescueCopy } from '../service';
import { ModeRescueCopySchema } from '../schemas';

const ALL_LANES = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;

describe('mode-retention comprehensive', () => {
  describe('getModeRescueCopy', () => {
    it('returns valid rescue copy for each lane', () => {
      for (const lane of ALL_LANES) {
        const rescue = getModeRescueCopy(lane);
        expect(ModeRescueCopySchema.safeParse(rescue).success).toBe(true);
        expect(rescue.lane).toBe(lane);
        expect(rescue.sessionMinutes).toBeGreaterThanOrEqual(3);
        expect(rescue.sessionMinutes).toBeLessThanOrEqual(15);
      }
    });

    it('student rescue is 8 minutes', () => {
      expect(getModeRescueCopy('student').sessionMinutes).toBe(8);
    });

    it('game_like rescue is 10 minutes', () => {
      expect(getModeRescueCopy('game_like').sessionMinutes).toBe(10);
    });

    it('deep_creative rescue is 7 minutes', () => {
      expect(getModeRescueCopy('deep_creative').sessionMinutes).toBe(7);
    });

    it('minimal_normal rescue is 5 minutes', () => {
      expect(getModeRescueCopy('minimal_normal').sessionMinutes).toBe(5);
    });

    it('falls back to minimal_normal for unknown lane', () => {
      const rescue = getModeRescueCopy('bogus');
      expect(rescue.lane).toBe('minimal_normal');
    });
  });
});
