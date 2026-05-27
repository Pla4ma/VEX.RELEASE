import { RecommendationEvidenceSchema } from "../memory-schemas";

describe("RecommendationEvidence schema", () => {
  it("validates cold-start evidence", () => {
    const evidence = RecommendationEvidenceSchema.parse({
      fallbackReason: "cold_start",
    });
    expect(evidence.fallbackReason).toBe("cold_start");
    expect(evidence.memoryIds).toBeUndefined();
  });

  it("validates memory-backed evidence", () => {
    const evidence = RecommendationEvidenceSchema.parse({
      memoryIds: ["123e4567-e89b-12d3-a456-426614174000"],
      evidenceSummary: "Morning focus works well",
      confidence: 0.85,
    });
    expect(evidence.memoryIds).toHaveLength(1);
    expect(evidence.confidence).toBe(0.85);
  });

  it("rejects invalid fallback reason", () => {
    expect(() =>
      RecommendationEvidenceSchema.parse({ fallbackReason: "invalid_reason" }),
    ).toThrow();
  });

  it("rejects confidence outside 0-1 range", () => {
    expect(() =>
      RecommendationEvidenceSchema.parse({ confidence: 1.5 }),
    ).toThrow();
  });
});
