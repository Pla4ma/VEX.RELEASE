import { eventBus } from "../../events";
import { capture } from "../../shared/analytics/analytics-service";
import { SessionEvents } from "../../shared/analytics/analytics-events";
import { getOrchestratorHandlesCompletion } from "./SessionAnalytics";
import { subscribeErrorEventListeners } from "./session-analytics-listener-helpers";

type TrackFunction = (
  eventName: string,
  properties: Record<string, unknown>,
) => void;

export function setupAnalyticsEventListeners(
  userId: string,
  track: TrackFunction,
): void {
  eventBus.subscribe("session:created", (data) => {
    if (!data) {
      return;
    }
    track("session_created", {
      sessionId: data.sessionId,
      userId: data.userId,
      config: data.config,
      timestamp: data.timestamp,
    });
  });

  eventBus.subscribe("session:started", (data) => {
    if (!data) {
      return;
    }
    capture(SessionEvents.SESSION_STARTED, {
      session_id: data.sessionId,
      user_id: userId,
      session_type: "focus",
      started_at: data.startedAt,
    });
    track("session_started", {
      sessionId: data.sessionId,
      startedAt: data.startedAt,
      phase: data.phase,
    });
  });

  eventBus.subscribe("session:completed", (data) => {
    if (!data) {
      return;
    }
    if (getOrchestratorHandlesCompletion()) {
      return;
    }
    const summary =
      data.summary && typeof data.summary === "object"
        ? (data.summary as Record<string, unknown>)
        : {};
    const durationSeconds =
      data.duration ||
      (typeof summary.effectiveDuration === "number"
        ? summary.effectiveDuration
        : 0);
    const completionPercentage =
      typeof summary.completionPercentage === "number"
        ? summary.completionPercentage
        : 100;
    const xpEarned =
      typeof summary.xpEarned === "number" ? summary.xpEarned : 0;
    const coinsEarned =
      typeof summary.coinsEarned === "number" ? summary.coinsEarned : 0;
    capture(SessionEvents.SESSION_COMPLETED, {
      session_id: data.sessionId,
      user_id: data.userId,
      duration_seconds: durationSeconds,
      completion_percentage: completionPercentage,
      session_type: "focus",
      xp_earned: xpEarned,
      coins_earned: coinsEarned,
    });
    track("session_completed", {
      sessionId: data.sessionId,
      userId: data.userId,
      summary: data.summary,
      duration: data.duration,
    });
  });

  eventBus.subscribe("session:abandoned", (data) => {
    if (!data) {
      return;
    }
    const elapsedSeconds = data.elapsedTime || 0;
    const totalDuration = 0;
    const completionPercentage =
      totalDuration > 0
        ? Math.round((elapsedSeconds / totalDuration) * 100)
        : 0;
    capture(SessionEvents.SESSION_ABANDONED, {
      session_id: data.sessionId,
      user_id: data.userId,
      reason: data.reason || "unknown",
      elapsed_seconds: elapsedSeconds,
      completion_percentage: completionPercentage,
      purity_score: 0,
    });
    track("session_abandoned", {
      sessionId: data.sessionId,
      userId: data.userId,
      reason: data.reason,
      elapsedTime: data.elapsedTime,
      abandonedAt: data.abandonedAt,
    });
  });

  eventBus.subscribe("session:interruption", (data) => {
    if (!data) {
      return;
    }
    track("session_interrupted", {
      sessionId: data.sessionId,
      userId: data.userId,
      interruption: data.interruption,
    });
  });

  eventBus.subscribe("session:recovery:successful", (data) => {
    if (!data) {
      return;
    }
    track("session_recovered", {
      sessionId: data.sessionId,
      userId: data.userId,
      recoveredAt: data.recoveredAt,
      recoveredTime: data.recoveredTime,
    });
  });

  eventBus.subscribe("session:anticheat:flag", (data) => {
    if (!data) {
      return;
    }
    track("anti_cheat_flag", {
      sessionId: data.sessionId,
      userId: data.userId,
      flag: data.flag,
    });
  });

  eventBus.subscribe("session:phase:changed", (data) => {
    if (!data) {
      return;
    }
    track("phase_transition", {
      sessionId: data.sessionId,
      previousPhase: data.previousPhase,
      newPhase: data.newPhase,
      timestamp: data.timestamp,
    });
  });

  eventBus.subscribe("session:tick", (data) => {
    if (!data) {
      return;
    }
    track("session_tick", {
      sessionId: data.sessionId,
      elapsed: data.elapsed,
      remaining: data.remaining,
      percentage: data.percentage,
      phase: data.phase,
    });
  });

  eventBus.subscribe("session:rewards:granted", (data) => {
    if (!data) {
      return;
    }
    track("rewards_earned", {
      sessionId: data.sessionId,
      userId: data.userId,
      rewards: data.rewards,
      timestamp: data.timestamp,
    });
  });

  subscribeErrorEventListeners(track);
}
