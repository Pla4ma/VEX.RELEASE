/**
 * Study OS — Schemas, Events & Analytics Tests
 *
 * Covers: schemas validation, events, analytics
 */

import {
  StudySourceSchema,
  StudyOsUnlockGateSchema,
  StudyOsPremiumGateSchema,
  ReviewItemSchema,
} from "../schemas";
import { validateStudyPlanEventPayload } from "../events";
import { STUDY_OS_ANALYTICS_EVENTS } from "../analytics";

// ─── Mock external dependencies ──────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock("react-native-mmkv", () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

jest.mock("../../../session/modes", () => ({
  SessionMode: {
    STUDY: "STUDY",
    FOCUS: "FOCUS",
  },
}));

jest.mock("../../session-start/service", () => ({
  buildLaneSessionBrief: jest.fn((input: { durationSeconds: number; lane: string }) => ({
    durationSeconds: input.durationSeconds,
    lane: input.lane,
    mode: "study",
  })),
}));

// ─── Schemas validation ──────────────────────────────────────────

describe("Schemas", () => {
  it("StudySourceSchema validates valid source", () => {
    expect(() =>
      StudySourceSchema.parse({
        createdAt: 100,
        extractedTextStatus: "none",
        id: "s1",
        title: "Test",
        type: "manual",
        userId: "u1",
      }),
    ).not.toThrow();
  });

  it("StudySourceSchema rejects invalid type", () => {
    expect(() =>
      StudySourceSchema.parse({
        createdAt: 100,
        extractedTextStatus: "none",
        id: "s1",
        title: "Test",
        type: "invalid",
        userId: "u1",
      }),
    ).toThrow();
  });

  it("StudyOsUnlockGateSchema validates all unlock reasons", () => {
    for (const reason of [
      "day_zero",
      "evidence_sessions",
      "evidence_usage",
      "first_week",
      "full",
    ]) {
      expect(() =>
        StudyOsUnlockGateSchema.parse({
          isUnlocked: false,
          isDayZero: false,
          completedSessions: 0,
          studyUsageRatio: 0,
          unlockReason: reason,
        }),
      ).not.toThrow();
    }
  });

  it("StudyOsPremiumGateSchema validates valid gate", () => {
    expect(() =>
      StudyOsPremiumGateSchema.parse({
        canAccessPremiumDepth: true,
        revenueCatHealthy: true,
        basicStudyFree: true,
        restrictionReason: null,
      }),
    ).not.toThrow();
  });

  it("ReviewItemSchema validates valid review item", () => {
    expect(() =>
      ReviewItemSchema.parse({
        answerHint: "Some hint",
        confidence: "unknown",
        dueAt: 1000,
        id: "r1",
        prompt: "What is X?",
        studyPlanId: "p1",
      }),
    ).not.toThrow();
  });
});

// ─── Events ──────────────────────────────────────────────────────

describe("Events", () => {
  it("validateStudyPlanEventPayload validates a valid plan", () => {
    const plan = {
      blocks: [],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "T", type: "manual", userId: "u1" },
      status: "active",
      title: "Plan",
      userId: "u1",
    };
    expect(() => validateStudyPlanEventPayload(plan)).not.toThrow();
  });

  it("validateStudyPlanEventPayload rejects invalid payload", () => {
    expect(() => validateStudyPlanEventPayload({ invalid: true })).toThrow();
  });
});

// ─── Analytics ───────────────────────────────────────────────────

describe("Analytics", () => {
  it("defines all expected event names", () => {
    expect(STUDY_OS_ANALYTICS_EVENTS).toContain("study_os_plan_created");
    expect(STUDY_OS_ANALYTICS_EVENTS).toContain("study_os_block_started");
    expect(STUDY_OS_ANALYTICS_EVENTS).toContain("study_os_review_added");
    expect(STUDY_OS_ANALYTICS_EVENTS).toHaveLength(3);
  });
});
