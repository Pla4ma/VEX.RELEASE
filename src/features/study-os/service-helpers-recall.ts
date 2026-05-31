import {
  RecallQuestionSchema,
  type RecallQuestion,
  type StudyBlock,
  type StudyPlan,
} from './schemas';

export function generateRecallQuestion(input: {
  blockTitle: string;
  blockObjective: string;
  reflection?: string | null;
  studyBlockId: string;
  studyPlanId: string;
}): RecallQuestion {
  const kind: 'recall' | 'reflection' = input.reflection
    ? 'reflection'
    : 'recall';
  const prompt =
    kind === 'reflection'
      ? `Reflect: ${input.blockObjective}`
      : `Recall the main concept from "${input.blockTitle}"`;
  return RecallQuestionSchema.parse({
    id: `${input.studyBlockId}:recall:${Date.now()}`,
    prompt,
    answerHint: input.reflection ? input.reflection.slice(0, 200) : null,
    kind,
    studyBlockId: input.studyBlockId,
    studyPlanId: input.studyPlanId,
  });
}

export function getEmptyRecallFallback(): RecallQuestion {
  return RecallQuestionSchema.parse({
    id: 'no-recall',
    prompt: 'No study blocks completed yet — start one first.',
    answerHint: null,
    kind: 'reflection',
    studyBlockId: 'none',
    studyPlanId: 'none',
  });
}

export function shouldGenerateRecall(plan: StudyPlan | null): boolean {
  if (!plan) {return false;}
  return plan.blocks.some((b) => b.status === 'completed');
}

export function buildMemoryContentFromBlock(
  block: StudyBlock,
  reflection?: string | null,
): string {
  return reflection
    ? `Completed: ${block.title} — ${block.objective}. Reflection: ${reflection}`
    : `Completed: ${block.title} — ${block.objective}`;
}

export function getPlannedBlocksFromPlan(plan: StudyPlan | null): StudyBlock[] {
  if (!plan) {return [];}
  return plan.blocks.filter((b) => b.status === 'not_started');
}
