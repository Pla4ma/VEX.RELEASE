import { buildTodaySystem } from "../service";

describe("today system", () => {
  it("shows only clean minimal essentials on Day 0", () => {
    const system = buildTodaySystem({
      lane: "minimal_normal",
      completedToday: 0,
    });
    expect(system.sections.find((s) => s.key === "now")?.body).toBe(
      "Name one task. Run the block. That is enough.",
    );
    expect(system.sections.find((s) => s.key === "later")?.visible).toBe(false);
    expect(system.sections.find((s) => s.key === "done")?.body).toBe(
      "Nothing banked yet. The first block is the hardest.",
    );
  });

  it("respects reduced motion and hidden gates", () => {
    const reduced = buildTodaySystem({
      lane: "minimal_normal",
      reducedMotion: true,
    });
    expect(reduced.animationLevel).toBe("none");

    const hidden = buildTodaySystem({
      lane: "minimal_normal",
      hiddenFeatureKeys: ["today_strip"],
    });
    expect(hidden.sections.every((s) => !s.visible)).toBe(true);
  });

  it("adds recovery only when day is messy", () => {
    const system = buildTodaySystem({
      lane: "minimal_normal",
      dayFeelsMessy: true,
    });
    expect(
      system.sections.find((s) => s.key === "recovery")?.durationSeconds,
    ).toBe(5 * 60);
  });
});
