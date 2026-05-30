import { getModeReturnHook } from "../service";
import { ModeReturnHookSchema } from "../schemas";
import { MODE_RETURN_REASON } from "../copy";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("mode-retention comprehensive", () => {
  describe("getModeReturnHook", () => {
    it("returns valid return hook for each lane", () => {
      for (const lane of ALL_LANES) {
        const hook = getModeReturnHook(lane);
        expect(ModeReturnHookSchema.safeParse(hook).success).toBe(true);
        expect(hook.lane).toBe(lane);
        expect(hook.corePromise.length).toBeGreaterThan(0);
        expect(hook.day0Headline.length).toBeGreaterThan(0);
      }
    });

    it("falls back to minimal_normal for unknown input", () => {
      const hook = getModeReturnHook("bogus");
      expect(hook.lane).toBe("minimal_normal");
      expect(hook.corePromise).toBe(MODE_RETURN_REASON.minimal_normal);
    });

    it("study hook references study-specific language", () => {
      const hook = getModeReturnHook("student");
      expect(hook.corePromise).toContain("study");
    });

    it("game_like hook references momentum/run language", () => {
      const hook = getModeReturnHook("game_like");
      expect(hook.corePromise).toContain("momentum");
    });

    it("deep_creative hook references left-off language", () => {
      const hook = getModeReturnHook("deep_creative");
      expect(hook.corePromise).toContain("remembers");
    });

    it("minimal_normal hook references clean/noise language", () => {
      const hook = getModeReturnHook("minimal_normal");
      expect(hook.corePromise).toContain("one useful action");
    });
  });
});
