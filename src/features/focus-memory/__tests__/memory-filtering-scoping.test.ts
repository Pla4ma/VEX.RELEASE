import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  findMemoriesForRecommendation,
  acceptMemory,
  deleteMemory,
  listActiveMemories,
  generateRecommendationEvidence,
  buildColdStartEvidence,
  buildMemoryEvidence,
  scopeMessageForSource,
  filterImportMemories,
  contentScopeForSource,
} from "./helpers";

describe("FocusMemory — filtering & scoping", () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, "now").mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("empty memories produce insufficient_data fallback", () => {
    const evidence = buildMemoryEvidence([]);
    expect(evidence.fallbackReason).toBe("insufficient_data");
    expect(evidence.memoryIds).toBeUndefined();
  });

  it("deleted memory excluded from recommendations", async () => {
    const memory = await createMemoryCandidate({
      userId: "user-4",
      type: "best_time_window",
      summary: "Best at 9am.",
      source: "behavior",
      confidence: 0.8,
      createdAt: currentTime,
    });
    await acceptMemory(memory.id, "user-4");
    expect(
      await findMemoriesForRecommendation({ userId: "user-4" }),
    ).toHaveLength(1);
    await deleteMemory(memory.id, "user-4");
    expect(await listActiveMemories("user-4")).toHaveLength(0);
    expect(
      await findMemoriesForRecommendation({ userId: "user-4" }),
    ).toHaveLength(0);
  });

  it("prevents re-creation of deleted memory from same evidence hash", async () => {
    const evidenceHash = "ev-deadbeef";
    await createMemoryCandidate({
      userId: "user-5",
      type: "best_time_window",
      summary: "Best at 10am.",
      source: "behavior",
      confidence: 0.75,
      evidenceHash,
      createdAt: currentTime,
    });
    const memories = await listActiveMemories("user-5");
    await deleteMemory(memories[0]!.id, "user-5");
    await expect(
      createMemoryCandidate({
        userId: "user-5",
        type: "best_time_window",
        summary: "Best at 10am.",
        source: "behavior",
        confidence: 0.75,
        evidenceHash,
        createdAt: currentTime,
      }),
    ).rejects.toThrow(/EvidenceConflict/);
  });

  it("allows new memory with distinct evidence hash after deletion", async () => {
    const hash1 = "ev-abc123";
    const hash2 = "ev-xyz789";
    const m1 = await createMemoryCandidate({
      userId: "user-5b",
      type: "best_time_window",
      summary: "Morning session works.",
      source: "behavior",
      confidence: 0.8,
      evidenceHash: hash1,
      createdAt: currentTime,
    });
    await deleteMemory(m1.id, "user-5b");
    const m2 = await createMemoryCandidate({
      userId: "user-5b",
      type: "avoidance_trigger",
      summary: "Afternoon drag.",
      source: "behavior",
      confidence: 0.7,
      evidenceHash: hash2,
      createdAt: currentTime,
    });
    expect(m2.id).toBeDefined();
    expect(m2.evidenceHash).toBe(hash2);
  });

  it("scopes imported content messages as task-only", () => {
    const result = scopeMessageForSource(
      "Use spaced repetition for bio exam.",
      "import",
    );
    expect(result.scoped).toBe(true);
    expect(result.message).toMatch(/From your content/);
  });

  it("does not scope session_completion messages", () => {
    const result = scopeMessageForSource(
      "You focus better in the morning.",
      "session_completion",
    );
    expect(result.scoped).toBe(false);
    expect(result.message).toBe("You focus better in the morning.");
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
