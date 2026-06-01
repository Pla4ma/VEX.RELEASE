import {
  type CompleteReflectionInput,
  CompleteReflectionInputSchema,
  type CreateFocusSessionInput,
  CreateFocusSessionInputSchema,
  type StartRescueInput,
  StartRescueInputSchema,
  type StartSessionInput,
  StartSessionInputSchema,
  type UpdateLaneOverrideInput,
  UpdateLaneOverrideInputSchema,
  type VexActionResult,
} from './schemas';
import {
  type ActionGate,
  checkFeatureGate,
  repoError,
  success,
  validationError,
} from './action-utils';

import {
  createStarterSessionConfig,
  buildLaneSessionBrief,
} from '../session-start/service';
import { buildCompletionPersonalization } from '../session-completion/completion-personalization';
import { createRescuePlan } from '../rescue-mode/service';
import { resolveInitialLane } from '../lane-engine/service';
import type { LaneProfile } from '../lane-engine/types';
import type { SessionSummary } from '../../session/types';
import { z } from 'zod';

export {
  vexScheduleFocusWindow,
  vexCreateStudyBlock,
  vexUpdateProjectThread,
  vexReadMemorySummary,
} from './service-async';

export function vexCreateFocusSession(
  rawInput: CreateFocusSessionInput,
  gate?: ActionGate,
): VexActionResult {
  const gateResult = checkFeatureGate('create_focus_session', gate ?? null);
  if (gateResult) {return gateResult;}

  const parsed = CreateFocusSessionInputSchema.safeParse(rawInput);
  if (!parsed.success)
    {return validationError('create_focus_session', parsed.error.message);}

  const config = createStarterSessionConfig({
    category: parsed.data.category ?? null,
    durationMinutes: parsed.data.durationMinutes,
  });
  return success(config);
}

export function vexStartSession(
  rawInput: StartSessionInput,
  gate?: ActionGate,
): VexActionResult {
  const gateResult = checkFeatureGate('start_session', gate ?? null);
  if (gateResult) {return gateResult;}

  const parsed = StartSessionInputSchema.safeParse(rawInput);
  if (!parsed.success)
    {return validationError('start_session', parsed.error.message);}

  const brief = buildLaneSessionBrief({
    deadlineSeconds: parsed.data.deadlineSeconds,
    durationSeconds: parsed.data.durationSeconds,
    isOffline: parsed.data.isOffline,
    isRescue: parsed.data.isRescue,
    lane: parsed.data.lane,
    projectTitle: parsed.data.projectTitle,
    subjectOrTask: parsed.data.subjectOrTask,
    weakTopic: parsed.data.weakTopic,
  });
  return success(brief);
}

export function vexCompleteReflection(
  rawInput: CompleteReflectionInput,
  gate?: ActionGate,
): VexActionResult {
  const gateResult = checkFeatureGate('complete_reflection', gate ?? null);
  if (gateResult) {return gateResult;}

  const parsed = CompleteReflectionInputSchema.safeParse(rawInput);
  if (!parsed.success)
    {return validationError('complete_reflection', parsed.error.message);}

  const {
    summary: inputSummary,
    lane,
    reflectionAnswer,
    isComeback,
    userId,
  } = parsed.data;
  const now = Date.now();

  try {
    const fullSummary: SessionSummary = {
      actualDuration: inputSummary.effectiveDuration,
      baseScore: 80,
      bonuses: [],
      coinsEarned: 0,
      completionPercentage: inputSummary.completionPercentage,
      createdAt: now,
      damageTaken: 0,
      effectiveDuration: inputSummary.effectiveDuration,
      finalScore: 80,
      focusQuality: 80,
      gemsEarned: 0,
      interruptions: inputSummary.interruptions ?? 0,
      modeBonus: 0,
      pausedDuration: 0,
      pausedTime: 0,
      pauses: 0,
      penaltiesApplied: [],
      plannedDuration: inputSummary.effectiveDuration,
      sessionId: inputSummary.sessionId,
      sessionMode: (inputSummary.sessionMode ??
        'FLOW') as SessionSummary['sessionMode'],
      status: inputSummary.status as SessionSummary['status'],
      streakDays: 0,
      streakIncreased: false,
      streakMaintained: true,
      timeBonus: 0,
      userId,
      userLevel: 1,
      vsAverage: 0,
      vsBest: 0,
      xpEarned: 0,
    };

    const result = buildCompletionPersonalization({
      deletedMemoryIds: [],
      hiddenFeatureKeys: [],
      isComeback: isComeback ?? false,
      lane,
      reflectionAnswer,
      summary: fullSummary,
    });
    return success(result);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return validationError('complete_reflection', err.message);
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return repoError('complete_reflection', message);
  }
}

export function vexStartRescue(
  rawInput: StartRescueInput,
  gate?: ActionGate,
): VexActionResult {
  const gateResult = checkFeatureGate('start_rescue', gate ?? null);
  if (gateResult) {return gateResult;}

  const parsed = StartRescueInputSchema.safeParse(rawInput);
  if (!parsed.success)
    {return validationError('start_rescue', parsed.error.message);}

  const plan = createRescuePlan({
    durationSeconds: parsed.data.durationSeconds,
    lane: parsed.data.lane,
    reason: parsed.data.reason,
    taskDescription: parsed.data.taskDescription,
    userId: parsed.data.userId,
  });
  return success(plan);
}

export function vexUpdateLaneOverride(
  rawInput: UpdateLaneOverrideInput,
  gate?: ActionGate,
): VexActionResult<LaneProfile> {
  gate;

  const parsed = UpdateLaneOverrideInputSchema.safeParse(rawInput);
  if (!parsed.success)
    {return validationError('update_lane_override', parsed.error.message);}

  const profile = resolveInitialLane({
    manualOverride: parsed.data.manualOverride,
  });
  return success(profile);
}
