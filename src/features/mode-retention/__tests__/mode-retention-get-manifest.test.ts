import { getModeRetentionManifest } from "../service";
import { ModeRetentionManifestSchema } from "../schemas";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("mode-retention comprehensive", () => {
  describe("getModeRetentionManifest", () => {
    it("returns a valid manifest for each lane", () => {
      for (const lane of ALL_LANES) {
        const manifest = getModeRetentionManifest(lane);
        expect(ModeRetentionManifestSchema.safeParse(manifest).success).toBe(true);
        expect(manifest.lane).toBe(lane);
        expect(manifest.returnReason.length).toBeGreaterThan(0);
        expect(manifest.hookCopy.length).toBeGreaterThan(0);
        expect(manifest.day1Copy.length).toBeGreaterThan(0);
      }
    });

    it("manifest has all required sub-objects", () => {
      const manifest = getModeRetentionManifest("student");
      expect(manifest.rescueCopy).toBeDefined();
      expect(manifest.notificationCopy).toBeDefined();
      expect(manifest.premiumBridge).toBeDefined();
    });
  });
});
