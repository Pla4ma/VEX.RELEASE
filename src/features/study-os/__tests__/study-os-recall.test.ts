import {
  completeStudyBlock,
  completeStudyBlockEnhanced,
  createPasteStudyPlan,
  generateRecallQuestion,
  getEmptyRecallFallback,
  getPlannedBlocksFromPlan,
  shouldGenerateRecall,
  mockStore,
} from "./study-os.helpers";

describe("Recall questions", () => {
  beforeEach(() => mockStore.clear());

  it("generates recall question from block data", () => {
    const recall = generateRecallQuestion({
      blockObjective: "Understand limits",
      blockTitle: "Calculus Limits",
      studyBlockId: "block-1",
      studyPlanId: "plan-1",
    });
    expect(recall.kind).toBe("recall");
    expect(recall.prompt).toContain("Calculus Limits");
    expect(recall.answerHint).toBeNull();
  });

  it("generates reflection question when reflection given", () => {
    const recall = generateRecallQuestion({
      blockObjective: "Understand limits",
      blockTitle: "Calculus Limits",
      reflection: "I focused on the epsilon-delta definition",
      studyBlockId: "block-1",
      studyPlanId: "plan-1",
    });
    expect(recall.kind).toBe("reflection");
    expect(recall.prompt).toContain("Reflect");
    expect(recall.answerHint).toBe("I focused on the epsilon-delta definition");
  });

  it("empty recall fallback returns placeholder", () => {
    const fallback = getEmptyRecallFallback();
    expect(fallback.id).toBe("no-recall");
    expect(fallback.kind).toBe("reflection");
  });

  it("shouldGenerateRecall false when no completed blocks", () => {
    expect(shouldGenerateRecall(null)).toBe(false);
  });

  it("shouldGenerateRecall true when completed blocks exist", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: "Read chapter 1.",
      title: "History",
      userId: "s-1",
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]?.id ?? "",
      studyPlanId: plan.id,
      userId: "s-1",
      now: 20,
    });
    expect(shouldGenerateRecall(updated)).toBe(true);
  });
});

describe("Enhanced completion", () => {
  beforeEach(() => mockStore.clear());

  it("returns recall question with completed plan", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: "Review cell structure.",
      title: "Biology",
      userId: "s-1",
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]?.id ?? "",
      reflection: "Memorized organelles",
      studyPlanId: plan.id,
      userId: "s-1",
      now: 20,
    });
    expect(result.plan.blocks[0]?.status).toBe("completed");
    expect(result.recallQuestion).not.toBeNull();
    expect(result.recallQuestion?.kind).toBe("reflection");
    expect(result.recallQuestion?.answerHint).toBe("Memorized organelles");
    expect(result.memoryContent).toContain("Memorized organelles");
    expect(result.memoryTags).toContain("study-block");
  });

  it("returns null suggested next when all blocks complete", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: "Chapter one.",
      title: "Reading",
      userId: "s-1",
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]?.id ?? "",
      studyPlanId: plan.id,
      userId: "s-1",
      now: 20,
    });
    expect(result.suggestedNextBlock).toBeNull();
  });

  it("getPlannedBlocksFromPlan returns not-started blocks", async () => {
    const plan = await createPasteStudyPlan({
      now: 10,
      pastedText: "Study math.",
      title: "Math",
      userId: "s-1",
    });
    expect(getPlannedBlocksFromPlan(plan)).toHaveLength(1);
  });
});
