/**
 * Tests for deriveCompletionSurface — boundary conditions
 */
import { describe, it, expect } from "@jest/globals";
import { deriveCompletionSurface } from "../service-surface";

describe("deriveCompletionSurface — boundary", () => {
  it("exactly 3 completedSessions is evidence-backed", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "Algorithms",
      weakTopicCount: 2,
      completedSessions: 3,
    });
    expect(surface.insightLabel).not.toBeNull();
    expect(surface.body).toContain("2 topics may need review");
  });

  it("exactly 2 completedSessions is cold-start", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "Algorithms",
      weakTopicCount: 2,
      completedSessions: 2,
    });
    expect(surface.insightLabel).toBeNull();
  });
});
