import {
  mockStore,
  buildDayZeroStudyPreview,
  getManualStudyFallbackMessage,
  isContentStudyBackendAvailable,
} from "./helpers";

describe("Day 0 student preview", () => {
  beforeEach(() => mockStore.clear());

  it('Day 0 preview shows "Start first study block" CTA', () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.hidden).toBe(false);
    expect(preview.ctaLabel).toContain("Start first study block");
    expect(preview.title).toContain("preview");
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
