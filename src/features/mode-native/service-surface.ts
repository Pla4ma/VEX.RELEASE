import { LaneSchema } from "../lane-engine/schemas";
import type { Lane } from "../lane-engine/types";
import {
  COMPLETION_COPY,
  COLD_START_COMPLETION_COPY,
  EVIDENCE_COMPLETION_COPY,
  WEEKLY_INTELLIGENCE_COPY,
  EVIDENCE_WEEKLY_INTELLIGENCE_COPY,
  COLD_START_WEEKLY_INTELLIGENCE_COPY,
} from "./copy";
import {
  ModeCompletionSurfaceSchema,
  ModeWeeklyIntelligenceSchema,
} from "./schemas";
import type {
  ModeCompletionSurface,
  ModeWeeklyIntelligence,
} from "./schemas";

// ── Helpers ────────────────────────────────────────────────────────────

function resolveLane(raw: unknown): Lane {
  const parsed = LaneSchema.safeParse(raw);
  return parsed.success ? parsed.data : "minimal_normal";
}

function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    String(values[key] ?? `{${key}}`),
  );
}

// ── Completion Surface ─────────────────────────────────────────────────

export interface CompletionContext {
  laneOverride?: Lane | null;
  topic?: string;
  task?: string;
  project?: string;
  action?: string;
  weakTopicCount?: number;
  cleanStarts?: number;
  blockerDetected?: boolean;
  recoveryWin?: boolean;
  handoffSaved?: boolean;
  staleRisk?: "none" | "low" | "medium" | "high";
  keepSameSetup?: boolean;
  /** Number of completed sessions — used to gate evidence-backed copy */
  completedSessions?: number;
}

export function deriveCompletionSurface(
  context: CompletionContext,
): ModeCompletionSurface {
  const lane = resolveLane(context.laneOverride);
  const hasEvidence = (context.completedSessions ?? 0) >= 3;

  const base = hasEvidence
    ? EVIDENCE_COMPLETION_COPY[lane]
    : COLD_START_COMPLETION_COPY[lane];

  const body = fillTemplate(base.body, {
    topic: context.topic ?? "your material",
    task: context.task ?? "your task",
    project: context.project ?? "your project",
    action: context.action ?? "your action",
  });

  let enrichedBody = body;
  let enrichedInsight = base.insightLabel;

  // Only apply evidence-backed enrichment when enough history exists
  if (hasEvidence) {
    if (
      lane === "student" &&
      context.weakTopicCount !== undefined &&
      context.weakTopicCount > 0
    ) {
      enrichedBody = `${body} ${context.weakTopicCount} topic${context.weakTopicCount === 1 ? "" : "s"} may need review.`;
      enrichedInsight = `VEX found ${context.weakTopicCount} weak ${context.weakTopicCount === 1 ? "area" : "areas"}`;
    }

    if (lane === "game_like") {
      const parts: string[] = [];
      if (context.cleanStarts !== undefined && context.cleanStarts > 0) {
        parts.push(`${context.cleanStarts} clean start${context.cleanStarts === 1 ? "" : "s"} confirmed`);
      }
      if (context.blockerDetected) {
        parts.push("blocker signal saved");
      }
      if (context.recoveryWin) {
        parts.push("recovery win");
      }
      if (parts.length > 0) {
        enrichedBody = `${body} ${parts.join(" · ")}.`;
      }
      enrichedInsight = context.blockerDetected
        ? "Blocker patterns tracked for next run"
        : context.recoveryWin
          ? "Recovery runs build durable momentum"
          : "Clean starts are your strongest pattern";
    }

    if (lane === "deep_creative") {
      if (context.handoffSaved) {
        enrichedBody = `${body} Handoff note saved.`;
        enrichedInsight = "Next move is locked for tomorrow";
      }
      if (context.staleRisk && context.staleRisk !== "none") {
        enrichedBody = `${enrichedBody} Thread at ${context.staleRisk} risk of going stale — protect it soon.`;
      }
    }
  }

  return ModeCompletionSurfaceSchema.parse({
    ...base,
    lane,
    body: enrichedBody,
    insightLabel: enrichedInsight,
  });
}

// ── Weekly Intelligence ────────────────────────────────────────────────

export interface WeeklyIntelligenceContext {
  laneOverride?: Lane | null;
  completedSessions?: number;
  totalSessions?: number;
  cleanStarts?: number;
  duration?: number;
  reviewItemsDue?: number;
  blockerPatternsFound?: number;
  activeProjects?: number;
  staleProjects?: number;
}

export function deriveWeeklyIntelligence(
  context: WeeklyIntelligenceContext,
): ModeWeeklyIntelligence {
  const lane = resolveLane(context.laneOverride);
  const hasEvidence =
    (context.completedSessions ?? 0) >= 3 &&
    (context.totalSessions ?? 0) >= 5;

  const base = hasEvidence
    ? EVIDENCE_WEEKLY_INTELLIGENCE_COPY[lane]
    : COLD_START_WEEKLY_INTELLIGENCE_COPY[lane];

  const primaryMetricValue = fillTemplate(base.primaryMetricValue, {
    completedSessions: context.completedSessions ?? 0,
    totalSessions: context.totalSessions ?? 0,
    cleanStarts: context.cleanStarts ?? 0,
    duration: context.duration ?? 15,
  });

  let adjustment = base.adjustment;

  // Only apply evidence-backed enrichment when enough history exists
  if (hasEvidence) {
    if (
      lane === "student" &&
      context.reviewItemsDue !== undefined &&
      context.reviewItemsDue > 0
    ) {
      adjustment = `${context.reviewItemsDue} review item${context.reviewItemsDue === 1 ? "" : "s"} waiting. ${adjustment}`;
    }

    if (
      lane === "game_like" &&
      context.blockerPatternsFound !== undefined &&
      context.blockerPatternsFound > 0
    ) {
      adjustment = `${context.blockerPatternsFound} blocker pattern${context.blockerPatternsFound === 1 ? "" : "s"} surfaced. ${adjustment}`;
    }

    if (
      lane === "deep_creative" &&
      context.staleProjects !== undefined &&
      context.activeProjects !== undefined
    ) {
      if (context.staleProjects > 0) {
        adjustment = `${context.staleProjects} project${context.staleProjects === 1 ? "" : "s"} went stale. ${adjustment}`;
      } else if (context.activeProjects > 0) {
        adjustment = `${context.activeProjects} active project${context.activeProjects === 1 ? "" : "s"}. Continuity is holding. ${adjustment}`;
      }
    }
  }

  return ModeWeeklyIntelligenceSchema.parse({
    ...base,
    lane,
    primaryMetricValue,
    adjustment,
  });
}
