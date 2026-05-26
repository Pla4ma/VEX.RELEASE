import {
  FocusRunDisplaySchema,
  FocusRunGradeSchema,
  FocusRunSchema,
  type FocusRun,
  type FocusRunDisplay,
  type FocusRunEventType,
  type FocusRunGrade,
} from './schemas';
import { getStoredFocusRun, upsertStoredFocusRun } from './repository';
import { resolvePersonalBoss } from './boss-resolution';
import type { Lane } from '../lane-engine/types';

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
      bossId: null,
      cleanStarts: 0,
      completedEncounters: 0,
      events: [
        {
          id: `${userId}:${now}:start`,
          occurredAt: now,
          signal: null,
          type: 'run_started',
        },
      ],
      finalGrade: null,
      id: `${userId}:${ws}`,
      modifiers: ['Phone away', 'One tab', 'Reflection upgrade'],
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

  if (input.eventType === 'encounter_completed') {
    updates.completedEncounters = (run.completedEncounters ?? 0) + 1;
  }
  if (input.eventType === 'clean_start') {
    updates.cleanStarts = (run.cleanStarts ?? 0) + 1;
  }
  if (input.eventType === 'rescue_win') {
    updates.recoveryWins = (run.recoveryWins ?? 0) + 1;
  }
  if (input.eventType === 'reflection_upgrade') {
    updates.reflectionUpgrades = (run.reflectionUpgrades ?? 0) + 1;
  }
  if (input.eventType === 'run_completed') {
    updates.status = 'completed';
  }

  return upsertStoredFocusRun(
    FocusRunSchema.parse({ ...run, ...updates }),
  );
}

// ---------------------------------------------------------------------------
// Grade computation
// ---------------------------------------------------------------------------

export function computeFocusRunGrade(run: FocusRun): FocusRunGrade {
  const encounters = run.completedEncounters ?? 0;
  const cleanStarts = run.cleanStarts ?? 0;
  const recoveryWins = run.recoveryWins ?? 0;
  const upgrades = run.reflectionUpgrades ?? 0;

  if (encounters === 0) return 'D';

  const score =
    encounters * 2 +
    cleanStarts * 1.5 +
    recoveryWins * 1 +
    upgrades * 0.5;

  if (score >= 20) return 'S';
  if (score >= 14) return 'A';
  if (score >= 8) return 'B';
  if (score >= 4) return 'C';
  return 'D';
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

export function buildFocusRunDisplay(input: {
  lane: Lane;
  run: FocusRun | null;
  signals?: string[];
  firstActiveDay?: number;
}): FocusRunDisplay {
  const laneAllowed = input.lane === 'game_like';
  const run = input.run;
  const events = run?.events ?? [];

  const allSignals = input.signals ?? events
    .map((event) => event.signal ?? '')
    .filter(Boolean);

  const boss = resolvePersonalBoss({
    firstActiveDay: input.firstActiveDay ?? 0,
    signals: allSignals,
  });

  const completedEncounters = run?.completedEncounters ?? 0;
  const cleanStarts = run?.cleanStarts ?? 0;
  const recoveryWins = run?.recoveryWins ?? 0;
  const reflectionUpgrades = run?.reflectionUpgrades ?? 0;
  const finalGrade = run?.finalGrade
    ? FocusRunGradeSchema.parse(run.finalGrade)
    : run?.status === 'completed'
      ? computeFocusRunGrade(run)
      : null;

  const summaryParts: string[] = [];
  if (completedEncounters > 0) {
    summaryParts.push(`${completedEncounters} encounter${completedEncounters === 1 ? '' : 's'}`);
  }
  if (cleanStarts > 0) {
    summaryParts.push(`${cleanStarts} clean start${cleanStarts === 1 ? '' : 's'}`);
  }
  if (recoveryWins > 0) {
    summaryParts.push(`${recoveryWins} recovery win${recoveryWins === 1 ? '' : 's'}`);
  }
  const weekSummary =
    summaryParts.length > 0
      ? summaryParts.join(' · ')
      : 'No encounters yet this week.';

  return FocusRunDisplaySchema.parse({
    body:
      events.length === 0
        ? 'Begin with one honest encounter. Nothing is bought, saved, or boosted.'
        : `${events.length} run signals logged from real sessions.`,
    boss,
    cleanStarts,
    completedEncounters,
    finalGrade,
    laneAllowed,
    modifiers: run?.modifiers ?? ['Phone away', 'One tab', 'Reflection upgrade'],
    nextAction: boss.isTeaser ? 'Start first encounter' : `Face ${boss.name}`,
    recoveryWins,
    reflectionUpgrades,
    title: laneAllowed ? 'Weekly Focus Run' : 'Run board hidden for this lane',
    weekSummary,
  });
}
