/**
 * Coach Presence — Service Helpers Tests
 */

import {
  styleForLane,
  goalForLane,
  getActionReason,
  getTone,
  getVisualState,
} from "../service-helpers";

describe("service-helpers", () => {
  test("styleForLane returns STUDY_FOCUSED for student lane", () => {
    expect(styleForLane({ primaryLane: "student" } as any, "CALM")).toBe("STUDY_FOCUSED");
  });

  test("styleForLane returns GAME_LIKE for game_like lane", () => {
    expect(styleForLane({ primaryLane: "game_like" } as any, "CALM")).toBe("GAME_LIKE");
  });

  test("styleForLane returns COACH_LED for deep_creative lane", () => {
    expect(styleForLane({ primaryLane: "deep_creative" } as any, "CALM")).toBe("COACH_LED");
  });

  test("styleForLane returns CALM for minimal_normal lane", () => {
    expect(styleForLane({ primaryLane: "minimal_normal" } as any, "FRIENDLY")).toBe("CALM");
  });

  test("styleForLane returns fallback when profile is null", () => {
    expect(styleForLane(null, "INTENSE")).toBe("INTENSE");
    expect(styleForLane(undefined, "FRIENDLY")).toBe("FRIENDLY");
  });

  test("goalForLane returns correct goals per lane", () => {
    expect(goalForLane({ primaryLane: "student" } as any, "focus")).toBe("study");
    expect(goalForLane({ primaryLane: "deep_creative" } as any, "focus")).toBe("creative");
    expect(goalForLane({ primaryLane: "minimal_normal" } as any, "focus")).toBe("personal");
    expect(goalForLane({ primaryLane: "game_like" } as any, "focus")).toBe("focus");
    expect(goalForLane(null, "study")).toBe("study");
  });

  test("getActionReason returns correct reason for START_STUDY_SESSION", () => {
    expect(getActionReason("START_STUDY_SESSION", "CALM")).toContain("study");
  });

  test("getActionReason returns correct reason for REVIEW_PROGRESS", () => {
    expect(getActionReason("REVIEW_PROGRESS", "CALM")).toContain("Progress");
  });

  test("getTone returns correct tone for each motivation style", () => {
    expect(getTone("CALM").personality).toBe("steady");
    expect(getTone("CALM").intensity).toBe("low");
    expect(getTone("INTENSE").personality).toBe("sharp");
    expect(getTone("INTENSE").intensity).toBe("high");
    expect(getTone("STUDY_FOCUSED").personality).toBe("studious");
    expect(getTone("GAME_LIKE").personality).toBe("playful");
  });

  test("getVisualState returns correct reaction per style", () => {
    expect(getVisualState(null, "INTENSE").reaction).toBe("ready");
    expect(getVisualState(null, "GAME_LIKE").reaction).toBe("celebrating");
    expect(getVisualState(null, "FRIENDLY").reaction).toBe("focused");
    expect(getVisualState(null, "CALM").reaction).toBe("steady");
  });

  test("getVisualState uses companion data when provided", () => {
    const companion = { element: "WAVE", level: 5, currentMood: "HAPPY", phase: "MATURE" };
    const state = getVisualState(companion as any, "CALM");
    expect(state.element).toBe("WAVE");
    expect(state.level).toBe(5);
    expect(state.mood).toBe("HAPPY");
    expect(state.phase).toBe("MATURE");
  });

  test("getVisualState uses defaults when companion is null", () => {
    const state = getVisualState(null, "CALM");
    expect(state.element).toBe("LUMINA");
    expect(state.level).toBe(1);
  });
});
