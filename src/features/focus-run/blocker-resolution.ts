import type { BlockerArchetype, PersonalBlocker } from "./schemas";

// ---------------------------------------------------------------------------
// Blocker copy (productivity language, not game language)
// ---------------------------------------------------------------------------

const BLOCKER_COPY: Record<
  BlockerArchetype,
  Pick<PersonalBlocker, "name" | "recoveryPrompt">
> = {
  blank_start: {
    name: "The Blank Page",
    recoveryPrompt: "Start one small run before judging the day.",
  },
  deadline_pressure: {
    name: "Deadline Pressure",
    recoveryPrompt: "Pick the nearest deadline action and make it visible.",
  },
  distraction_loop: {
    name: "The Distraction Loop",
    recoveryPrompt: "Put feeds away and restart with five clean minutes.",
  },
  unclear_scope: {
    name: "Unclear Scope",
    recoveryPrompt: "Rewrite the task until the first move is obvious.",
  },
  delayed_start: {
    name: "The Delayed Start",
    recoveryPrompt: "Use a short start window before the day drifts.",
  },
  over_prep: {
    name: "The Over-Prep Trap",
    recoveryPrompt: "Ship one rough move instead of polishing the plan.",
  },
  context_switching: {
    name: "Context Switching",
    recoveryPrompt: "Close competing contexts and protect one thread.",
  },
  avoidant_pattern: {
    name: "The Avoidance Pattern",
    recoveryPrompt:
      "Start the work for just two minutes and let momentum pull you in.",
  },
};

// ---------------------------------------------------------------------------
// Evidence-based blocker resolution
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

function detectArchetype(joined: string): BlockerArchetype {
  if (joined.includes("deadline")) return "deadline_pressure";
  if (joined.includes("switch") || joined.includes("context"))
    return "context_switching";
  if (joined.includes("late") || joined.includes("delay"))
    return "delayed_start";
  if (joined.includes("unclear") || joined.includes("fog"))
    return "unclear_scope";
  if (joined.includes("perfect") || joined.includes("overprep"))
    return "over_prep";
  if (joined.includes("scroll") || joined.includes("distraction"))
    return "distraction_loop";
  if (joined.includes("avoid") || joined.includes("procrastinat"))
    return "avoidant_pattern";
  return "blank_start";
}

export function resolvePersonalBlocker(input: {
  signals: string[];
  firstActiveDay: number;
  now?: number;
}): PersonalBlocker {
  const now = input.now ?? Date.now();
  const signals = input.signals.filter(Boolean);
  const evidenceCount = signals.length;
  const observedDays = daysSinceFirstSession(input.firstActiveDay, now);

  const hasEnoughDays = observedDays >= MIN_EVIDENCE_DAYS;
  const isTeaser = !hasEnoughDays || evidenceCount < 2;
  const isEvidenceBased = hasEnoughDays && evidenceCount >= 2;

  if (evidenceCount === 0) {
    const fallback = BLOCKER_COPY.blank_start;
    return {
      archetype: "blank_start",
      evidenceCount: 0,
      isEvidenceBased: false,
      isTeaser: true,
      name: fallback.name,
      observedDays,
      recoveryPrompt: fallback.recoveryPrompt,
    };
  }

  const joined = signals.join(" ").toLowerCase();
  const archetype = detectArchetype(joined);
  const copy = BLOCKER_COPY[archetype];

  /** Must cite evidence when blocker is evidence-based */
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