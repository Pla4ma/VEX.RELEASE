import { getModePremiumBridge } from '../service';
import { ModePremiumBridgeSchema } from '../schemas';

const ALL_LANES = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;

describe('mode-retention comprehensive', () => {
  describe('getModePremiumBridge', () => {
    it('returns valid premium bridge for each lane', () => {
      for (const lane of ALL_LANES) {
        const bridge = getModePremiumBridge(lane);
        expect(ModePremiumBridgeSchema.safeParse(bridge).success).toBe(true);
        expect(bridge.lane).toBe(lane);
        expect(bridge.triggerDay).toBe(7);
      }
    });

    it('headlines are unique per lane', () => {
      const headlines = ALL_LANES.map((l) => getModePremiumBridge(l).headline);
      expect(new Set(headlines).size).toBe(4);
    });

    it('falls back to minimal_normal for unknown lane', () => {
      const bridge = getModePremiumBridge('bogus');
      expect(bridge.lane).toBe('minimal_normal');
    });
  });
});
