import type { Lane } from '../lane-engine/types';
import type { ModeCompletionSurface } from './schemas';

// ── Evidence-backed completion surface ──────────────────────────────────

export const EVIDENCE_COMPLETION_COPY: Record<
  Lane,
  Omit<ModeCompletionSurface, 'lane'>
> = {
  student: {
    headline: 'Study block done',
    body: 'You studied {topic}. Tap below to flag what needs review.',
    primaryActionLabel: 'Mark what needs review',
    secondaryHint: 'Next: recall key ideas before they fade',
    insightLabel: 'VEX tracked your weak spots for next block',
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  game_like: {
    headline: 'Run complete',
    body: 'You moved through {task}. Momentum recorded.',
    primaryActionLabel: 'Done',
    secondaryHint: 'Next run: same time tomorrow builds the pattern',
    insightLabel: 'Clean starts are your strongest signal',
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  deep_creative: {
    headline: 'Project block complete',
    body: 'Next move saved for {project}. Thread is intact.',
    primaryActionLabel: 'Save handoff note',
    secondaryHint: 'Stale risk: low — next move is clear',
    insightLabel: 'Project continuity: maintained',
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  minimal_normal: {
    headline: 'Done',
    body: '{action} — complete.',
    primaryActionLabel: 'Close',
    secondaryHint: 'Tomorrow: one clean action, same time',
    insightLabel: null,
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
};

// ── Cold-start completion surface ───────────────────────────────────────

export const COLD_START_COMPLETION_COPY: Record<
  Lane,
  Omit<ModeCompletionSurface, 'lane'>
> = {
  student: {
    headline: 'Study block done',
    body: 'You studied {topic}. Tap below to flag what needs review.',
    primaryActionLabel: 'Mark what needs review',
    secondaryHint: 'Next: name one topic for the next block',
    insightLabel: null,
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  game_like: {
    headline: 'Run complete',
    body: 'You moved through {task}. Session recorded.',
    primaryActionLabel: 'Done',
    secondaryHint: 'Same time tomorrow helps VEX find your rhythm',
    insightLabel: null,
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  deep_creative: {
    headline: 'Project block complete',
    body: 'Block finished for {project}. Save a handoff note to pick up later.',
    primaryActionLabel: 'Save handoff note',
    secondaryHint: 'Save your next move before closing',
    insightLabel: null,
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  minimal_normal: {
    headline: 'Done',
    body: '{action} — complete.',
    primaryActionLabel: 'Close',
    secondaryHint: 'Tomorrow: one clean action, same time',
    insightLabel: null,
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
};

// ── Backward compat ─────────────────────────────────────────────────────

/** @deprecated — use EVIDENCE_COMPLETION_COPY or COLD_START_COMPLETION_COPY */
export const COMPLETION_COPY = EVIDENCE_COMPLETION_COPY;
