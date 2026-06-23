import {
  VexActionCompileResultSchema,
  VexActionContextSchema,
  VexActionSchema,
  type VexAction,
  type VexActionCard,
  type VexActionCompileResult,
  type VexActionContext,
} from './action-schemas';

export function compileVexAction(
  llmOutput: unknown,
  context: VexActionContext,
): VexActionCompileResult {
  const parsedContext = VexActionContextSchema.parse(context);
  const parsedAction = parseAction(llmOutput);
  const blockedReasons = validatePolicy(parsedAction, parsedContext);
  const safeAction = resolveSafeAction(parsedAction, blockedReasons);

  return VexActionCompileResultSchema.parse({
    card: buildActionCard(safeAction),
    blockedReasons,
  });
}

function resolveSafeAction(
  action: VexAction,
  blockedReasons: string[],
): VexAction {
  const firstBlockedReason = blockedReasons[0];
  if (firstBlockedReason) {
    return { type: 'NO_ACTION', reason: firstBlockedReason };
  }
  return action;
}

function parseAction(llmOutput: unknown): VexAction {
  const parsed = VexActionSchema.safeParse(llmOutput);
  if (parsed.success) {
    return parsed.data;
  }
  return {
    type: 'NO_ACTION',
    reason: 'Coach could not turn this into a safe action.',
  };
}

function validatePolicy(
  action: VexAction,
  context: VexActionContext,
): string[] {
  if (action.type === 'START_SESSION' && !context.canStartSession) {
    return ['Session start is unavailable right now.'];
  }
  if (action.type === 'RESCUE_STREAK' && !context.canRescueStreak) {
    return ['Streak rescue is not available for this account.'];
  }
  if (
    action.type === 'CONTINUE_STUDY_PLAN' &&
    !context.allowedStudyPackIds.includes(action.studyPackId)
  ) {
    return ['Study plan is not available to this user.'];
  }
  return [];
}

function buildActionCard(action: VexAction): VexActionCard {
  switch (action.type) {
    case 'START_SESSION':
      return {
        action,
        title: 'Start a focused run',
        body: `Run a ${action.durationMinutes}-minute ${action.mode} session now.`,
        ctaLabel: 'Start session',
        requiresUserConfirmation: true,
      };
    case 'RESCUE_STREAK':
      return {
        action,
        title: 'Rescue your streak',
        body: `Take a ${action.urgency}-urgency recovery step before today slips.`,
        ctaLabel: 'Rescue streak',
        requiresUserConfirmation: true,
      };
    case 'CONTINUE_STUDY_PLAN':
      return {
        action,
        title: 'Continue study plan',
        body: 'Resume the study pack VEX already knows is active.',
        ctaLabel: 'Continue',
        requiresUserConfirmation: true,
      };
    case 'NO_ACTION':
      return {
        action,
        title: 'No safe action',
        body: action.reason,
        ctaLabel: 'Review',
        requiresUserConfirmation: true,
      };
  }
}
