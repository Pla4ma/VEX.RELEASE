import {
  buildDayZeroStudyPreview,
  buildFailedGenerationFallbackPlan,
  buildStudyOsHomeSurface,
  buildStudySessionFromBlock,
  completeStudyBlock,
  createPasteStudyPlan,
  getManualStudyFallbackMessage,
  isContentStudyBackendAvailable,
  mockStore,
} from "./study-os.helpers";

describe("study-os service", () => {
  beforeEach(() => mockStore.clear());

  it("paste source creates study plan with review item", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText:
        "Photosynthesis converts light into energy. Chlorophyll matters.",
      title: "Biology notes",
      userId: "student-1",
    });
    expect(plan.source.type).toBe("paste");
    expect(plan.blocks).toHaveLength(1);
    expect(plan.reviewItems[0]?.prompt).toContain("Photosynthesis");
  });

  it("failed generation returns manual fallback", () => {
    const plan = buildFailedGenerationFallbackPlan({
      now: 10,
      sourceTitle: "Long PDF",
      userId: "student-1",
    });
    expect(plan.status).toBe("failed_generation");
    expect(plan.blocks[0]?.objective).toContain("Long PDF");
  });

  it("study block starts a student session with context", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: "Limits need practice.",
      title: "Calc",
      userId: "student-1",
    });
    const brief = buildStudySessionFromBlock(plan.blocks[0]);
    expect(brief.sessionMode).toBe("STUDY");
    expect(brief.successCondition).toContain("Limits");
  });

  it("completion updates review queue", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: "Read chapter three.",
      title: "History",
      userId: "student-1",
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]?.id ?? "",
      now: 20,
      reflection: "Outline worked",
      studyPlanId: plan.id,
      userId: "student-1",
    });
    expect(updated.blocks[0]?.status).toBe("completed");
    expect(updated.reviewItems).toHaveLength(2);
  });

  it("student lane sees Study OS and non-student hides without plan", () => {
    expect(
      buildStudyOsHomeSurface({ lane: "student", plan: null }).hidden,
    ).toBe(false);
    expect(
      buildStudyOsHomeSurface({ lane: "minimal_normal", plan: null }).hidden,
    ).toBe(true);
  });
});

describe("Day 0 student preview", () => {
  it('Day 0 preview shows "Start first study block" CTA', () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.hidden).toBe(false);
    expect(preview.ctaLabel).toContain("Start first study block");
    expect(preview.title).toContain("VEX helps you");
    expect(preview.riskLabel).toBeNull();
    expect(preview.offlineFallback).toBeNull();
  });

  it("Day 0 student cannot see upload (no upload CTA on preview)", () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.ctaLabel).not.toContain("upload");
    expect(preview.ctaLabel).not.toContain("import");
    expect(preview.ctaLabel).not.toContain("paste");
  });
});

describe("Backend fallback", () => {
  it("isContentStudyBackendAvailable false when degraded", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "degraded",
        aiConfigured: true,
        storageConfigured: true,
      }),
    ).toBe(false);
  });

  it("isContentStudyBackendAvailable false when AI not configured", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "healthy",
        aiConfigured: false,
        storageConfigured: true,
      }),
    ).toBe(false);
  });

  it("isContentStudyBackendAvailable true when all healthy", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "healthy",
        aiConfigured: true,
        storageConfigured: true,
      }),
    ).toBe(true);
  });

  it("manual study fallback offline message", () => {
    expect(getManualStudyFallbackMessage(true)).toContain("offline");
  });

  it("manual study fallback degraded message", () => {
    const msg = getManualStudyFallbackMessage(false);
    expect(msg).toContain("manual study session");
    expect(msg).not.toContain("offline");
  });
});
