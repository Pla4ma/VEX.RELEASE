import {
  blockedEconomyTerms,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
  type PremiumLane,
} from "./helpers";

describe("premium value map", () => {
  it("has all 4 lanes defined", () => {
    const lanes = Object.keys(PREMIUM_VALUE_MAP) as PremiumLane[];
    expect(lanes).toHaveLength(4);
    expect(lanes).toContain("study");
    expect(lanes).toContain("run");
    expect(lanes).toContain("project");
    expect(lanes).toContain("clean");
  });

  it.each([
    ["study", 4],
    ["run", 4],
    ["project", 4],
    ["clean", 4],
  ] as const)(
    "%s lane has %d features with no economy terms",
    (lane, count) => {
      const value = getLanePremiumValue(lane);
      expect(value.features).toHaveLength(count);
      const featureText = value.features.join(" ").toLowerCase();
      for (const term of blockedEconomyTerms) {
        expect(featureText).not.toMatch(new RegExp(term, "i"));
      }
    },
  );

  it("run lane explicitly states 'no currency'", () => {
    const runValue = getLanePremiumValue("run");
    const allText = [...runValue.features, runValue.headline, runValue.body]
      .join(" ")
      .toLowerCase();
    expect(allText).toMatch(/no currency|no coin|no gem/);
  });

  it.each([
    ["study", "deadline"],
    ["run", "modifier"],
    ["project", "context"],
    ["clean", "calendar"],
  ] as const)("%s lane uniquely mentions %s", (lane, keyword) => {
    const value = getLanePremiumValue(lane);
    const allText = [...value.features, value.headline, value.body]
      .join(" ")
      .toLowerCase();
    expect(allText).toContain(keyword);
  });

  it("mapProfileToLane routes correctly", () => {
    expect(mapProfileToLane("student")).toBe("study");
    expect(mapProfileToLane("study_focused")).toBe("study");
    expect(mapProfileToLane("game_like")).toBe("run");
    expect(mapProfileToLane("competitive")).toBe("run");
    expect(mapProfileToLane("intense")).toBe("run");
    expect(mapProfileToLane("creator")).toBe("project");
    expect(mapProfileToLane("deep_creative")).toBe("project");
    expect(mapProfileToLane("calm")).toBe("clean");
    expect(mapProfileToLane("unknown")).toBe("clean");
  });
});
