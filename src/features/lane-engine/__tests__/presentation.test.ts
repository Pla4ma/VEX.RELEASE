import { getLanePresentationPolicy } from "../presentation";

describe("lane presentation policy", () => {
  it.each([
    ["student", "medium", "low_medium", "precise_supportive", "book-open"],
    [
      "game_like",
      "medium_high",
      "medium_high",
      "strategic_energetic",
      "shield",
    ],
    [
      "deep_creative",
      "medium",
      "low_medium",
      "reflective_continuity",
      "pen-tool",
    ],
    ["minimal_normal", "low", "minimal", "concise_factual", "check-circle"],
  ] as const)(
    "maps %s to designed lane presentation",
    (lane, density, animation, copyTone, icon) => {
      const policy = getLanePresentationPolicy({ lane, reducedMotion: false });

      expect(policy.density).toBe(density);
      expect(policy.animation).toBe(animation);
      expect(policy.copyTone).toBe(copyTone);
      expect(policy.icon).toBe(icon);
      expect(policy.emptyStateCta.length).toBeGreaterThan(0);
      expect(policy.errorStateHint.length).toBeGreaterThan(0);
    },
  );

  it("disables animation when reduced motion is enabled", () => {
    const policy = getLanePresentationPolicy({
      lane: "game_like",
      reducedMotion: true,
    });
    expect(policy.animation).toBe("none");
  });

  it("does not render loading skeleton for hidden lane surfaces", () => {
    const policy = getLanePresentationPolicy({
      hiddenFeatureKeys: ["today_strip_skeleton"],
      lane: "minimal_normal",
      reducedMotion: false,
    });
    expect(policy.shouldRenderSkeleton).toBe(false);
  });
});
