import {
  CompletionReflectionInputSchema,
  CompletionReflectionSchema,
  type CompletionReflection,
  type CompletionReflectionInput,
} from './schemas';

function durationMinutes(input: CompletionReflectionInput): number {
  const seconds =
    input.sessionSummary.effectiveDuration ||
    input.sessionSummary.actualDuration ||
    input.sessionSummary.plannedDuration;
  return Math.max(1, Math.round(seconds / 60));
}

function resolveTone(
  input: CompletionReflectionInput,
): CompletionReflection['tone'] {
  if (input.motivationStyle === 'student' || input.primaryGoal === 'STUDY') {
    return 'study';
  }
  if (input.motivationStyle === 'coach_led') {
    return 'coach';
  }
  if (input.motivationStyle === 'intense' || input.bossIntensity === 'high') {
    return 'intense';
  }
  return 'calm';
}

function buildReflection(input: CompletionReflectionInput): string {
  const minutes = durationMinutes(input);
  const target =
    input.studyTarget ?? input.primaryGoal?.toLowerCase() ?? 'focus';

  if (
    input.sessionSummary.streakMaintained === false ||
    (input.sessionSummary.focusPurityScore ?? 100) < 70
  ) {
    return `You still held the thread for ${minutes} minutes. Tomorrow starts from something real.`;
  }
  if (
    input.sessionSummary.interruptions === 0 &&
    input.sessionSummary.pauses === 0
  ) {
    return `You protected ${minutes} clean minutes for ${target}. That is real momentum.`;
  }
  if ((input.streakDays ?? input.sessionSummary.streakDays ?? 0) > 1) {
    return `You kept the chain alive with ${minutes} focused minutes. Not perfect, still counted.`;
  }
  if (input.firstWeekStage) {
    return `You finished another early rep. ${minutes} minutes is enough proof to come back.`;
  }
  return `You finished ${minutes} minutes and gave tomorrow a cleaner starting point.`;
}

function buildNextAction(input: CompletionReflectionInput): string {
  if (input.studyTarget) {
    return `Next: reopen ${input.studyTarget} for one smaller block.`;
  }
  if (input.primaryGoal === 'STUDY') {
    return 'Next: start one focused study block before adding more scope.';
  }
  if (input.bossIntensity === 'high') {
    return 'Next: take the win, then hit one shorter block.';
  }
  return 'Next: return home and keep the next session simple.';
}

export function buildCompletionReflection(
  rawInput: CompletionReflectionInput,
): CompletionReflection {
  const input = CompletionReflectionInputSchema.parse(rawInput);
  const tone = resolveTone(input);
  const adaptivePayoff = input.progressLabel ?? input.studyTarget ?? null;

  return CompletionReflectionSchema.parse({
    adaptivePayoff,
    nextAction: buildNextAction(input),
    reflection: buildReflection(input),
    tone,
  });
}
