import { TimerEngine } from '../engines/TimerEngine';
import { createDebugger } from '../../utils/debug';
import { pauseSession } from './SessionLifecycle';

const debug = createDebugger('session:orchestrator:timer');

import type { SessionOrchestratorBase } from '../SessionOrchestratorBase';

export function handleTimerTick(
  orch: SessionOrchestratorBase,
  elapsed: number,
  remaining: number,
  percentage: number,
): void {
  if (!orch.session) {return;}
  if (orch.config.enableAntiCheat) {
    const v = orch.antiCheatEngine.validateTick(elapsed, Date.now());
    if (!v.valid) {
      orch.handleAntiCheatViolation(v.warning || 'Invalid tick');
      return;
    }
  }
  orch.session.elapsedTime = elapsed;
  orch.session.remainingTime = remaining;
  orch.session.completionPercentage = percentage;
  orch.session.effectiveTime = elapsed - (orch.session.pausedTime || 0);
  const effDur = orch.session.config.duration * 1000;
  const ivProg = (elapsed % effDur) / effDur;
  const curIv = Math.floor(elapsed / effDur) + 1;
  if (curIv > (orch.session.currentInterval || 0)) {
    orch.session.intervalsCompleted =
      (orch.session.intervalsCompleted || 0) + 1;
    orch.session.currentInterval = curIv;
    orch.eventEmitter.emitIntervalCompleted(
      curIv,
      orch.session.totalIntervals || 0,
    );
  }
  orch.session.isDirty = true;
  orch.session.updatedAt = Date.now();
  if (Math.floor(elapsed / 1000) % 5 === 0) {orch.saveSessionState();}
  orch.eventEmitter.emitTick(
    elapsed,
    remaining,
    percentage,
    orch.session.phase,
  );
  orch.eventEmitter.emitProgress(
    orch.session.phase,
    curIv,
    ivProg * 100,
    remaining,
  );
}

export function handleTimerWarning(
  orch: SessionOrchestratorBase,
  sec: number,
): void {
  if (!orch.session) {return;}
  orch.eventEmitter.emitNotification(
    'TIME_WARNING',
    'Time Running Out',
    `${sec} seconds remaining`,
    'normal',
    { secondsRemaining: sec },
  );
}

export async function startBreak(orch: SessionOrchestratorBase): Promise<void> {
  if (!orch.session) {return;}
  const isLong =
    (orch.session.currentInterval || 0) %
      orch.session.config.longBreakInterval ===
    0;
  const bDur = isLong
    ? orch.session.config.longBreakDuration * 1000
    : orch.session.config.breakDuration * 1000;
  const prev = orch.session.phase;
  orch.session.phase = isLong ? 'LONG_BREAK' : 'SHORT_BREAK';
  orch.session.updatedAt = Date.now();
  orch.eventEmitter.emitPhaseChanged(prev, orch.session.phase);
  orch.timerEngine?.destroy();
  orch.timerEngine = new TimerEngine(
    orch.session.id,
    Math.floor(bDur / 1000),
    orch.config.timerConfig || {},
    {
      onTick: (_e: number, _r: number, _p: number) => {
        handleBreakTick(orch, _e);
      },
      onComplete: () => {
        orch.handleBreakComplete();
      },
      onWarning: (s: number) => {
        handleTimerWarning(orch, s);
      },
    },
  );
  orch.timerEngine.start();
  orch.eventEmitter.emitNotification(
    'BREAK_STARTING',
    isLong ? 'Long Break' : 'Short Break',
    'Take a break to recharge',
    'normal',
  );
  debug.info(
    'Break started: %s (%s, %dms)',
    orch.session.id,
    orch.session.phase,
    bDur,
  );
}

export function handleBreakTick(
  orch: SessionOrchestratorBase,
  elapsed: number,
): void {
  if (!orch.session) {return;}
  orch.session.elapsedTime = (orch.session.elapsedTime || 0) + elapsed;
  orch.session.updatedAt = Date.now();
}

export async function handleBreakComplete(
  orch: SessionOrchestratorBase,
): Promise<void> {
  if (!orch.session) {return;}
  const prev = orch.session.phase;
  orch.session.phase = 'FOCUS';
  orch.session.updatedAt = Date.now();
  orch.eventEmitter.emitPhaseChanged(prev, orch.session.phase);
  orch.timerEngine?.destroy();
  restartFocusTimer(orch);
  orch.timerEngine?.start(); // ponytail: asserted non-null by restartFocusTimer above
  if (!orch.session.config.autoStartNextInterval) {
    await pauseSession(orch, 'break_complete');
  }
  debug.info('Break complete: %s', orch.session.id);
}

export function endBreak(orch: SessionOrchestratorBase): void {
  if (!orch.session) {return;}
  const prev = orch.session.phase;
  orch.session.phase = 'FOCUS';
  orch.session.updatedAt = Date.now();
  orch.eventEmitter.emitPhaseChanged(prev, orch.session.phase);
  orch.timerEngine?.destroy();
  restartFocusTimer(orch);
  orch.timerEngine?.start(); // ponytail: asserted non-null by restartFocusTimer above
  debug.info('Break ended: %s', orch.session.id);
}

function restartFocusTimer(orch: SessionOrchestratorBase): void {
  orch.timerEngine = new TimerEngine(
    orch.session?.id ?? '',
    Math.floor((orch.session?.config.duration ?? 0) * 1000),
    orch.config.timerConfig || {},
    {
      onTick: orch.handleTimerTick.bind(orch),
      onComplete: orch.handleTimerComplete.bind(orch),
      onWarning: orch.handleTimerWarning.bind(orch),
    },
  );
}
