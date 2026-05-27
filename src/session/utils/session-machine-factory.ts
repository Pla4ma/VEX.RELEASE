import { createDebugger } from "../../utils/debug";
import type {
  StateMachineConfig,
  StateConfig,
  SessionMachineContext,
} from "./state-machine-types";
import { StateMachine } from "./StateMachine";
import { createAdvancedStates } from "./session-machine-states";

const debug = createDebugger("session:stateMachine");

function createCoreStates(
  sessionId: string,
  userId: string,
): Record<string, StateConfig<SessionMachineContext>> {
  return {
    IDLE: {
      on: {
        CREATE: {
          target: "CREATING",
          actions: [() => debug.debug("Creating session...")],
        },
      },
    },
    CREATING: {
      entry: [
        (ctx) => {
          ctx.sessionId = sessionId;
          ctx.userId = userId;
        },
      ],
      on: {
        CREATE_SUCCESS: { target: "PREPARING" },
        CREATE_FAILURE: {
          target: "ERROR",
          actions: [
            (ctx, payload) => {
              ctx.lastError = payload as Error;
              ctx.errorCount++;
            },
          ],
        },
        RETRY: { target: "CREATING", guard: (ctx) => ctx.errorCount < 3 },
      },
    },
    PREPARING: {
      entry: [() => debug.info("Session preparing - waiting for start")],
      on: {
        START: { target: "STARTING" },
        ABORT: { target: "ABANDONED" },
        TIMEOUT: { target: "ERROR" },
      },
    },
    STARTING: {
      entry: [
        (ctx) => {
          ctx.startTime = Date.now();
          return undefined;
        },
        () => debug.info("Session starting..."),
      ],
      on: {
        COUNTDOWN_COMPLETE: { target: "ACTIVE" },
        CANCEL: { target: "ABANDONED" },
        ERROR: { target: "ERROR" },
      },
    },
    ACTIVE: {
      entry: [() => debug.info("Session now active")],
      on: {
        PAUSE: { target: "PAUSED" },
        BACKGROUND: { target: "BACKGROUNDED" },
        INTERRUPTION: {
          target: "INTERRUPTION_RISK",
          actions: [
            (ctx) => {
              ctx.interruptions++;
              return undefined;
            },
          ],
        },
        DEGRADED_MODE: { target: "DEGRADED" },
        COMPLETE: { target: "COMPLETING" },
        FAIL: { target: "FAILED" },
        ABORT: { target: "ABANDONED" },
      },
    },
    PAUSED: {
      entry: [() => debug.info("Session paused")],
      on: {
        RESUME: { target: "ACTIVE" },
        ABORT: { target: "ABANDONED" },
        TIMEOUT: { target: "FAILED" },
      },
    },
    BACKGROUNDED: {
      entry: [() => debug.info("Session backgrounded")],
      on: {
        FOREGROUND: { target: "ACTIVE" },
        AUTO_PAUSE: { target: "PAUSED" },
        ABORT: { target: "ABANDONED" },
        TIMEOUT: { target: "FAILED" },
      },
    },
  };
}

export function createSessionStateMachine(
  sessionId: string,
  userId: string,
): StateMachine<SessionMachineContext> {
  const initialContext: SessionMachineContext = {
    sessionId,
    userId,
    startTime: null,
    pausedDuration: 0,
    interruptions: 0,
    errorCount: 0,
    lastError: null,
    canRecover: true,
    recoveryAttempts: 0,
    syncAttempts: 0,
    storageStatus: "HEALTHY",
    networkStatus: "ONLINE",
  };
  const config: StateMachineConfig<SessionMachineContext> = {
    id: `session-${sessionId}`,
    initial: "IDLE",
    context: initialContext,
    states: {
      ...createCoreStates(sessionId, userId),
      ...createAdvancedStates(),
    },
  };
  return new StateMachine(config);
}
