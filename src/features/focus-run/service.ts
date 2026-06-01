import {
  FocusRunSchema,
  type FocusRun,
  type FocusRunEventType,
} from './schemas';
import { getStoredFocusRun, upsertStoredFocusRun } from './repository';

export { buildFocusRunDisplay, computeFocusRunGrade } from './display';
export { resolvePersonalBlocker } from './blocker-resolution';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function weekStart(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.getTime();
}

// ---------------------------------------------------------------------------
// Start / record events
// ---------------------------------------------------------------------------

export async function startFocusRun(
  userId: string,
  now = Date.now(),
): Promise<FocusRun> {
  const existing = await getStoredFocusRun(userId);
  if (
    existing &&
    existing.status === 'active' &&
    existing.weekStartsAt === weekStart(now)
  ) {
    return existing;
  }
  const ws = weekStart(now);
  return upsertStoredFocusRun(
    FocusRunSchema.parse({
      blockerId: null,
      cleanStarts: 0,
      completedRuns: 0,
      events: [
        {
          id: `${userId}:${now}:start`,
          occurredAt: now,
          signal: null,
          type: 'run_started',
        },
      ],
      finalGrade: null,
      focusModifiers: ['Phone away', 'One tab', 'Reflection upgrade'],
      id: `${userId}:${ws}`,
      recoveryWins: 0,
      reflectionUpgrades: 0,
      status: 'active',
      userId,
      weekStartsAt: ws,
    }),
  );
}

export async function recordFocusRunEvent(input: {
  eventType: FocusRunEventType;
  signal?: string | null;
  userId: string;
  now?: number;
}): Promise<FocusRun> {
  const now = input.now ?? Date.now();
  const run = await startFocusRun(input.userId, now);

  const updatedEvents = [
    ...run.events,
    {
      id: `${run.id}:${now}:${input.eventType}`,
      occurredAt: now,
      signal: input.signal ?? null,
      type: input.eventType,
    },
  ];

  const updates: Partial<FocusRun> = { events: updatedEvents };

  if (input.eventType === 'run_milestone') {
    updates.completedRuns = (run.completedRuns ?? 0) + 1;
  }
  if (input.eventType === 'clean_start') {
    updates.cleanStarts = (run.cleanStarts ?? 0) + 1;
  }
  if (input.eventType === 'recovery_win') {
    updates.recoveryWins = (run.recoveryWins ?? 0) + 1;
  }
  if (input.eventType === 'reflection_upgrade') {
    updates.reflectionUpgrades = (run.reflectionUpgrades ?? 0) + 1;
  }
  if (input.eventType === 'run_completed') {
    updates.status = 'completed';
  }

  return upsertStoredFocusRun(FocusRunSchema.parse({ ...run, ...updates }));
}


