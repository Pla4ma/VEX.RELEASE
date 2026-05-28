import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  findMemoriesForRecommendation,
  acceptMemory,
  listActiveMemories,
  generateRecommendationEvidence,
  buildColdStartEvidence,
  buildMemoryEvidence,
  filterImportMemories,
  contentScopeForSource,
} from "./helpers";

describe("FocusMemory — scoping & evidence", () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, "now").mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("filterImportMemories separates import-sourced from general", async () => {
    const m1 = await createMemoryCandidate({
      userId: "user-6",
      type: "project_continuity",
      summary: "Draft stopped at section 3.",
      source: "import",
      confidence: 0.9,
      createdAt: currentTime,
    });
    const m2 = await createMemoryCandidate({
      userId: "user-6",
      type: "best_time_window",
      summary: "Best focus at 8am.",
      source: "behavior",
      confidence: 0.8,
      createdAt: currentTime,
    });
    await acceptMemory(m1.id, "user-6");
    await acceptMemory(m2.id, "user-6");
    const all = await listActiveMemories("user-6");
    const { taskScoped, excluded } = filterImportMemories(all);
    expect(taskScoped).toHaveLength(1);
    expect(taskScoped[0]!.source).toBe("behavior");
    expect(excluded).toHaveLength(1);
    expect(excluded[0]!.source).toBe("import");
  });

  it("contentScopeForSource returns task_only for import source", () => {
    expect(contentScopeForSource("import")).toBe("task_only");
    expect(contentScopeForSource("session_completion")).toBe("general");
    expect(contentScopeForSource("behavior")).toBe("general");
    expect(contentScopeForSource("reflection")).toBe("general");
    expect(contentScopeForSource("manual")).toBe("general");
  });

  it("buildColdStartEvidence handles all valid reasons", () => {
    expect(buildColdStartEvidence("cold_start").fallbackReason).toBe(
      "cold_start",
    );
    expect(buildColdStartEvidence("insufficient_data").fallbackReason).toBe(
      "insufficient_data",
    );
    expect(buildColdStartEvidence("user_override").fallbackReason).toBe(
      "user_override",
    );
  });

  it("generateRecommendationEvidence with explicit fallback reason", () => {
    const evidence = generateRecommendationEvidence(
      [],
      5,
      "deep_creative",
      "user_override",
    );
    expect(evidence.fallbackReason).toBe("user_override");
    expect(evidence.memoryIds).toBeUndefined();
    expect(evidence.lane).toBe("deep_creative");
  });

  it("buildMemoryEvidence with multiple memories computes avg confidence", async () => {
    const m1 = await createMemoryCandidate({
      userId: "user-7",
      type: "successful_session_pattern",
      summary: "Pattern A.",
      source: "session_completion",
      confidence: 0.6,
      createdAt: currentTime,
    });
    const m2 = await createMemoryCandidate({
      userId: "user-7",
      type: "successful_session_pattern",
      summary: "Pattern B.",
      source: "session_completion",
      confidence: 0.8,
      createdAt: currentTime,
    });
    await acceptMemory(m1.id, "user-7");
    await acceptMemory(m2.id, "user-7");
    const memories = await findMemoriesForRecommendation({ userId: "user-7" });
    const evidence = buildMemoryEvidence(memories);
    expect(evidence.confidence).toBe(0.7);
    expect(evidence.memoryIds).toHaveLength(2);
    expect(evidence.evidenceSummary).toContain("Pattern A.");
    expect(evidence.evidenceSummary).toContain("Pattern B.");
  });
});
