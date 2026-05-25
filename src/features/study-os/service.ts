import { SessionMode } from '../../session/modes';
import { buildLaneSessionBrief } from '../session-start/service';
import { listStoredStudyPlans, upsertStoredStudyPlan } from './repository';
import { StudyOsHomeSurfaceSchema, StudyPlanSchema, type ReviewItem, type StudyBlock, type StudyOsHomeSurface, type StudyPlan } from './schemas';

function firstSentence(text: string): string {
  return text.split(/[.!?\n]/).map((part) => part.trim()).find(Boolean) ?? 'Study next useful section';
}

function planId(userId: string, now: number): string {
  return `${userId}:study:${now}`;
}

function makeBlock(id: string, title: string, objective: string): StudyBlock {
  return {
    estimatedMinutes: 25,
    id: `${id}:block:1`,
    objective,
    priority: 'medium',
    status: 'not_started',
    studyPlanId: id,
    title,
  };
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

export function buildStudySessionFromBlock(block: StudyBlock) {
  return {
    ...buildLaneSessionBrief({ durationSeconds: block.estimatedMinutes * 60, lane: 'student' }),
    afterCompletion: 'Completion will add one review prompt and update the queue.',
    sessionMode: SessionMode.STUDY,
    successCondition: block.objective,
    title: block.title,
  };
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

export function buildStudyOsHomeSurface(input: {
  isOffline?: boolean;
  lane: 'student' | 'game_like' | 'deep_creative' | 'minimal_normal';
  plan: StudyPlan | null;
}): StudyOsHomeSurface {
  const hidden = input.lane !== 'student' && !input.plan;
  return StudyOsHomeSurfaceSchema.parse({
    ctaLabel: input.plan ? 'Start study block' : 'Create study block',
    hidden,
    offlineFallback: input.isOffline ? 'Offline: start a manual study block now; import sync can retry later.' : null,
    riskLabel: input.plan?.deadlineAt ? 'Deadline risk active' : null,
    title: input.plan?.title ?? 'Study OS',
  });
}
