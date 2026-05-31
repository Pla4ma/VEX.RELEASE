import {
  MODE_RETURN_HOOK,
  MODE_RETURN_REASON,
  MODE_DAY1_COPY,
  MODE_DAY3_MEMORY,
  MODE_DAY7_INTELLIGENCE,
  MODE_RESCUE_COPY,
  MODE_NOTIFICATION_COPY,
  MODE_PREMIUM_BRIDGE,
  MODE_RETENTION_MANIFEST,
} from '../copy';

describe('mode-retention comprehensive', () => {
  describe('copy data – integrity checks', () => {
    it('all copy maps have exactly 4 entries', () => {
      expect(Object.keys(MODE_RETURN_HOOK)).toHaveLength(4);
      expect(Object.keys(MODE_RETURN_REASON)).toHaveLength(4);
      expect(Object.keys(MODE_DAY1_COPY)).toHaveLength(4);
      expect(Object.keys(MODE_DAY3_MEMORY)).toHaveLength(4);
      expect(Object.keys(MODE_DAY7_INTELLIGENCE)).toHaveLength(4);
      expect(Object.keys(MODE_RESCUE_COPY)).toHaveLength(4);
      expect(Object.keys(MODE_NOTIFICATION_COPY)).toHaveLength(4);
      expect(Object.keys(MODE_PREMIUM_BRIDGE)).toHaveLength(4);
      expect(Object.keys(MODE_RETENTION_MANIFEST)).toHaveLength(4);
    });

    it('return reasons are unique across all lanes', () => {
      const reasons = Object.values(MODE_RETURN_REASON);
      expect(new Set(reasons).size).toBe(4);
    });

    it('no copy contains game reward language', () => {
      for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
        const text = JSON.stringify(copy);
        expect(text).not.toMatch(/boss|battle|coin|gem|reward.?chest|defeat|loot/i);
      }
    });

    it('no copy contains streak guilt language', () => {
      for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
        const text = JSON.stringify(copy);
        expect(text).not.toMatch(/lost.*streak|broke.*streak|keep.*streak|don't.*break/i);
      }
    });
  });
});
