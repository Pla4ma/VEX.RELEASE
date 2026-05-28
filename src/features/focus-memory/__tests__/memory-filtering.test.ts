import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  findMemoriesForRecommendation,
  acceptMemory,
  deleteMemory,
  listActiveMemories,
  scopeMessageForSource,
} from "./helpers";

describe("FocusMemory — filtering & scoping", () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, "now").mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("empty memories produce insufficient_data fallback", async () => {
    const { buildMemoryEvidence } = await import("./helpers");
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
});
