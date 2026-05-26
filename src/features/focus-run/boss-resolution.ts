import type { BossArchetype, PersonalBoss } from './schemas';

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
// Evidence-based boss resolution
// ---------------------------------------------------------------------------

const MIN_EVIDENCE_DAYS = 3;

function weekStart(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.getTime();
}

function daysSinceFirstSession(firstActiveDay: number, now: number): number {
  const msPerDay = 86_400_000;
  return Math.floor((weekStart(now) - firstActiveDay) / msPerDay);
}

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

  /** Must cite evidence when boss is evidence-based */
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
