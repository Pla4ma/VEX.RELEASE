import { SessionMode } from '../../session/modes';
import {
  CheckSessionMemoriesInputSchema,
  MemoryContextSchema,
} from './memory-schemas';
import { COMPANION_MEMORY_COPY } from './memory-copy';
import { emitCompanionMemoryCreated } from './memory-events';
import * as repository from './memory-repository';
import type {
  CheckSessionMemoriesInput,
  CompanionMemory,
  CompanionMemoryType,
  MemoryContext,
} from './memory-types';

export async function maybeCreateMemory(
  userId: string,
  type: CompanionMemoryType,
  context: MemoryContext,
): Promise<CompanionMemory | null> {
  const parsedContext = MemoryContextSchema.parse(context);
  const exists = await repository.hasMemory(userId, type);
  if (exists) {
    return null;
  }
  const copy = COMPANION_MEMORY_COPY[type];
  const created = await repository.createMemory({
    body: buildMemoryBody(type, parsedContext),
    grade: parsedContext.grade,
    purityScore: parsedContext.purityScore,
    sessionDate: parsedContext.sessionDate,
    sessionId: parsedContext.sessionId,
    streakDay: parsedContext.streakDay,
    title: copy.title,
    type,
    userId,
  });
  if (created) {
    emitCompanionMemoryCreated(created);
  }
  return created;
}

export async function checkAndRecordSessionMemories(
  input: CheckSessionMemoriesInput,
): Promise<CompanionMemory[]> {
  const parsed = CheckSessionMemoriesInputSchema.parse(input);
  const context = buildMemoryContext(parsed);
  const memoryTypes = getEligibleMemoryTypes(parsed);
  const results = await Promise.all(
    memoryTypes.map((type) => maybeCreateMemory(parsed.userId, type, context)),
  );
  return results.filter((m): m is CompanionMemory => m !== null);
}

export async function getCompanionMemories(
  userId: string,
): Promise<CompanionMemory[]> {
  return repository.getMemories(userId);
}

function getEligibleMemoryTypes(
  input: CheckSessionMemoriesInput,
): CompanionMemoryType[] {
  const types: CompanionMemoryType[] = [];
  if (input.sessionCount === 1) {
    types.push('first_session');
  }
  if (input.grade === 'S') {
    types.push('first_s_grade');
  }
  if (input.streakDay === 7) {
    types.push('first_7_day_streak');
  }
  if (input.streakDay === 30) {
    types.push('first_30_day_streak');
  }
  if (
    input.session.sessionMode === SessionMode.DEEP_WORK &&
    input.session.actualDuration >= 2700
  ) {
    types.push('first_deep_work');
  }
  if (
    input.session.sessionMode === SessionMode.SPRINT &&
    input.session.focusPurityScore === 100
  ) {
    types.push('first_clean_sprint');
  }
  if (input.isPersonalBest && input.sessionCount > 3) {
    types.push('personal_best_broken');
  }
  return types;
}

function buildMemoryContext(input: CheckSessionMemoriesInput): MemoryContext {
  return {
    grade: input.grade,
    purityScore: input.session.focusPurityScore ?? null,
    sessionDate: new Date(input.session.createdAt).toISOString().slice(0, 10),
    sessionId: input.session.sessionId,
    streakDay: input.streakDay,
  };
}

function buildMemoryBody(
  type: CompanionMemoryType,
  context: MemoryContext,
): string {
  const purity =
    context.purityScore === null
      ? null
      : `${Math.round(context.purityScore)}% purity`;
  const gradeText = `grade ${context.grade}`;
  if (type === 'first_session') {
    return `You finished your first session on ${context.sessionDate} with ${gradeText}. This is where the record begins.`;
  }
  if (type === 'first_s_grade') {
    return purity
      ? `You reached ${gradeText} with ${purity}. Your companion kept the clean finish.`
      : `You reached ${gradeText}. Your companion kept the clean finish.`;
  }
  if (type === 'first_7_day_streak' || type === 'first_30_day_streak') {
    return `Day ${context.streakDay} landed with ${gradeText}. The chain has real proof behind it.`;
  }
  if (type === 'personal_best_broken') {
    return purity
      ? `You moved a saved mark to ${purity}. Your ceiling changed because this session proved it.`
      : 'You moved a saved mark. Your ceiling changed because this session proved it.';
  }
  return COMPANION_MEMORY_COPY[type].body;
}
