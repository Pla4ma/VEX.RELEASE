import { listStoredStudyPlans, upsertStoredStudyPlan } from './repository';
import {
  StudyPlanSchema,
  type RecallQuestion,
  type ReviewItem,
  type StudyPlan,
} from './schemas';
import {
  firstSentence,
  planId,
  makeBlock,
  generateRecallQuestion,
  buildMemoryContentFromBlock,
} from './service-helpers';

export interface StudyBlockCompletionResult {
  plan: StudyPlan;
  recallQuestion: RecallQuestion | null;
  memoryContent: string | null;
  memoryTags: string[];
  suggestedNextBlock: { title: string; objective: string } | null;
}

export async function createManualStudyPlan(input: {
  deadlineAt?: number | null;
  objective: string;
  title: string;
  userId: string;
  now?: number;
}): Promise<StudyPlan> {
  const now = input.now ?? Date.now();
  const id = planId(input.userId, now);
  return upsertStoredStudyPlan(StudyPlanSchema.parse({
    blocks: [makeBlock(id, input.title, input.objective)],
    createdAt: now,
    deadlineAt: input.deadlineAt ?? null,
    id,
    reviewItems: [],
    source: { createdAt: now, extractedTextStatus: 'none', id: `${id}:source`, title: input.title, type: 'manual', userId: input.userId },
    status: 'active',
    title: input.title,
    userId: input.userId,
  }));
}

export async function createPasteStudyPlan(input: {
  pastedText: string;
  title: string;
  userId: string;
  now?: number;
}): Promise<StudyPlan> {
  const now = input.now ?? Date.now();
  const id = planId(input.userId, now);
  const objective = firstSentence(input.pastedText);
  return upsertStoredStudyPlan(StudyPlanSchema.parse({
    blocks: [makeBlock(id, `Review ${input.title}`, objective)],
    createdAt: now,
    deadlineAt: null,
    id,
    reviewItems: [{ answerHint: objective, confidence: 'unknown', dueAt: now + 86_400_000, id: `${id}:review:1`, prompt: `Explain ${objective}`, studyPlanId: id }],
    source: { createdAt: now, extractedTextStatus: 'ready', id: `${id}:source`, title: input.title, type: 'paste', userId: input.userId },
    status: 'active',
    title: input.title,
    userId: input.userId,
  }));
}

export function buildFailedGenerationFallbackPlan(input: {
  sourceTitle: string;
  userId: string;
  now?: number;
}): StudyPlan {
  const now = input.now ?? Date.now();
  const id = planId(input.userId, now);
  return StudyPlanSchema.parse({
    blocks: [makeBlock(id, 'Manual study block', `Study one section from ${input.sourceTitle}`)],
    createdAt: now,
    deadlineAt: null,
    id,
    reviewItems: [],
    source: { createdAt: now, extractedTextStatus: 'failed', id: `${id}:source`, title: input.sourceTitle, type: 'paste', userId: input.userId },
    status: 'failed_generation',
    title: input.sourceTitle,
    userId: input.userId,
  });
}

export async function completeStudyBlock(input: {
  blockId: string;
  reflection?: string | null;
  studyPlanId: string;
  userId: string;
  now?: number;
}): Promise<StudyPlan> {
  const plans = await listStoredStudyPlans(input.userId);
  const plan = plans.find((item) => item.id === input.studyPlanId);
  if (!plan) throw new Error('Study plan could not be found.');
  const now = input.now ?? Date.now();
  const review: ReviewItem = {
    answerHint: input.reflection ?? null,
    confidence: 'unknown',
    dueAt: now + 86_400_000,
    id: `${input.studyPlanId}:review:${now}`,
    prompt: input.reflection ? 'Review what made this block work.' : 'Recall the main idea from this block.',
    studyPlanId: input.studyPlanId,
  };
  return upsertStoredStudyPlan(StudyPlanSchema.parse({
    ...plan,
    blocks: plan.blocks.map((block) => block.id === input.blockId ? { ...block, status: 'completed' } : block),
    reviewItems: [...plan.reviewItems, review],
    status: plan.blocks.every((block) => block.id === input.blockId || block.status === 'completed') ? 'completed' : plan.status,
  }));
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
    return { plan, recallQuestion: null, memoryContent: null, memoryTags: [], suggestedNextBlock: null };
  }
  const recall = generateRecallQuestion({
    blockObjective: block.objective,
    blockTitle: block.title,
    reflection: input.reflection,
    studyBlockId: block.id,
    studyPlanId: plan.id,
  });
  const memoryContent = buildMemoryContentFromBlock(block, input.reflection);
  const memoryTags = [block.title.toLowerCase().replace(/\s+/g, '-'), 'study-block'];
  const nextBlock = plan.blocks.find((b) => b.status === 'not_started');
  const suggestedNextBlock = nextBlock
    ? { title: nextBlock.title, objective: nextBlock.objective }
    : null;

  return { plan, recallQuestion: recall, memoryContent, memoryTags, suggestedNextBlock };
}
