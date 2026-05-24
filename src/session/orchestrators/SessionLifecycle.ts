import { TimerEngine } from "../engines/TimerEngine";
import type { SessionState } from "../types";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session:orchestrator:lifecycle");

import type { SessionOrchestrator } from "../SessionOrchestrator";

export async function startSession(
  orch: SessionOrchestrator,
  countdownSeconds: number = 0,
): Promise<SessionState> {
  if (!orch.session) throw new Error("No active session");
  orch.session.status = "STARTING";
  orch.countdownActive = true;
  orch.eventEmitter.emitSessionStarting(countdownSeconds);
  for (let i = countdownSeconds; i > 0; i--) {
    if (!orch.countdownActive) throw new Error("Session start cancelled");
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!orch.countdownActive) throw new Error("Session start cancelled");
  orch.countdownActive = false;
  orch.session.status = "ACTIVE";
  orch.session.phase = "FOCUS";
  orch.session.startedAt = Date.now();
  orch.session.updatedAt = Date.now();
  orch.timerEngine = new TimerEngine(
    orch.session.id,
    Math.floor((orch.session.remainingTime || 0) / 1000),
    orch.config.timerConfig || {},
    {
      onTick: orch.handleTimerTick.bind(orch),
      onComplete: orch.handleTimerComplete.bind(orch),
      onWarning: orch.handleTimerWarning.bind(orch),
    },
  );
  orch.timerEngine.start();
  orch.isActive = true;
  await orch.saveSessionState();
  orch.eventEmitter.emitSessionStarted(orch.session.phase);
  debug.info("Session started: %s", orch.session.id);
  const s = orch.getSession();
  if (!s) throw new Error("Failed to get session state");
  return s;
}

export async function pauseSession(
  orch: SessionOrchestrator,
  reason?: string,
): Promise<SessionState> {
  if (!orch.session || !orch.timerEngine) throw new Error("No active session");
  if (orch.session.status !== "ACTIVE") {
    const s = orch.getSession();
    if (!s) throw new Error("Failed to get session state");
    return s;
  }
  orch.session.status = "PAUSED";
  orch.session.pausedAt = Date.now();
  orch.session.pauses = (orch.session.pauses || 0) + 1;
  if (reason === "user") orch.antiCheatEngine.recordManualPause();
  orch.timerEngine.pause(reason);
  await orch.saveSessionState();
  orch.eventEmitter.emitSessionPaused(reason);
  orch.recordInterruption("USER_PAUSE", "MINOR");
  debug.info("Session paused: %s", orch.session.id);
  const s = orch.getSession();
  if (!s) throw new Error("Failed to get session state");
  return s;
}

export async function resumeSession(
  orch: SessionOrchestrator,
): Promise<SessionState> {
  if (!orch.session || !orch.timerEngine) throw new Error("No active session");
  if (orch.session.status !== "PAUSED") {
    const s = orch.getSession();
    if (!s) throw new Error("Failed to get session state");
    return s;
  }
  const now = Date.now();
  const pausedDuration = now - (orch.session.pausedAt || now);
  orch.session.status = "ACTIVE";
  orch.session.resumedAt = now;
  orch.session.pausedTime = (orch.session.pausedTime || 0) + pausedDuration;
  orch.session.updatedAt = now;
  orch.timerEngine.resume();
  orch.completeLastInterruption(pausedDuration);
  await orch.saveSessionState();
  orch.eventEmitter.emitSessionResumed(pausedDuration);
  debug.info("Session resumed: %s (paused %dms)", orch.session.id, pausedDuration);
  const s = orch.getSession();
  if (!s) throw new Error("Failed to get session state");
  return s;
}

export async function backgroundSession(orch: SessionOrchestrator): Promise<void> {
  if (!orch.session || !orch.timerEngine) return;
  orch.antiCheatEngine.recordBackgroundSwitch();
  orch.session.status = "BACKGROUNDED";
  orch.session.updatedAt = Date.now();
  orch.timerEngine.background();
  await orch.saveSessionState();
  orch.eventEmitter.emitBackgrounded(Date.now());
  if (orch.config.pauseOnBackground) {
    setTimeout(() => {
      if (orch.session?.status === "BACKGROUNDED") {
        void pauseSession(orch, "auto_background");
      }
    }, orch.config.pauseThreshold);
  }
  debug.info("Session backgrounded: %s", orch.session.id);
}

export async function foregroundSession(orch: SessionOrchestrator): Promise<void> {
  if (!orch.session || !orch.timerEngine) return;
  const fgAt = Date.now();
  const bgDuration = orch.timerEngine.foreground();
  orch.antiCheatEngine.recordSuspension(bgDuration);
  orch.session.backgroundTime = (orch.session.backgroundTime || 0) + bgDuration;
  orch.session.updatedAt = fgAt;
  if (orch.session.status === "BACKGROUNDED") orch.session.status = "ACTIVE";
  await orch.saveSessionState();
  orch.eventEmitter.emitForegrounded(fgAt, bgDuration);
  debug.info("Session foregrounded: %s (bg: %dms)", orch.session.id, bgDuration);
}
