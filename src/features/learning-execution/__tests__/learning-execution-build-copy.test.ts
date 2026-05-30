/**
 * Tests for service.ts (buildLearningExecutionCopy).
 */

import { buildLearningExecutionCopy } from "../service";
import { LearningExecutionCopySchema } from "../schemas";

describe("service – buildLearningExecutionCopy", () => {
  it("returns valid copy for each persona", () => {
    const personae = ["student", "work", "creative", "growth", "learning"] as const;
    for (const persona of personae) {
      const copy = buildLearningExecutionCopy({ persona });
      expect(LearningExecutionCopySchema.safeParse(copy).success).toBe(true);
      expect(copy.layerName.length).toBeGreaterThan(0);
      expect(copy.homeTitle.length).toBeGreaterThan(0);
    }
  });

  it("student copy contains 'Study' label", () => {
    const copy = buildLearningExecutionCopy({ persona: "student" });
    expect(copy.layerName).toBe("Study");
    expect(copy.homeTitle).toBe("Study");
    expect(copy.homeCta).toBe("Continue study");
  });

  it("growth copy contains 'Growth' label", () => {
    const copy = buildLearningExecutionCopy({ persona: "growth" });
    expect(copy.layerName).toBe("Growth Path");
    expect(copy.homeTitle).toBe("Growth Path");
  });
});
