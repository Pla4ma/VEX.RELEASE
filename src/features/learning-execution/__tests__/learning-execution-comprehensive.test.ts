/**
 * Comprehensive tests for learning-execution feature.
 *
 * Covers: repository.ts (mapActivePlanToLearningTarget),
 * service.ts (resolveLearningExecutionPersona, buildLearningExecutionCopy,
 * buildContentStudyGate, buildLearningSessionParams, buildLearningExecutionLayer),
 * schemas.ts (all Zod schemas),
 * types.ts (inferred types).
 */

import { mapActivePlanToLearningTarget } from "../repository";
import {
  resolveLearningExecutionPersona,
  buildLearningExecutionCopy,
  buildContentStudyGate,
  buildLearningSessionParams,
  buildLearningExecutionLayer,
} from "../service";
import {
  LearningExecutionPersonaSchema,
  LearningExecutionCopySchema,
  ContentStudyGateInputSchema,
  ContentStudyGateSchema,
  LearningSessionTargetSchema,
  LearningExecutionLayerSchema,
} from "../schemas";

/* ─── Repository: mapActivePlanToLearningTarget ─────────────────────── */

describe("learning-execution comprehensive", () => {
  describe("repository – mapActivePlanToLearningTarget", () => {
    it("returns null when plan is null", () => {
      const result = mapActivePlanToLearningTarget({
        plan: null,
        persona: "student",
      });
      expect(result).toBeNull();
    });

    it("maps a full active plan to a LearningSessionTarget", () => {
      const plan = {
        contentId: "content-abc",
        generationId: "gen-123",
        nextTask: { id: "task-42", content: "Chapter 3: Photosynthesis" },
        remainingMinutes: 25,
        title: "Biology Study Plan",
      };
      const result = mapActivePlanToLearningTarget({
        plan,
        persona: "student",
      });
      expect(result).not.toBeNull();
      expect(result!.contentId).toBe("content-abc");
      expect(result!.generationId).toBe("gen-123");
      expect(result!.nextTaskId).toBe("task-42");
      expect(result!.focusAreas).toEqual(["Chapter 3: Photosynthesis"]);
      expect(result!.persona).toBe("student");
      expect(result!.remainingMinutes).toBe(25);
      expect(result!.title).toBe("Biology Study Plan");
    });

    it("sets nextTaskId to null and focusAreas to empty when nextTask is missing", () => {
      const plan = {
        contentId: "content-xyz",
        generationId: "gen-456",
        nextTask: null,
        remainingMinutes: 10,
        title: "Quick Focus",
      };
      const result = mapActivePlanToLearningTarget({
        plan,
        persona: "work",
      });
      expect(result).not.toBeNull();
      expect(result!.nextTaskId).toBeNull();
      expect(result!.focusAreas).toEqual([]);
      expect(result!.persona).toBe("work");
    });

    it("clamps remainingMinutes to at least 1", () => {
      const plan = {
        contentId: "c1",
        generationId: "g1",
        nextTask: null,
        remainingMinutes: 0,
        title: "Zero min",
      };
      const result = mapActivePlanToLearningTarget({
        plan,
        persona: "growth",
      });
      expect(result!.remainingMinutes).toBe(1);
    });

    it("passes through all persona values correctly", () => {
      const plan = {
        contentId: "c1",
        generationId: "g1",
        nextTask: null,
        remainingMinutes: 15,
        title: "Test",
      };
      const personae = ["student", "work", "creative", "growth", "learning"] as const;
      for (const persona of personae) {
        const result = mapActivePlanToLearningTarget({ plan, persona });
        expect(result!.persona).toBe(persona);
      }
    });
  });

  /* ─── Service: resolveLearningExecutionPersona ──────────────────── */

  describe("service – resolveLearningExecutionPersona", () => {
    it("maps all five goals to their respective personae", () => {
      expect(resolveLearningExecutionPersona({ goal: "STUDY" })).toBe("student");
      expect(resolveLearningExecutionPersona({ goal: "LEARNING" })).toBe("learning");
      expect(resolveLearningExecutionPersona({ goal: "WORK" })).toBe("work");
      expect(resolveLearningExecutionPersona({ goal: "CREATIVE" })).toBe("creative");
      expect(resolveLearningExecutionPersona({ goal: "PERSONAL" })).toBe("growth");
    });

    it("falls back to motivationPrimary when goal is null", () => {
      expect(
        resolveLearningExecutionPersona({ goal: null, motivationPrimary: "student" }),
      ).toBe("learning");
      expect(
        resolveLearningExecutionPersona({ goal: null, motivationPrimary: "creator" }),
      ).toBe("creative");
      expect(
        resolveLearningExecutionPersona({ goal: null, motivationPrimary: "worker" }),
      ).toBe("work");
    });

    it("defaults to work when goal is null and motivationPrimary is unknown", () => {
      expect(
        resolveLearningExecutionPersona({ goal: null, motivationPrimary: "other" }),
      ).toBe("work");
    });

    it("defaults to work when goal is null and motivationPrimary is undefined", () => {
      expect(
        resolveLearningExecutionPersona({ goal: null }),
      ).toBe("work");
    });

    it("defaults to work when goal is null and motivationPrimary is null", () => {
      expect(
        resolveLearningExecutionPersona({ goal: null, motivationPrimary: null }),
      ).toBe("work");
    });

    it("goal takes priority over motivationPrimary", () => {
      expect(
        resolveLearningExecutionPersona({ goal: "STUDY", motivationPrimary: "worker" }),
      ).toBe("student");
    });
  });

  /* ─── Service: buildLearningExecutionCopy ───────────────────────── */

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

  /* ─── Service: buildContentStudyGate ────────────────────────────── */

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

  /* ─── Service: buildLearningSessionParams ───────────────────────── */

  describe("service – buildLearningSessionParams", () => {
    const baseTarget = {
      contentId: "c1",
      focusAreas: ["focus-a"],
      generationId: "g1",
      nextTaskId: "t1",
      persona: "student" as const,
      remainingMinutes: 20,
      title: "Study Session",
    };

    it("maps student persona to STUDY preset mode", () => {
      const params = buildLearningSessionParams(baseTarget);
      expect(params.presetMode).toBe("STUDY");
    });

    it("maps learning persona to STUDY preset mode", () => {
      const params = buildLearningSessionParams({
        ...baseTarget,
        persona: "learning",
      });
      expect(params.presetMode).toBe("STUDY");
    });

    it("maps creative persona to CREATIVE preset mode", () => {
      const params = buildLearningSessionParams({
        ...baseTarget,
        persona: "creative",
      });
      expect(params.presetMode).toBe("CREATIVE");
    });

    it("maps work persona to DEEP_WORK preset mode", () => {
      const params = buildLearningSessionParams({
        ...baseTarget,
        persona: "work",
      });
      expect(params.presetMode).toBe("DEEP_WORK");
    });

    it("maps growth persona to DEEP_WORK preset mode", () => {
      const params = buildLearningSessionParams({
        ...baseTarget,
        persona: "growth",
      });
      expect(params.presetMode).toBe("DEEP_WORK");
    });

    it("sets source to learning-execution", () => {
      const params = buildLearningSessionParams(baseTarget);
      expect(params.source).toBe("learning-execution");
    });

    it("converts remainingMinutes to suggestedDurationSeconds", () => {
      const params = buildLearningSessionParams({
        ...baseTarget,
        remainingMinutes: 45,
      });
      expect(params.suggestedDurationSeconds).toBe(2700);
    });

    it("sets studyPlanId to generationId", () => {
      const params = buildLearningSessionParams(baseTarget);
      expect(params.studyPlanId).toBe("g1");
    });

    it("sets learningExecutionTaskId to undefined when nextTaskId is null", () => {
      const params = buildLearningSessionParams({
        ...baseTarget,
        nextTaskId: null,
      });
      expect(params.learningExecutionTaskId).toBeUndefined();
    });
  });

  /* ─── Service: buildLearningExecutionLayer ──────────────────────── */

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

  /* ─── Schemas ───────────────────────────────────────────────────── */

  describe("schemas – validation", () => {
    it("LearningExecutionPersonaSchema accepts all 5 personae", () => {
      for (const p of ["student", "work", "creative", "growth", "learning"]) {
        expect(LearningExecutionPersonaSchema.safeParse(p).success).toBe(true);
      }
    });

    it("LearningExecutionPersonaSchema rejects invalid value", () => {
      expect(LearningExecutionPersonaSchema.safeParse("invalid").success).toBe(false);
    });

    it("ContentStudyGateInputSchema validates valid input", () => {
      const result = ContentStudyGateInputSchema.safeParse({
        aiConfigured: true,
        featureHealth: "healthy",
        goal: "STUDY",
        hasPrivacyDisclosure: true,
        rateLimitsConfigured: true,
        storageConfigured: true,
        totalCompletedSessions: 3,
      });
      expect(result.success).toBe(true);
    });

    it("ContentStudyGateInputSchema rejects negative session count", () => {
      const result = ContentStudyGateInputSchema.safeParse({
        aiConfigured: true,
        featureHealth: "healthy",
        goal: "STUDY",
        hasPrivacyDisclosure: true,
        rateLimitsConfigured: true,
        storageConfigured: true,
        totalCompletedSessions: -1,
      });
      expect(result.success).toBe(false);
    });

    it("ContentStudyGateInputSchema accepts null goal", () => {
      const result = ContentStudyGateInputSchema.safeParse({
        aiConfigured: false,
        featureHealth: "degraded",
        goal: null,
        hasPrivacyDisclosure: false,
        rateLimitsConfigured: false,
        storageConfigured: false,
        totalCompletedSessions: 0,
      });
      expect(result.success).toBe(true);
    });

    it("LearningSessionTargetSchema rejects empty contentId", () => {
      const result = LearningSessionTargetSchema.safeParse({
        contentId: "",
        focusAreas: [],
        generationId: "g1",
        nextTaskId: null,
        persona: "student",
        remainingMinutes: 10,
        title: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("LearningSessionTargetSchema rejects remainingMinutes < 1", () => {
      const result = LearningSessionTargetSchema.safeParse({
        contentId: "c1",
        focusAreas: [],
        generationId: "g1",
        nextTaskId: null,
        persona: "student",
        remainingMinutes: 0,
        title: "Test",
      });
      expect(result.success).toBe(false);
    });
  });
});
