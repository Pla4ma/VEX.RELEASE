import {
  WeeklyInsightInputSchema,
  WeeklyIntelligenceSchema,
  InsightFindingSchema,
  type WeeklyInsightInput,
} from "../schemas";
import { buildWeeklyIntelligence } from "../service";
import {
  buildWhatHelped,
  buildWhatGotInWay,
  resolveBestNextSessionType,
  buildAdjustment,
  buildPremiumDeeperInsight,
} from "../insight-builders/insight-builders";

// ── Helpers ────────────────────────────────────────────────────────────────

function baseInput(overrides: Partial<WeeklyInsightInput> = {}): WeeklyInsightInput {
  return WeeklyInsightInputSchema.parse({
    userId: "user-1",
    lane: "student",
    totalSessions: 5,
    totalFocusMinutes: 120,
    completedSessions: 4,
    avgDurationMinutes: 25,
    bestDurationMinutes: 40,
    rescueCompleted: 0,
    reflectionCount: 2,
    ...overrides,
  });
}

// ── buildWhatHelped ────────────────────────────────────────────────────────

describe("buildWhatHelped", () => {
  it("includes consistent rhythm finding when completedSessions >= 3", () => {
    const findings = buildWhatHelped(baseInput({ completedSessions: 4, totalSessions: 5 }));
    const rhythm = findings.find((f) => f.observation.includes("Consistent rhythm"));
    expect(rhythm).toBeDefined();
    expect(rhythm?.category).toBe("helped");
  });

  it("uses 'medium' confidence when completedSessions >= 5", () => {
    const findings = buildWhatHelped(baseInput({ completedSessions: 5, totalSessions: 5 }));
    const rhythm = findings.find((f) => f.observation.includes("Consistent rhythm"));
    expect(rhythm?.confidence).toBe("medium");
  });

  it("includes focus finding when avgFocusScore >= 70", () => {
    const findings = buildWhatHelped(baseInput({ avgFocusScore: 85 }));
    const focus = findings.find((f) => f.observation.includes("Strong focus"));
    expect(focus).toBeDefined();
  });

  it("includes clean starts finding when cleanStarts >= 2", () => {
    const findings = buildWhatHelped(baseInput({ cleanStarts: 3 }));
    const clean = findings.find((f) => f.observation.includes("Clean starts"));
    expect(clean).toBeDefined();
  });

  it("includes rescue finding when rescueCompleted >= 1", () => {
    const findings = buildWhatHelped(baseInput({ rescueCompleted: 1 }));
    const rescue = findings.find((f) => f.observation.includes("Return resilience"));
    expect(rescue).toBeDefined();
    expect(rescue?.observation).toContain("1 recovery session");
  });

  it("includes best session finding when bestDurationMinutes >= 25", () => {
    const findings = buildWhatHelped(baseInput({ bestDurationMinutes: 30 }));
    const best = findings.find((f) => f.observation.includes("Best session"));
    expect(best).toBeDefined();
  });

  it("returns empty when no conditions are met", () => {
    const findings = buildWhatHelped(
      baseInput({
        completedSessions: 1,
        totalSessions: 2,
        rescueCompleted: 0,
        bestDurationMinutes: 10,
      }),
    );
    expect(findings).toEqual([]);
  });
});
