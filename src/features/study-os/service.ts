import { SessionMode } from '../../session/modes';
import { buildLaneSessionBrief } from '../session-start/service';
import { listStoredStudyPlans, upsertStoredStudyPlan } from './repository';
import {
  RecallQuestionSchema,
  StudyOsHomeSurfaceSchema,
  StudyOsPremiumGateSchema,
  StudyOsUnlockGateSchema,
  StudyPlanSchema,
  type RecallQuestion,
  type ReviewItem,
  type StudyBlock,
  type StudyOsHomeSurface,
  type StudyOsPremiumGate,
  type StudyOsUnlockGate,
  type StudyPlan,
} from './schemas';

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

// ─── Day 0 / Unlock Gate ────────────────────────────────────────────

export function computeStudyOsUnlockGate(input: {
  completedSessions: number;
  studyUsageRatio: number;
  firstWeekPhase?: number;
}): StudyOsUnlockGate {
  const { completedSessions, studyUsageRatio, firstWeekPhase = 0 } = input;
  const isDayZero = completedSessions === 0;

  if (isDayZero) {
    return StudyOsUnlockGateSchema.parse({
      isUnlocked: false,
      isDayZero: true,
      completedSessions,
      studyUsageRatio,
      unlockReason: 'day_zero',
    });
  }

  if (completedSessions >= 7 || firstWeekPhase >= 7) {
    return StudyOsUnlockGateSchema.parse({
      isUnlocked: true,
      isDayZero: false,
      completedSessions,
      studyUsageRatio,
      unlockReason: 'full',
    });
  }

  if (completedSessions >= 5 || studyUsageRatio >= 0.35) {
    return StudyOsUnlockGateSchema.parse({
      isUnlocked: true,
      isDayZero: false,
      completedSessions,
      studyUsageRatio,
      unlockReason: completedSessions >= 5 ? 'evidence_sessions' : 'evidence_usage',
    });
  }

  return StudyOsUnlockGateSchema.parse({
    isUnlocked: false,
    isDayZero: false,
    completedSessions,
    studyUsageRatio,
    unlockReason: 'first_week',
  });
}

// ─── Premium Gate ──────────────────────────────────────────────────

export function computeStudyOsPremiumGate(input: {
  hasPremiumEntitlement: boolean;
  revenueCatHealthy: boolean;
}): StudyOsPremiumGate {
  return StudyOsPremiumGateSchema.parse({
    canAccessPremiumDepth: input.hasPremiumEntitlement && input.revenueCatHealthy,
    revenueCatHealthy: input.revenueCatHealthy,
    basicStudyFree: true,
    restrictionReason: input.revenueCatHealthy
      ? input.hasPremiumEntitlement ? null : 'Premium study depth available with VEX+'
      : 'Premium features unavailable — RevenueCat is degraded',
  });
}

// ─── Recall Question ────────────────────────────────────────────────

export function generateRecallQuestion(input: {
  blockTitle: string;
  blockObjective: string;
  reflection?: string | null;
  studyBlockId: string;
  studyPlanId: string;
}): RecallQuestion {
  const kind: 'recall' | 'reflection' = input.reflection ? 'reflection' : 'recall';
  const prompt = kind === 'reflection'
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
  if (!plan) return false;
  return plan.blocks.some((b) => b.status === 'completed');
}

export function buildMemoryContentFromBlock(block: StudyBlock, reflection?: string | null): string {
  return reflection
    ? `Completed: ${block.title} — ${block.objective}. Reflection: ${reflection}`
    : `Completed: ${block.title} — ${block.objective}`;
}

// ─── Enhanced Completion ─────────────────────────────────────────────

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

export function getPlannedBlocksFromPlan(plan: StudyPlan | null): StudyBlock[] {
  if (!plan) return [];
  return plan.blocks.filter((b) => b.status === 'not_started');
}

// ─── Day 0 Student Preview ─────────────────────────────────────────

export function buildDayZeroStudyPreview(): StudyOsHomeSurface {
  return StudyOsHomeSurfaceSchema.parse({
    ctaLabel: 'Start first study block',
    hidden: false,
    offlineFallback: null,
    riskLabel: null,
    title: 'Study OS preview',
  });
}

// ─── Backend Fallback Detection ─────────────────────────────────────

export function isContentStudyBackendAvailable(input: {
  featureHealth: 'healthy' | 'degraded' | 'unavailable';
  aiConfigured: boolean;
  storageConfigured: boolean;
}): boolean {
  return input.featureHealth === 'healthy' && input.aiConfigured && input.storageConfigured;
}

export function getManualStudyFallbackMessage(isOffline: boolean): string {
  if (isOffline) return 'You are offline. Start a manual study block — sync can retry later.';
  return 'Content tools are temporarily unavailable. Start a manual study session instead.';
}
