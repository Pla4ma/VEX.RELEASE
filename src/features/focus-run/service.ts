import {
  BossArchetypeSchema,
  FocusRunDisplaySchema,
  FocusRunGradeSchema,
  FocusRunSchema,
  type BossArchetype,
  type FocusRun,
  type FocusRunDisplay,
  type FocusRunEventType,
  type FocusRunGrade,
  type PersonalBoss,
} from './schemas';
import { getStoredFocusRun, upsertStoredFocusRun } from './repository';
import type { Lane } from '../lane-engine/types';

// ---------------------------------------------------------------------------
// Boss copy
// ---------------------------------------------------------------------------

const BOSS_COPY: Record<BossArchetype, Pick<PersonalBoss, 'name' | 'recoveryPrompt'>> = {
  cold_start_shadow: {
    name: 'Cold Start Shadow',
    recoveryPrompt: 'Start one small encounter before judging the day.',
  },
  deadline_wraith: {
    name: 'Deadline Wraith',
    recoveryPrompt: 'Pick the nearest deadline action and make it visible.',
  },
  doomscroll_hydra: {
    name: 'Doomscroll Hydra',
    recoveryPrompt: 'Put the feed away and restart with five clean minutes.',
  },
  fog_of_unclear_work: {
    name: 'Fog of Unclear Work',
    recoveryPrompt: 'Rewrite the task until the first move is obvious.',
  },
  late_start_shade: {
    name: 'Late Start Shade',
    recoveryPrompt: 'Use a short start window before the day drifts.',
  },
  perfectionism_wall: {
    name: 'Perfectionism Wall',
    recoveryPrompt: 'Ship one rough move instead of polishing the plan.',
  },
  switch_swarm: {
    name: 'Switch Swarm',
    recoveryPrompt: 'Close competing contexts and protect one thread.',
  },
  task_avoidance: {
    name: 'Task Avoidance Wraith',
    recoveryPrompt: 'Start the work for just two minutes and let momentum pull you in.',
  },
};

// ---------------------------------------------------------------------------
// Helper: week start (Sunday midnight)
// ---------------------------------------------------------------------------

function weekStart(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.getTime();
}

// ---------------------------------------------------------------------------
// Helper: how many weekdays have elapsed since user first active day
// ---------------------------------------------------------------------------

function daysSinceFirstSession(firstActiveDay: number, now: number): number {
  const msPerDay = 86_400_000;
  return Math.floor((weekStart(now) - firstActiveDay) / msPerDay);
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
// Personal boss resolution — behavior-evidence-based
// ---------------------------------------------------------------------------

const MIN_EVIDENCE_DAYS = 3;

function detectArchetype(joined: string): BossArchetype {
  if (joined.includes('deadline')) return 'deadline_wraith';
  if (joined.includes('switch') || joined.includes('context')) return 'switch_swarm';
  if (joined.includes('late') || joined.includes('delay')) return 'late_start_shade';
  if (joined.includes('unclear') || joined.includes('fog')) return 'fog_of_unclear_work';
  if (joined.includes('perfect') || joined.includes('overprep')) return 'perfectionism_wall';
  if (joined.includes('scroll') || joined.includes('distraction')) return 'doomscroll_hydra';
  if (joined.includes('avoid') || joined.includes('procrastinat')) return 'task_avoidance';
  return 'cold_start_shadow';
}

export function resolvePersonalBoss(input: {
  signals: string[];
  firstActiveDay: number;
  now?: number;
}): PersonalBoss {
  const now = input.now ?? Date.now();
  const signals = input.signals.filter(Boolean);
  const evidenceCount = signals.length;
  const observedDays = daysSinceFirstSession(input.firstActiveDay, now);

  const hasEnoughDays = observedDays >= MIN_EVIDENCE_DAYS;
  const isTeaser = !hasEnoughDays || evidenceCount < 2;
  const isEvidenceBased = hasEnoughDays && evidenceCount >= 2;

  if (evidenceCount === 0) {
    const fallback = BOSS_COPY.cold_start_shadow;
    return {
      archetype: 'cold_start_shadow',
      evidenceCount: 0,
      isEvidenceBased: false,
      isTeaser: true,
      name: fallback.name,
      observedDays,
      recoveryPrompt: fallback.recoveryPrompt,
    };
  }

  const joined = signals.join(' ').toLowerCase();
  const archetype = detectArchetype(joined);
  const copy = BOSS_COPY[archetype];

  return {
    archetype,
    evidenceCount,
    isEvidenceBased,
    isTeaser,
    name: copy.name,
    observedDays,
    recoveryPrompt: copy.recoveryPrompt,
  };
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
