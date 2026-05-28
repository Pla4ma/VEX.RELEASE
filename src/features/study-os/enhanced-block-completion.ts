import {
  type StudyPlan,
  type RecallQuestion,
} from "./schemas";
import {
  generateRecallQuestion,
  buildMemoryContentFromBlock,
} from "./service-helpers";
import { completeStudyBlock } from "./study-plan-service";

export interface StudyBlockCompletionResult {
  plan: StudyPlan;
  recallQuestion: RecallQuestion | null;
  memoryContent: string | null;
  memoryTags: string[];
  suggestedNextBlock: { title: string; objective: string } | null;
}

export async function completeStudyBlockEnhanced(input: {
  blockId: string;
  reflection?: string | null;
  studyPlanId: string;
  userId: string;
  now?: number;
}): Promise<StudyBlockCompletionResult> {
  const plan = await completeStudyBlock(input);
  const block = plan.blocks.find((b) => b.id === input.blockId);
  if (!block) {
    return {
      plan,
      recallQuestion: null,
      memoryContent: null,
      memoryTags: [],
      suggestedNextBlock: null,
    };
  }
  const recall = generateRecallQuestion({
    blockObjective: block.objective,
    blockTitle: block.title,
    reflection: input.reflection,
    studyBlockId: block.id,
    studyPlanId: plan.id,
  });
  const memoryContent = buildMemoryContentFromBlock(block, input.reflection);
  const memoryTags = [
    block.title.toLowerCase().replace(/\s+/g, "-"),
    "study-block",
  ];
  const nextBlock = plan.blocks.find((b) => b.status === "not_started");
  const suggestedNextBlock = nextBlock
    ? { title: nextBlock.title, objective: nextBlock.objective }
    : null;

  return {
    plan,
    recallQuestion: recall,
    memoryContent,
    memoryTags,
    suggestedNextBlock,
  };
}
