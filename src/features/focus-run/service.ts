import { FocusRunDisplaySchema, FocusRunSchema, type FocusRun, type FocusRunDisplay, type FocusRunEventType, type PersonalBoss } from './schemas';
import { getStoredFocusRun, upsertStoredFocusRun } from './repository';
import type { Lane } from '../lane-engine/types';

const BOSS_COPY: Record<PersonalBoss['archetype'], Pick<PersonalBoss, 'name' | 'recoveryPrompt'>> = {
  cold_start_shadow: { name: 'Cold Start Shadow', recoveryPrompt: 'Start one small encounter before judging the day.' },
  deadline_wraith: { name: 'Deadline Wraith', recoveryPrompt: 'Pick the nearest deadline action and make it visible.' },
  doomscroll_hydra: { name: 'Doomscroll Hydra', recoveryPrompt: 'Put the feed away and restart with five clean minutes.' },
  fog_of_unclear_work: { name: 'Fog of Unclear Work', recoveryPrompt: 'Rewrite the task until the first move is obvious.' },
  late_start_shade: { name: 'Late Start Shade', recoveryPrompt: 'Use a short start window before the day drifts.' },
  perfectionism_wall: { name: 'Perfectionism Wall', recoveryPrompt: 'Ship one rough move instead of polishing the plan.' },
  switch_swarm: { name: 'Switch Swarm', recoveryPrompt: 'Close competing contexts and protect one thread.' },
};

function weekStart(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.getTime();
}

export async function startFocusRun(userId: string, now = Date.now()): Promise<FocusRun> {
  const existing = await getStoredFocusRun(userId);
  if (existing && existing.status === 'active' && existing.weekStartsAt === weekStart(now)) return existing;
  return upsertStoredFocusRun(FocusRunSchema.parse({
    events: [{ id: `${userId}:${now}:start`, occurredAt: now, signal: null, type: 'run_started' }],
    id: `${userId}:${weekStart(now)}`,
    status: 'active',
    userId,
    weekStartsAt: weekStart(now),
  }));
}

export async function recordFocusRunEvent(input: {
  eventType: FocusRunEventType;
  signal?: string | null;
  userId: string;
  now?: number;
}): Promise<FocusRun> {
  const now = input.now ?? Date.now();
  const run = await startFocusRun(input.userId, now);
  return upsertStoredFocusRun(FocusRunSchema.parse({
    ...run,
    events: [...run.events, { id: `${run.id}:${now}:${input.eventType}`, occurredAt: now, signal: input.signal ?? null, type: input.eventType }],
    status: input.eventType === 'run_completed' ? 'completed' : run.status,
  }));
}

export function resolvePersonalBoss(signals: string[]): PersonalBoss {
  const joined = signals.join(' ').toLowerCase();
  const archetype = joined.includes('deadline') ? 'deadline_wraith'
    : joined.includes('switch') ? 'switch_swarm'
      : joined.includes('late') ? 'late_start_shade'
        : joined.includes('unclear') ? 'fog_of_unclear_work'
          : joined.includes('perfect') ? 'perfectionism_wall'
            : joined.includes('scroll') || joined.includes('distraction') ? 'doomscroll_hydra'
              : 'cold_start_shadow';
  const evidenceCount = signals.length;
  return { archetype, evidenceCount, isTeaser: evidenceCount < 2, ...BOSS_COPY[archetype] };
}

export function buildFocusRunDisplay(input: {
  lane: Lane;
  run: FocusRun | null;
  signals?: string[];
}): FocusRunDisplay {
  const laneAllowed = input.lane === 'game_like';
  const events = input.run?.events ?? [];
  const boss = resolvePersonalBoss(input.signals ?? events.map((event) => event.signal ?? '').filter(Boolean));
  return FocusRunDisplaySchema.parse({
    body: events.length === 0 ? 'Begin with one honest encounter. Nothing is bought, saved, or boosted.' : `${events.length} run signals logged from real sessions.`,
    boss,
    laneAllowed,
    modifiers: ['Phone away', 'One tab', 'Reflection upgrade'],
    nextAction: boss.isTeaser ? 'Start first encounter' : `Face ${boss.name}`,
    title: laneAllowed ? 'Weekly Focus Run' : 'Run board hidden for this lane',
  });
}
