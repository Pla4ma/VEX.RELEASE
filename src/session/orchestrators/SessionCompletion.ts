import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session:orchestrator:completion");

import type { SessionOrchestrator } from "../SessionOrchestrator";

export async function completeSessionInternal(orch: SessionOrchestrator): Promise<void> {
  if (!orch.session) return;
  orch.isActive = false;
  if (orch.config.enableAntiCheat) {
    const v = orch.antiCheatEngine.validateSession(orch.session);
    if (!v.valid) {
      orch.session.antiCheatStatus = "FLAGGED";
      orch.session.antiCheatFlags = v.flags.map((f) => f.type);
      orch.antiCheatEngine.applyActions();
      const a = orch.antiCheatEngine.takeAction();
      if (a.shouldInvalidate) {
        await failSession(orch, "Anti-cheat validation failed", false);
        return;
      }
    }
  }
  orch.focusMetrics = orch.scoringEngine.calculateFocusQuality(
    orch.session,
    orch.interruptions.map((i) => ({
      duration: i.duration || 0,
      severity: i.severity,
      autoRecovered: i.autoRecovered,
    })),
  );
  const result = orch.completionEngine.completeSession(
    orch.session, orch.focusMetrics, 0, undefined, undefined, undefined,
  );
  if (!result.success) throw new Error("Session completion failed");
  orch.session.status = result.summary.status;
  orch.lastSessionSummary = result.summary;
  await orch.finalizeSession(result.summary);
  orch.eventEmitter.emitSessionCompleted(result.summary);
  debug.info("Session completed: %s, Score: %d", orch.session.id, result.summary.finalScore);
}

async function failSession(
  orch: SessionOrchestrator,
  error: string,
  canRecover: boolean = true,
): Promise<void> {
  if (!orch.session) return;
  orch.isActive = false;
  const result = orch.completionEngine.failSession(orch.session, error, canRecover);
  orch.session.status = "FAILED";
  orch.session.damagePoints = result.damage.totalDamage;
  orch.eventEmitter.emitSessionFailed(error, canRecover);
  if (canRecover && result.canRecover) {
    orch.session.status = "RECOVERING";
    await orch.saveSessionState();
  } else {
    await orch.finalizeAbandonedSession();
  }
  debug.error("Session failed: %s (error: %s)", new Error(error), orch.session.id);
}

export async function abandonSession(
  orch: SessionOrchestrator,
  reason?: string,
): Promise<void> {
  if (!orch.session) throw new Error("No active session");
  orch.isActive = false;
  const elapsed = orch.session.elapsedTime;
  const result = orch.completionEngine.abandonSession(orch.session, reason);
  orch.session.damagePoints = result.damage.totalDamage;
  orch.session.penaltyMultiplier = result.damage.finalPenalty;
  orch.eventEmitter.emitSessionAbandoned(Date.now(), reason, elapsed);
  if (result.damage.totalDamage > 0) {
    orch.eventEmitter.emitDamageTaken(result.damage.totalDamage, reason || "Session abandoned");
  }
  await orch.finalizeAbandonedSession();
  debug.warn("Session abandoned: %s (reason: %s)", orch.session.id, reason || "none");
}
