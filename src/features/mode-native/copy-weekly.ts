import type { Lane } from "../lane-engine/types";
import type { ModeWeeklyIntelligence } from "./schemas";

// ── Evidence-backed weekly intelligence ─────────────────────────────────

export const EVIDENCE_WEEKLY_INTELLIGENCE_COPY: Record<
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
    primaryMetric: "Sessions completed",
    primaryMetricValue:
      "{completedSessions} of {totalSessions} sessions this week",
    adjustment: "Same window this week. No extra nudges unless you ask.",
    nextSessionType: "Clean session",
  },
};

// ── Cold-start weekly intelligence ──────────────────────────────────────

export const COLD_START_WEEKLY_INTELLIGENCE_COPY: Record<
  Lane,
  Omit<ModeWeeklyIntelligence, "lane">
> = {
  student: {
    headline: "First week of study",
    body: "VEX is learning how you study best.",
    primaryMetric: "Sessions started",
    primaryMetricValue: "{completedSessions} blocks completed",
    adjustment:
      "Keep naming the topic before each block — it helps VEX find what matters.",
    nextSessionType: "Study block",
  },
  game_like: {
    headline: "First week of runs",
    body: "VEX is learning what keeps your momentum going.",
    primaryMetric: "Sessions started",
    primaryMetricValue: "{cleanStarts} clean starts this week",
    adjustment:
      "Start with a short warm-up. VEX is still learning your rhythm.",
    nextSessionType: "Clean run",
  },
  deep_creative: {
    headline: "First week of project work",
    body: "VEX is learning how you protect deep focus.",
    primaryMetric: "Sessions started",
    primaryMetricValue: "{completedSessions} blocks completed",
    adjustment:
      "Save a next move after each block so VEX can help you resume.",
    nextSessionType: "Project block",
  },
  minimal_normal: {
    headline: "First week of clean sessions",
    body: "VEX is learning your quiet rhythm.",
    primaryMetric: "Sessions started",
    primaryMetricValue:
      "{completedSessions} sessions this week",
    adjustment: "Keep it simple. VEX needs more sessions to suggest adjustments.",
    nextSessionType: "Clean session",
  },
};

// ── Backward compat ─────────────────────────────────────────────────────

/** @deprecated — use EVIDENCE_WEEKLY_INTELLIGENCE_COPY or COLD_START_WEEKLY_INTELLIGENCE_COPY */
export const WEEKLY_INTELLIGENCE_COPY = EVIDENCE_WEEKLY_INTELLIGENCE_COPY;
