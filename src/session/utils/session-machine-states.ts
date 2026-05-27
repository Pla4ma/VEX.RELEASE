import type { StateConfig, SessionMachineContext } from "./state-machine-types";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session:stateMachine");

export function createAdvancedStates(): Record<
  string,
  StateConfig<SessionMachineContext>
> {
  return {
    INTERRUPTION_RISK: {
      entry: [() => debug.warn("Interruption risk detected")],
      on: {
        RESUME: { target: "ACTIVE" },
        CONFIRM_PAUSE: { target: "PAUSED" },
        CONFIRM_ABANDON: { target: "ABANDONED" },
        AUTO_RECOVER: { target: "RECOVERING" },
      },
    },
    DEGRADED: {
      entry: [
        (ctx) => {
          ctx.storageStatus = "DEGRADED";
        },
        () => debug.warn("Session in degraded mode"),
      ],
      on: {
        RESTORE: { target: "ACTIVE" },
        CONTINUE_DEGRADED: { target: "DEGRADED" },
        FAIL: { target: "FAILED" },
      },
    },
    COMPLETING: {
      entry: [() => debug.info("Completing session...")],
      on: {
        VALIDATION_PASS: { target: "SYNCING" },
        VALIDATION_FAIL: { target: "FAILED" },
        TIMEOUT: { target: "FAILED" },
      },
    },
    SYNCING: {
      entry: [
        (ctx) => {
          ctx.syncAttempts++;
          return undefined;
        },
        () => debug.info("Syncing session data..."),
      ],
      on: {
        SYNC_SUCCESS: { target: "COMPLETED" },
        SYNC_FAIL: [
          {
            target: "SYNCING",
            guard: (ctx) => ctx.syncAttempts < 3,
            actions: [() => debug.warn("Sync failed, retrying...")],
          },
          { target: "FAILED" },
        ],
        OFFLINE: { target: "PENDING_SYNC" },
      },
    },
    PENDING_SYNC: {
      entry: [() => debug.info("Session complete, pending sync")],
      on: {
        ONLINE: { target: "SYNCING" },
        FORCE_COMPLETE: { target: "COMPLETED" },
      },
    },
    COMPLETED: {
      entry: [() => debug.info("Session completed successfully")],
      on: { CLOSE: { target: "CLOSED" } },
    },
    RECOVERING: {
      entry: [
        (ctx) => {
          ctx.recoveryAttempts++;
          return undefined;
        },
        () => debug.info("Attempting recovery..."),
      ],
      on: {
        RECOVERY_SUCCESS: [
          { target: "ACTIVE", guard: (ctx) => ctx.recoveryAttempts <= 3 },
          { target: "PARTIAL_COMPLETE" },
        ],
        RECOVERY_FAIL: [
          { target: "RECOVERING", guard: (ctx) => ctx.recoveryAttempts < 3 },
          { target: "FAILED" },
        ],
        ABORT: { target: "ABANDONED" },
      },
    },
    PARTIAL_COMPLETE: {
      entry: [() => debug.info("Session partially completed")],
      on: {
        GRANT_PARTIAL: { target: "COMPLETED" },
        DENY_PARTIAL: { target: "FAILED" },
      },
    },
    ABANDONED: {
      entry: [() => debug.warn("Session abandoned")],
      on: { CLOSE: { target: "CLOSED" } },
    },
    FAILED: {
      entry: [
        (ctx, payload) => {
          ctx.lastError = payload as Error;
          ctx.canRecover = false;
        },
        () => debug.error("Session failed"),
      ],
      on: {
        RETRY: [
          {
            target: "RECOVERING",
            guard: (ctx) => ctx.canRecover && ctx.recoveryAttempts < 3,
          },
          { target: "ERROR" },
        ],
        CLOSE: { target: "CLOSED" },
      },
    },
    ERROR: {
      entry: [() => debug.error("Session in error state")],
      on: { RESET: { target: "IDLE" }, FORCE_CLOSE: { target: "CLOSED" } },
    },
    CLOSED: {
      entry: [() => debug.info("Session closed")],
      on: { RESTART: { target: "CREATING" } },
    },
  };
}
