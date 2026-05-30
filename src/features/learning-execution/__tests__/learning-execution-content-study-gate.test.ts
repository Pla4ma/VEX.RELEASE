/**
 * Tests for service.ts (buildContentStudyGate).
 */

import { buildContentStudyGate } from "../service";
import { ContentStudyGateSchema } from "../schemas";

describe("service – buildContentStudyGate", () => {
  const healthyBase = {
    aiConfigured: true,
    featureHealth: "healthy" as const,
    goal: "STUDY" as const,
    hasPrivacyDisclosure: true,
    rateLimitsConfigured: true,
    storageConfigured: true,
    totalCompletedSessions: 5,
  };

  it("blocks upload when feature health is unavailable", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      featureHealth: "unavailable",
    });
    expect(gate.showUploadEntry).toBe(false);
    expect(gate.fallback).toContain("VEX can retry content later");
  });

  it("blocks upload when AI is not configured", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      aiConfigured: false,
    });
    expect(gate.showUploadEntry).toBe(false);
  });

  it("blocks upload when storage is not configured", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      storageConfigured: false,
    });
    expect(gate.showUploadEntry).toBe(false);
  });

  it("blocks upload when rate limits are not configured", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      rateLimitsConfigured: false,
    });
    expect(gate.showUploadEntry).toBe(false);
  });

  it("blocks upload when privacy disclosure is missing", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      hasPrivacyDisclosure: false,
    });
    expect(gate.showUploadEntry).toBe(false);
  });

  it("blocks upload for non-STUDY goal even after 3 sessions", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      goal: "WORK",
      totalCompletedSessions: 5,
    });
    expect(gate.showUploadEntry).toBe(false);
    expect(gate.fallback).toBe("Build a deep work path");
  });

  it("allows upload for LEARNING goal after 3 sessions", () => {
    const gate = buildContentStudyGate({
      ...healthyBase,
      goal: "LEARNING",
      totalCompletedSessions: 3,
    });
    expect(gate.showUploadEntry).toBe(true);
    expect(gate.fallback).toBeNull();
  });

  it("returns ContentStudyGate schema-compliant output", () => {
    const gate = buildContentStudyGate(healthyBase);
    expect(ContentStudyGateSchema.safeParse(gate).success).toBe(true);
  });
});
