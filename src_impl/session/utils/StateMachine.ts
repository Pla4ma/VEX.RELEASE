import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:stateMachine');

export class StateMachine<TContext> {
  private config: StateMachineConfig<TContext>;
  private currentState: State;
  private context: TContext;
  private history: TransitionRecord[] = [];
  private isTransitioning = false;
  private abortController: AbortController | null = null;

  constructor(config: StateMachineConfig<TContext>) {
    this.config = config;
    this.currentState = config.initial;
    this.context = { ...config.context };
    debug.info(
      'State machine "%s" initialized in state "%s"',
      config.id,
      config.initial,
    );
  }

  async send(event: Event, payload?: unknown): Promise<boolean> {
    if (this.isTransitioning) {
      debug.warn('State machine busy, queuing event: %s', event);
      setTimeout(() => this.send(event, payload), 0);
      return false;
    }

    this.isTransitioning = true;
    this.abortController = new AbortController();
    const startTime = Date.now();

    try {
      const fromState = this.currentState;
      const stateConfig = this.config.states[fromState];
      const transition = this.findTransition(stateConfig, event);

      if (!transition) {
        debug.warn(
          'No transition found for event "%s" in state "%s"',
          event,
          fromState,
        );
        this.isTransitioning = false;
        return false;
      }

      const transitions = Array.isArray(transition)
        ? transition
        : [transition];

      for (const t of transitions) {
        if (t.guard) {
          const guardResult = await this.evaluateGuard(t.guard, payload);
          if (!guardResult) {continue;}
        }
        await this.executeTransition(t, payload, startTime);
        return true;
      }

      debug.warn('All transitions guarded out for event "%s"', event);
      return false;
    } catch (error) {
      debug.error(
        'Transition failed: %s',
        error instanceof Error ? error : new Error(String(error)),
      );
      this.isTransitioning = false;
      return false;
    } finally {
      this.abortController = null;
    }
  }

  private findTransition(
    stateConfig: StateConfig<TContext> | undefined,
    event: Event,
  ): Transition<TContext> | Transition<TContext>[] | undefined {
    if (!stateConfig || !stateConfig.on) {return undefined;}
    return stateConfig.on[event];
  }

  private async executeTransition(
    transition: Transition<TContext>,
    payload: unknown,
    startTime: number,
  ): Promise<void> {
    const fromState = this.currentState;
    const toState = transition.target;

    if (!this.isValidTransition(fromState, toState)) {
      throw new Error(`Invalid transition: ${fromState} -> ${toState}`);
    }

    const exitActions = this.config.states[fromState]?.exit;
    const entryActions = this.config.states[toState]?.entry;

    await this.executeActions(exitActions, payload);

    if (this.abortController?.signal.aborted) {
      throw new Error('Transition aborted');
    }

    this.currentState = toState;
    await this.executeActions(transition.actions, payload);
    await this.executeActions(entryActions, payload);

    const duration = Date.now() - startTime;
    this.history.push({
      from: fromState,
      to: toState,
      event: 'transition',
      timestamp: Date.now(),
      duration,
      payload,
    });
    debug.info('Transition: %s -> %s (%dms)', fromState, toState, duration);
  }

