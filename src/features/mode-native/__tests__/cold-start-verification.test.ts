/**
 * Phase 6 — Verification: cold-start vs evidence-backed copy behavior
 *
 * Cases 1–4 from spec:
 * 1. Study cold-start copy does not claim weak topics
 * 2. Project cold-start copy does not claim next move saved
 * 3. Run cold-start copy does not claim blocker detected
 * 4. Clean cold-start copy does not claim best focus window
 */
import { describe, it, expect } from "@jest/globals";
import { deriveHomeSurface } from "../service";
import { deriveCompletionSurface } from "../service-surface";
import {
  coldStudyHome,
  coldProjectHome,
  coldCleanHome,
  coldStudyCompletion,
  coldRunCompletion,
  coldProjectCompletion,
} from "./cold-start-helpers";

// ═══════════════════════════════════════════════════════════════════════
// Case 1: Study cold-start copy does not claim weak topics
// ═══════════════════════════════════════════════════════════════════════

describe("Case 1: Study cold-start does not claim weak topics", () => {
  it("home: no weak topic claim in cold-start body", () => {
    const surface = deriveHomeSurface(coldStudyHome());
    expect(surface.body).not.toContain("weak");
    expect(surface.body).not.toContain("needs the most attention");
    expect(surface.body).toContain("VEX will learn");
  });

  it("home: cold-start does not mention review target", () => {
    const surface = deriveHomeSurface(coldStudyHome());
    expect(surface.body).not.toContain("Review");
  });

  it("completion: cold-start insightLabel is null", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      completedSessions: 1,
      weakTopicCount: 5,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain("weak");
  });

  it("completion: evidence-backed with weakTopicCount shows insight", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      completedSessions: 5,
      weakTopicCount: 3,
    });
    expect(surface.insightLabel).not.toBeNull();
    expect(surface.insightLabel).toContain("weak");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 2: Project cold-start copy does not claim next move saved
// ═══════════════════════════════════════════════════════════════════════

describe("Case 2: Project cold-start does not claim next move saved", () => {
  it("home: no claim that next move is saved", () => {
    const surface = deriveHomeSurface(coldProjectHome());
    expect(surface.body).not.toContain("already saved");
    expect(surface.body).not.toContain("Pick up right where you stopped");
    expect(surface.body).toContain("Name the project");
  });

  it("home: no claim VEX remembers where you left off", () => {
    const surface = deriveHomeSurface(coldProjectHome());
    expect(surface.primaryFeeling).not.toContain("VEX remembers");
  });

  it("completion: cold-start insightLabel is null", () => {
    const surface = deriveCompletionSurface(coldProjectCompletion());
    expect(surface.insightLabel).toBeNull();
  });

  it("completion: cold-start body does not claim handoff saved", () => {
    const surface = deriveCompletionSurface({
      ...coldProjectCompletion(),
      handoffSaved: true,
    });
    expect(surface.body).not.toContain("Handoff note saved");
    expect(surface.body).not.toContain("Next move is locked");
  });

  it("completion: evidence-backed shows handoff enrichment", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      completedSessions: 4,
      handoffSaved: true,
    });
    expect(surface.body).toContain("Handoff note saved");
    expect(surface.insightLabel).toBe("Next move is locked for tomorrow");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 3: Run cold-start copy does not claim blocker detected
// ═══════════════════════════════════════════════════════════════════════

describe("Case 3: Run cold-start does not claim blocker detected", () => {
  it("completion: cold-start insightLabel is null", () => {
    const surface = deriveCompletionSurface({
      ...coldRunCompletion(),
      blockerDetected: true,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain("blocker");
  });

  it("completion: cold-start does not claim strongest pattern", () => {
    const surface = deriveCompletionSurface(coldRunCompletion());
    expect(surface.body).not.toContain("strongest");
    expect(surface.insightLabel).toBeNull();
  });

  it("completion: evidence-backed shows blocker detected", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      completedSessions: 4,
      blockerDetected: true,
    });
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.insightLabel).toBe("Blocker patterns tracked for next run");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 4: Clean cold-start copy does not claim best focus window
// ═══════════════════════════════════════════════════════════════════════

describe("Case 4: Clean cold-start does not claim best focus window", () => {
  it("weekly: cold-start does not claim best focus window", () => {
    const { deriveWeeklyIntelligence } = require("../service-surface");
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
    });
    expect(intel.primaryMetric).not.toBe("Best focus window");
    expect(intel.primaryMetric).toBe("Sessions started");
  });

  it("home: cold-start clean has no rhythmLabel", () => {
    const surface = deriveHomeSurface(coldCleanHome());
    expect(surface.rhythmLabel).toBeNull();
  });

  it("weekly: cold-start body says VEX is learning, not analyzing", () => {
    const { deriveWeeklyIntelligence } = require("../service-surface");
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
    });
    expect(intel.body).toContain("VEX is learning");
    expect(intel.body).not.toContain("best");
  });
});
