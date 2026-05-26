import {
  type CreateStudyBlockInput, CreateStudyBlockInputSchema,
  type ReadMemorySummaryInput, ReadMemorySummaryInputSchema,
  type ScheduleFocusWindowInput, ScheduleFocusWindowInputSchema,
  type UpdateProjectThreadInput, UpdateProjectThreadInputSchema,
  type VexActionResult,
} from './schemas';
import {
  type ActionGate,
  checkFeatureGate,
  notFound,
  repoError,
  success,
  validationError,
} from './action-utils';

import { recordFocusRunEvent, buildFocusRunDisplay } from '../focus-run/service';
import { createManualStudyPlan } from '../study-os/service';
import { completeProjectSession } from '../project-focus/service';
import { findMemoriesForRecommendation } from '../focus-memory/service';
import type { FocusRunDisplay } from '../focus-run/schemas';
import type { FocusMemory } from '../focus-memory/schemas';

export async function vexScheduleFocusWindow(
  rawInput: ScheduleFocusWindowInput,
  gate?: ActionGate,
): Promise<VexActionResult<FocusRunDisplay>> {
  const gateResult = checkFeatureGate<FocusRunDisplay>('schedule_focus_window', gate ?? null);
  if (gateResult) return gateResult;

  const parsed = ScheduleFocusWindowInputSchema.safeParse(rawInput);
  if (!parsed.success) return validationError<FocusRunDisplay>('schedule_focus_window', parsed.error.message);

  try {
    const run = await recordFocusRunEvent({
      eventType: 'clean_start',
      signal: parsed.data.signal,
      userId: parsed.data.userId,
    });
    const display = buildFocusRunDisplay({ lane: parsed.data.lane, run });
    return success(display);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown repository error';
    return repoError<FocusRunDisplay>('schedule_focus_window', message);
  }
}

export async function vexCreateStudyBlock(
  rawInput: CreateStudyBlockInput,
  gate?: ActionGate,
): Promise<VexActionResult> {
  const gateResult = checkFeatureGate('create_study_block', gate ?? null);
  if (gateResult) return gateResult;

  const parsed = CreateStudyBlockInputSchema.safeParse(rawInput);
  if (!parsed.success) return validationError('create_study_block', parsed.error.message);

  try {
    const plan = await createManualStudyPlan({
      deadlineAt: parsed.data.deadlineAt,
      objective: parsed.data.objective,
      title: parsed.data.title,
      userId: parsed.data.userId,
    });
    return success(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown repository error';
    return repoError('create_study_block', message);
  }
}

export async function vexUpdateProjectThread(
  rawInput: UpdateProjectThreadInput,
  gate?: ActionGate,
): Promise<VexActionResult> {
  const gateResult = checkFeatureGate('update_project_thread', gate ?? null);
  if (gateResult) return gateResult;

  const parsed = UpdateProjectThreadInputSchema.safeParse(rawInput);
  if (!parsed.success) return validationError('update_project_thread', parsed.error.message);

  try {
    const thread = await completeProjectSession({
      blocker: parsed.data.blocker,
      handoffNote: parsed.data.handoffNote,
      lastSessionSummary: parsed.data.lastSessionSummary,
      nextMove: parsed.data.nextMove,
      openQuestion: parsed.data.openQuestion,
      threadId: parsed.data.threadId,
      userId: parsed.data.userId,
    });
    return success(thread);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown repository error';
    if (message.includes('could not be found')) return notFound('update_project_thread', message);
    return repoError('update_project_thread', message);
  }
}

export async function vexReadMemorySummary(
  rawInput: ReadMemorySummaryInput,
  gate?: ActionGate,
): Promise<VexActionResult<FocusMemory[]>> {
  const gateResult = checkFeatureGate<FocusMemory[]>('read_memory_summary', gate ?? null);
  if (gateResult) return gateResult;

  const parsed = ReadMemorySummaryInputSchema.safeParse(rawInput);
  if (!parsed.success) return validationError<FocusMemory[]>('read_memory_summary', parsed.error.message);

  try {
    const memories = await findMemoriesForRecommendation({
      minConfidence: parsed.data.minConfidence ?? 0.5,
      userId: parsed.data.userId,
      types: parsed.data.types as FocusMemory['type'][] | undefined,
    });
    return success(memories);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown repository error';
    return repoError<FocusMemory[]>('read_memory_summary', message);
  }
}
