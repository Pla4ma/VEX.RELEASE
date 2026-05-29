import type { Lane } from "../lane-engine/types";
import type {
  ModeActiveIndicator,
  ModeCompletionSurface,
  ModeRescueSurface,
  ModeWeeklyIntelligence,
} from "./schemas";

// ── Active session indicator copy ──────────────────────────────────────

export const ACTIVE_INDICATOR_COPY: Record<
  Lane,
  Omit<ModeActiveIndicator, "lane">
> = {
  student: {
    targetLabel: "Studying",
    topLine: "Stay focused on the material",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: true,
    density: "medium",
    quiet: true,
  },
  game_like: {
    targetLabel: "Momentum",
    topLine: "Clean start — keep moving forward",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: false,
    density: "medium",
    quiet: true,
  },
  deep_creative: {
    targetLabel: "Protecting",
    topLine: "Next move in progress — thread protected",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: true,
    density: "medium",
    quiet: true,
  },
  minimal_normal: {
    targetLabel: "One action",
    topLine: "In progress",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: false,
    density: "low",
    quiet: true,
  },
};

// ── Completion surface copy ────────────────────────────────────────────

export const COMPLETION_COPY: Record<
  Lane,
  Omit<ModeCompletionSurface, "lane">
> = {
  student: {
    headline: "Study block done",
    body: 'You studied {topic}. Tap below to flag what needs review.',
    primaryActionLabel: "Mark what needs review",
    secondaryHint: "Next: recall key ideas before they fade",
    insightLabel: "VEX tracked your weak spots for next block",
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  game_like: {
    headline: "Run complete",
    body: "You moved through {task}. Momentum recorded.",
    primaryActionLabel: "Done",
    secondaryHint: "Next run: same time tomorrow builds the pattern",
    insightLabel: "Clean starts are your strongest signal",
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  deep_creative: {
    headline: "Project block complete",
    body: "Next move saved for {project}. Thread is intact.",
    primaryActionLabel: "Save handoff note",
    secondaryHint: "Stale risk: low — next move is clear",
    insightLabel: "Project continuity: maintained",
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
  minimal_normal: {
    headline: "Done",
    body: "{action} — complete.",
    primaryActionLabel: "Close",
    secondaryHint: "Tomorrow: one clean action, same time",
    insightLabel: null,
    showRewards: false,
    showStreak: false,
    showXp: false,
  },
};

// ── Rescue surface copy ────────────────────────────────────────────────

export const RESCUE_COPY: Record<Lane, Omit<ModeRescueSurface, "lane">> = {
  student: {
    headline: "Review one weak section for 8 minutes",
    body: "Just open your notes. One section. No quiz, no pressure. VEX will suggest what to review.",
    suggestedDurationMinutes: 8,
    actionLabel: "Start review",
  },
  game_like: {
    headline: "Recovery run: 10 clean minutes",
    body: "No blockers. No targets. Just 10 minutes of clean focus. Momentum resets after.",
    suggestedDurationMinutes: 10,
    actionLabel: "Start recovery run",
  },
  deep_creative: {
    headline: "Re-enter the project and find the next move",
    body: "Just open the project. Find one next move. That's all. VEX saves the thread.",
    suggestedDurationMinutes: 7,
    actionLabel: "Re-enter project",
  },
  minimal_normal: {
    headline: "Do 5 minutes. Stop cleanly.",
    body: "One action. Five minutes. That's a win. VEX won't ask for more.",
    suggestedDurationMinutes: 5,
    actionLabel: "Start",
  },
};

// ── Weekly intelligence copy ───────────────────────────────────────────

export const WEEKLY_INTELLIGENCE_COPY: Record<
  Lane,
  Omit<ModeWeeklyIntelligence, "lane">
> = {
  student: {
    headline: "Study week in review",
    body: "Your study rhythm is forming. Here's what worked and what to adjust.",
    primaryMetric: "Review consistency",
    primaryMetricValue: "{completedSessions} of {totalSessions} blocks held",
    adjustment:
      "Start by naming the topic — your strongest blocks have a clear focus.",
    nextSessionType: "Study block",
  },
  game_like: {
    headline: "Momentum week in review",
    body: "Your focus patterns are becoming clear.",
    primaryMetric: "Clean starts",
    primaryMetricValue: "{cleanStarts} clean starts this week",
    adjustment:
      "Recovery runs break blocker patterns. Use them when momentum dips.",
    nextSessionType: "Clean run",
  },
  deep_creative: {
    headline: "Project week in review",
    body: "Your deep work threads tell a story.",
    primaryMetric: "Project continuity",
    primaryMetricValue:
      "{completedSessions} of {totalSessions} blocks held",
    adjustment:
      "Name the next move before closing — stale threads break continuity.",
    nextSessionType: "Project block",
  },
  minimal_normal: {
    headline: "Clean week in review",
    body: "Simple. Quiet. Effective.",
    primaryMetric: "Best focus window",
    primaryMetricValue:
      "Your best sessions were {duration}-minute quiet blocks",
    adjustment: "Same window this week. No extra nudges unless you ask.",
    nextSessionType: "Clean session",
  },
};