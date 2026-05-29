import type { Lane } from "../../lane-engine/types";
import { InsightFindingSchema } from "../schemas";
import type { InsightFinding, WeeklyInsightInput, WeeklyIntelligence } from "../schemas";

export function buildWhatHelped(input: WeeklyInsightInput): InsightFinding[] {
  const findings: InsightFinding[] = [];
  if (input.completedSessions >= 3) {
    findings.push(
      InsightFindingSchema.parse({
        category: "helped",
        observation: `Consistent rhythm: completed ${input.completedSessions} of ${input.totalSessions} sessions this week.`,
        confidence: input.completedSessions >= 5 ? "medium" : "weak",
      }),
    );
  }
  if (input.avgFocusScore && input.avgFocusScore >= 70) {
    findings.push(
      InsightFindingSchema.parse({
        category: "helped",
        observation: `Strong focus: average focus quality was ${Math.round(input.avgFocusScore)}%.`,
        confidence: input.totalSessions >= 5 ? "medium" : "weak",
      }),
    );
  }
  if (input.cleanStarts && input.cleanStarts >= 2) {
    findings.push(
      InsightFindingSchema.parse({
        category: "helped",
        observation: `Clean starts: ${input.cleanStarts} sessions started without friction.`,
        confidence: "weak",
      }),
    );
  }
  if (input.rescueCompleted >= 1) {
    findings.push(
      InsightFindingSchema.parse({
        category: "helped",
        observation: `Return resilience: completed ${input.rescueCompleted} recovery ${input.rescueCompleted === 1 ? "session" : "sessions"}.`,
        confidence: input.rescueCompleted >= 2 ? "medium" : "weak",
      }),
    );
  }
  if (input.bestDurationMinutes >= 25) {
    findings.push(
      InsightFindingSchema.parse({
        category: "helped",
        observation: `Best session was ${input.bestDurationMinutes} minutes — solid depth.`,
        confidence: "weak",
      }),
    );
  }
  return findings.slice(0, 3);
}

export function buildWhatGotInWay(input: WeeklyInsightInput): InsightFinding[] {
  const findings: InsightFinding[] = [];
  if (input.totalSessions > input.completedSessions) {
    const missed = input.totalSessions - input.completedSessions;
    findings.push(
      InsightFindingSchema.parse({
        category: "blocked",
        observation: `${missed} session${missed === 1 ? "" : "s"} not completed this week.`,
        confidence: missed >= 3 ? "medium" : "weak",
      }),
    );
  }
  if (input.interruptionsAvg && input.interruptionsAvg >= 3) {
    findings.push(
      InsightFindingSchema.parse({
        category: "blocked",
        observation: `Interruptions: averaged ${Math.round(input.interruptionsAvg)} per session.`,
        confidence: "weak",
      }),
    );
  }
  if (input.staleThreadDays && input.staleThreadDays >= 3) {
    findings.push(
      InsightFindingSchema.parse({
        category: "blocked",
        observation: `Project thread was stale for ${input.staleThreadDays} days.`,
        confidence: "medium",
      }),
    );
  }
  if (input.nudgeDismissals && input.nudgeDismissals >= 2) {
    findings.push(
      InsightFindingSchema.parse({
        category: "blocked",
        observation: `Dismissed ${input.nudgeDismissals} nudges this week — VEX will stay quieter.`,
        confidence: "weak",
      }),
    );
  }
  // Behavior-based: repeated short sessions < 15 min
  if (input.avgDurationMinutes < 15 && input.completedSessions >= 3) {
    findings.push(
      InsightFindingSchema.parse({
        category: "blocked",
        observation: `Average session was ${Math.round(input.avgDurationMinutes)} minutes — sessions under 15 minutes may limit depth.`,
        confidence: input.completedSessions >= 5 ? "medium" : "weak",
      }),
    );
  }
  return findings.slice(0, 3);
}

export function resolveBestNextSessionType(
  input: WeeklyInsightInput,
): WeeklyIntelligence["bestNextSessionType"] {
  const { lane } = input;
  if (lane === "student") {
    return input.avgDurationMinutes >= 20 ? "STUDY" : "REVIEW";
  }
  if (lane === "game_like") {
    return input.cleanStarts && input.cleanStarts >= 3 ? "SPRINT" : "RECOVERY";
  }
  if (lane === "deep_creative") {
    return input.avgDurationMinutes >= 25 ? "DEEP_WORK" : "LIGHT_FOCUS";
  }
  return "LIGHT_FOCUS";
}

export function buildAdjustment(input: WeeklyInsightInput): string {
  const { lane } = input;
  if (lane === "student") {
    if (input.weakTopics && input.weakTopics.length > 0) {
      return `Try reviewing "${input.weakTopics[0]}" in your next short block before tackling new material.`;
    }
    if (input.avgDurationMinutes < 15 && input.completedSessions >= 3) {
      return "Your sessions averaged under 15 minutes this week. Try one 20-minute study block — sessions under 15 may limit depth.";
    }
    return "Pick one topic per session. Naming the topic first correlates with cleaner starts.";
  }
  if (lane === "game_like") {
    if (input.blockerPattern) {
      return `"${input.blockerPattern}" appears to be a pattern. Consider a deliberate recovery run to break it.`;
    }
    if (input.recoveryWins && input.recoveryWins >= 1) {
      return "Recovery runs work for you. Keep using them when momentum feels heavy.";
    }
    if (input.avgDurationMinutes < 20 && input.completedSessions >= 3) {
      return "Your runs average under 20 minutes. One focused sprint might build momentum.";
    }
    return "A short warm-up before your main run may help clean starts.";
  }
  if (lane === "deep_creative") {
    if (input.staleThreadDays && input.staleThreadDays >= 2) {
      return "Name the next concrete move before you close a project session. This reduces stale-thread risk.";
    }
    return "Open your session by naming one concrete next move. Clarity at entry predicts follow-through.";
  }
  if (lane === "minimal_normal") {
    if (input.nudgeDismissals && input.nudgeDismissals >= 2) {
      return "VEX will stay quieter this week. One block per day, no extra nudges.";
    }
    if (input.avgDurationMinutes < 20 && input.completedSessions >= 3) {
      return "Your sessions averaged under 20 minutes this week. That rhythm might work for you — keep it consistent.";
    }
    return `Your best window seemed to be ${input.bestTimeWindow ?? "when you started"}. Try the same window this week.`;
  }
  return "Keep going. VEX needs more data to suggest adjustments.";
}

export function buildPremiumDeeperInsight(input: WeeklyInsightInput): string | undefined {
  const map: Record<Lane, string> = {
    student:
      "Unlock topic-level gap analysis: see exactly which concepts are weak and get an adaptive review schedule that closes them before your next exam.",
    game_like:
      "Unlock run-level analytics: see your blocker patterns, optimal warm-up timing, and recovery win rate across every run this week.",
    deep_creative:
      "Unlock project thread analytics: see your next-move prediction accuracy, stale-thread risk timeline, and deep work continuity score.",
    minimal_normal:
      "Unlock rhythm optimization: see your best time windows, nudge sensitivity, and an adaptive schedule that protects your cleanest blocks.",
  };
  return map[input.lane];
}
