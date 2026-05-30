/**
 * Tests for service.ts (buildLearningExecutionLayer).
 */

import { buildLearningExecutionLayer } from "../service";
import { LearningExecutionLayerSchema } from "../schemas";

describe("service – buildLearningExecutionLayer", () => {
  it("builds a layer with target for student persona", () => {
    const target = {
      contentId: "c1",
      focusAreas: ["focus-a"],
      generationId: "g1",
      nextTaskId: "t1",
      persona: "student" as const,
      remainingMinutes: 15,
      title: "Study",
    };
    const layer = buildLearningExecutionLayer({ persona: "student", target });
    expect(layer.persona).toBe("student");
    expect(layer.target).not.toBeNull();
    expect(layer.target!.contentId).toBe("c1");
    expect(layer.copy.layerName).toBe("Study");
  });

  it("builds a layer with null target", () => {
    const layer = buildLearningExecutionLayer({ persona: "work", target: null });
    expect(layer.persona).toBe("work");
    expect(layer.target).toBeNull();
    expect(layer.copy.layerName).toBe("Deep Work Plan");
  });

  it("includes a dataModelImpact description", () => {
    const layer = buildLearningExecutionLayer({ persona: "creative", target: null });
    expect(layer.dataModelImpact).toContain("LearningExecutionLayer");
  });

  it("validates against LearningExecutionLayerSchema", () => {
    const layer = buildLearningExecutionLayer({ persona: "growth", target: null });
    expect(LearningExecutionLayerSchema.safeParse(layer).success).toBe(true);
  });
});
