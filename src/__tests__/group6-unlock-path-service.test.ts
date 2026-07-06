import { buildHomeUnlockPathModel } from '../screens/home/services/home-unlock-path-service';
import { resolveVariant } from '../components/glass/GlassCard.tokens';
import { vexLightGlass, glassMaterials, glassMotion } from '../theme/tokens/vex-light-glass';

function makeInput(completedSessions: number) {
  return { completedSessions, currentStreak: 0, todayFocusMinutes: 0 };
}

describe('Group 6 — Unlock Path Service', () => {
  describe('buildHomeUnlockPathModel', () => {
    it('6a: items array has exactly 5 items', () => {
      const model = buildHomeUnlockPathModel(makeInput(0));
      expect(model.items).toHaveLength(5);
    });

    it('6b: all items locked at 0 points', () => {
      const model = buildHomeUnlockPathModel(makeInput(0));
      model.items.forEach((item) => {
        expect(item.isUnlocked).toBe(false);
        expect(item.current).toBe(0);
      });
    });

    it('6c: first item unlocked at 1 point', () => {
      const model = buildHomeUnlockPathModel(makeInput(1));
      expect(model.items[0]!.isUnlocked).toBe(true);
      expect(model.items[0]!.current).toBe(1);
      expect(model.items[1]!.isUnlocked).toBe(false);
    });

    it('6d: first 3 items unlocked at 3 points', () => {
      const model = buildHomeUnlockPathModel(makeInput(3));
      expect(model.items[0]!.isUnlocked).toBe(true);
      expect(model.items[1]!.isUnlocked).toBe(true);
      expect(model.items[2]!.isUnlocked).toBe(false);
    });

    it('6e: all items unlocked at 10+ points', () => {
      const model = buildHomeUnlockPathModel(makeInput(10));
      model.items.forEach((item) => {
        expect(item.isUnlocked).toBe(true);
      });
    });

    it('6f: current is capped at requirement', () => {
      const model = buildHomeUnlockPathModel(makeInput(5));
      // First item: requirement=1, current should be capped at 1
      expect(model.items[0]!.current).toBe(1);
      // Third item: requirement=5, current should be 5
      expect(model.items[2]!.current).toBe(5);
    });

    it('6g: nextItem points to first locked item', () => {
      const model = buildHomeUnlockPathModel(makeInput(3));
      expect(model.nextItem.requirement).toBe(5);
      expect(model.nextItem.title).toBe('Rise to the challenge');
    });

    it('6h: nextItem is last item when all unlocked', () => {
      const model = buildHomeUnlockPathModel(makeInput(15));
      expect(model.nextItem.requirement).toBe(10);
    });

    it('6i: previewItems contains up to 2 locked items', () => {
      const model = buildHomeUnlockPathModel(makeInput(3));
      expect(model.previewItems.length).toBeLessThanOrEqual(2);
      model.previewItems.forEach((item) => {
        expect(item.isUnlocked).toBe(false);
      });
    });

    it('6j: progressLabel shows remaining points', () => {
      const model = buildHomeUnlockPathModel(makeInput(3));
      expect(model.progressLabel).toContain('2');
      expect(model.progressLabel).toContain('left until next unlock');
    });

    it('6k: progressLabel shows completion when all unlocked', () => {
      const model = buildHomeUnlockPathModel(makeInput(12));
      expect(model.progressLabel).toContain('All paths unlocked');
    });

    it('6l: works with fractional points', () => {
      const model = buildHomeUnlockPathModel(makeInput(2.5));
      expect(model.items[0]!.isUnlocked).toBe(true);
      expect(model.items[1]!.isUnlocked).toBe(false);
      expect(model.items[0]!.current).toBe(1);
      expect(model.items[1]!.current).toBe(2.5);
    });
  });

  describe('GlassCard resolveVariant', () => {
    it('6m: hero variant has correct accent color', () => {
      const style = resolveVariant('hero');
      expect(style.borderColor).toContain('174');
      expect(style.accentTopBar).toBeDefined();
    });

    it('6n: all variant names resolve without error', () => {
      const variants = [
        'default', 'hero', 'selected', 'success',
        'warning', 'premium', 'subtle', 'strong',
      ] as const;
      variants.forEach((v) => {
        const style = resolveVariant(v);
        expect(style).toHaveProperty('borderColor');
      });
    });
  });

  describe('vexLightGlass tokens', () => {
    it('6o: semantic colors exist', () => {
      expect(vexLightGlass.semantic.success).toBeDefined();
      expect(vexLightGlass.semantic.warning).toBeDefined();
      expect(vexLightGlass.semantic.danger).toBeDefined();
      expect(vexLightGlass.semantic.info).toBeDefined();
      expect(vexLightGlass.semantic.fire).toBeDefined();
    });

    it('6p: glass material tokens exist', () => {
      expect(glassMaterials.pane).toBeDefined();
      expect(glassMaterials.hero).toBeDefined();
      expect(glassMaterials.nav).toBeDefined();
      expect(glassMaterials.tabPill).toBeDefined();
    });

    it('6q: motion presets exist', () => {
      expect(glassMotion.screenEnter).toBeDefined();
      expect(glassMotion.cardEnter).toBeDefined();
      expect(glassMotion.pressUpSpring).toBeDefined();
    });

    it('6r: mint scale has required keys', () => {
      const mint = vexLightGlass.mint;
      expect(mint[100]).toBeDefined();
      expect(mint[500]).toBeDefined();
      expect(mint[700]).toBeDefined();
      expect(mint[900]).toBeDefined();
    });
  });
});