  private async evaluateGuard(
    guard: GuardFunction<TContext>,
    payload: unknown,
  ): Promise<boolean> {
    try {
      const result = guard(this.context, payload);
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error) {
      debug.error(
        'Guard evaluation failed: %s',
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  private async executeActions(
    actions: ActionFunction<TContext>[] | undefined,
    payload?: unknown,
  ): Promise<void> {
    if (!actions) {return;}
    for (const action of actions) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Transition aborted');
      }
      try {
        await action(this.context, payload);
      } catch (error) {
        debug.error(
          'Action execution failed: %s',
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    }
  }

  private isValidTransition(from: State, to: State): boolean {
    if (!this.config.states[to]) {
      debug.error(
        'Target state does not exist',
        new Error(`State: ${to}`),
      );
      return false;
    }
    return true;
  }
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
    storageStatus: 'HEALTHY',
    networkStatus: 'ONLINE',
  };

  return new StateMachine({
    id: `session-${sessionId}`,
    initial: 'IDLE',
    context: initialContext,
    states: {
      IDLE: {
        on: {
          CREATE: {
            target: 'CREATING',
            actions: [() => debug.debug('Creating session...')],
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
          CREATE_SUCCESS: { target: 'PREPARING' },
          CREATE_FAILURE: {
            target: 'ERROR',
            actions: [
              (ctx, payload) => {
                ctx.lastError = payload as Error;
                ctx.errorCount++;
              },
            ],
          },
          RETRY: { target: 'CREATING', guard: (ctx) => ctx.errorCount < 3 },
        },
      },
      PREPARING: {
        entry: [() => debug.info('Session preparing - waiting for start')],
        on: {
          START: { target: 'STARTING' },
          ABORT: { target: 'ABANDONED' },
          TIMEOUT: { target: 'ERROR' },
        },
      },
      STARTING: {
        entry: [
          (ctx) => {
            ctx.startTime = Date.now();
            return undefined;
          },
          () => debug.info('Session starting...'),
        ],
        on: {
          COUNTDOWN_COMPLETE: { target: 'ACTIVE' },
          CANCEL: { target: 'ABANDONED' },
          ERROR: { target: 'ERROR' },
        },
      },
      ACTIVE: {
        entry: [() => debug.info('Session now active')],
        on: {
          PAUSE: { target: 'PAUSED' },
          BACKGROUND: { target: 'BACKGROUNDED' },
          INTERRUPTION: {
            target: 'INTERRUPTION_RISK',
            actions: [
              (ctx) => {
                ctx.interruptions++;
                return undefined;
              },
            ],
          },
          DEGRADED_MODE: { target: 'DEGRADED' },
          COMPLETE: { target: 'COMPLETING' },
          FAIL: { target: 'FAILED' },
          ABORT: { target: 'ABANDONED' },
        },
      },
      PAUSED: {
        entry: [() => debug.info('Session paused')],
        on: {
          RESUME: { target: 'ACTIVE' },
          ABORT: { target: 'ABANDONED' },
          TIMEOUT: { target: 'FAILED' },
        },
      },
      BACKGROUNDED: {
        entry: [() => debug.info('Session backgrounded')],
        on: {
          FOREGROUND: { target: 'ACTIVE' },
          AUTO_PAUSE: { target: 'PAUSED' },
          ABORT: { target: 'ABANDONED' },
          TIMEOUT: { target: 'FAILED' },
        },
      },
      INTERRUPTION_RISK: {
        entry: [() => debug.warn('Interruption risk detected')],
        on: {
          RESUME: { target: 'ACTIVE' },
          CONFIRM_PAUSE: { target: 'PAUSED' },
          CONFIRM_ABANDON: { target: 'ABANDONED' },
          AUTO_RECOVER: { target: 'RECOVERING' },
        },
      },
      DEGRADED: {
        entry: [
          (ctx) => {
            ctx.storageStatus = 'DEGRADED';
          },
          () => debug.warn('Session in degraded mode'),
        ],
        on: {
          RESTORE: { target: 'ACTIVE' },
          CONTINUE_DEGRADED: { target: 'DEGRADED' },
          FAIL: { target: 'FAILED' },
        },
      },
      COMPLETING: {
        entry: [() => debug.info('Completing session...')],
        on: {
          VALIDATION_PASS: { target: 'SYNCING' },
          VALIDATION_FAIL: { target: 'FAILED' },
          TIMEOUT: { target: 'FAILED' },
        },
      },
      SYNCING: {
        entry: [
          (ctx) => {
            ctx.syncAttempts++;
            return undefined;
          },
          () => debug.info('Syncing session data...'),
        ],
        on: {
          SYNC_SUCCESS: { target: 'COMPLETED' },
          SYNC_FAIL: [
            {
              target: 'SYNCING',
              guard: (ctx) => ctx.syncAttempts < 3,
              actions: [() => debug.warn('Sync failed, retrying...')],
            },
            { target: 'FAILED' },
          ],
          OFFLINE: { target: 'PENDING_SYNC' },
        },
      },
      PENDING_SYNC: {
        entry: [() => debug.info('Session complete, pending sync')],
        on: {
          ONLINE: { target: 'SYNCING' },
          FORCE_COMPLETE: { target: 'COMPLETED' },
        },
      },
      COMPLETED: {
        entry: [() => debug.info('Session completed successfully')],
        on: {
          CLOSE: { target: 'CLOSED' },
        },
      },
      RECOVERING: {
        entry: [
          (ctx) => {
            ctx.recoveryAttempts++;
            return undefined;
          },
          () => debug.info('Attempting recovery...'),
        ],
        on: {
          RECOVERY_SUCCESS: [
            { target: 'ACTIVE', guard: (ctx) => ctx.recoveryAttempts <= 3 },
            { target: 'PARTIAL_COMPLETE' },
          ],
          RECOVERY_FAIL: [
            { target: 'RECOVERING', guard: (ctx) => ctx.recoveryAttempts < 3 },
            { target: 'FAILED' },
          ],
          ABORT: { target: 'ABANDONED' },
        },
      },
      PARTIAL_COMPLETE: {
        entry: [() => debug.info('Session partially completed')],
        on: {
          GRANT_PARTIAL: { target: 'COMPLETED' },
          DENY_PARTIAL: { target: 'FAILED' },
        },
      },
      ABANDONED: {
        entry: [() => debug.warn('Session abandoned')],
        on: {
          CLOSE: { target: 'CLOSED' },
        },
      },
      FAILED: {
        entry: [
          (ctx, payload) => {
            ctx.lastError = payload as Error;
            ctx.canRecover = false;
          },
          () => debug.error('Session failed'),
        ],
        on: {
          RETRY: [
            {
              target: 'RECOVERING',
              guard: (ctx) => ctx.canRecover && ctx.recoveryAttempts < 3,
            },
            { target: 'ERROR' },
          ],
          CLOSE: { target: 'CLOSED' },
        },
      },
      ERROR: {
        entry: [() => debug.error('Session in error state')],
        on: {
          RESET: { target: 'IDLE' },
          FORCE_CLOSE: { target: 'CLOSED' },
        },
      },
      CLOSED: {
        entry: [() => debug.info('Session closed')],
        on: {
          RESTART: { target: 'CREATING' },
        },
      },
    },
  });
}

export * from "./StateMachine.types";
