import type { CompanionPromise, CompletedSessionPromiseInput } from './types';

export const MinimumPromiseMinutes = 5;

const dateKeyFormatterCache = new Map<string, Intl.DateTimeFormat>();
function getDateKeyFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = dateKeyFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    });
    dateKeyFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function toDateKey(timestamp: number, timeZone: string): string {
  const parts = getDateKeyFormatter(timeZone).formatToParts(new Date(timestamp));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function mapSessionModeToTargetMode(
  sessionMode: string,
): CompanionPromise['targetMode'] {
  if (sessionMode === 'RECOVERY') {
    return 'RECOVERY';
  }
  if (sessionMode === 'STUDY') {
    return 'STUDY';
  }
  if (sessionMode === 'CHALLENGE') {
    return 'BOSS_PREP';
  }
  if (sessionMode === 'CREATIVE') {
    return 'HABIT_BUILD';
  }
  return 'FOCUS';
}

export function buildNextPromiseInput(
  input: CompletedSessionPromiseInput,
  timeZone: string,
) {
  const targetDate = toDateKey(
    input.completedAt + 24 * 60 * 60 * 1000,
    timeZone,
  );
  return {
    createdAt: new Date(input.completedAt).toISOString(),
    sourceSessionId: input.sessionId,
    targetDate,
    targetDurationMinutes: Math.max(
      MinimumPromiseMinutes,
      Math.round(input.durationMinutes),
    ),
    targetMode: mapSessionModeToTargetMode(input.sessionMode),
    userId: input.userId,
  };
}

export function isMatchOrBetter(
  input: CompletedSessionPromiseInput,
  promise: CompanionPromise,
  timeZone: string,
): boolean {
  const completedDate = toDateKey(input.completedAt, timeZone);
  return (
    completedDate === promise.targetDate &&
    input.durationMinutes >= promise.targetDurationMinutes &&
    mapSessionModeToTargetMode(input.sessionMode) === promise.targetMode
  );
}
