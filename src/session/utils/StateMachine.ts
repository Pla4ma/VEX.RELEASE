import { createDebugger } from "../../utils/debug";
import type {
  State,
  Event,
  GuardFunction,
  ActionFunction,
  Transition,
  StateConfig,
  StateMachineConfig,
  TransitionRecord,
} from "./state-machine-types";

const debug = createDebugger("session:stateMachine");

const MAX_QUEUE_DEPTH = 10;

interface QueuedEvent {
  event: Event;
  payload: unknown;
}

export class StateMachine<TContext> {
  private config: StateMachineConfig<TContext>;
  private currentState: State;
  private context: TContext;
  private history: TransitionRecord[] = [];
  private isTransitioning = false;
  private abortController: AbortController | null = null;
  private eventQueue: QueuedEvent[] = [];

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
      if (this.eventQueue.length >= MAX_QUEUE_DEPTH) {
        debug.warn("Event queue full (max %d), dropping event: %s", MAX_QUEUE_DEPTH, event);
        return false;
      }
      debug.warn("State machine busy, queuing event: %s", event);
      this.eventQueue.push({ event, payload });
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
        return false;
      }
      const transitions = Array.isArray(transition) ? transition : [transition];
      for (const t of transitions) {
        if (t.guard) {
          const guardResult = await this.evaluateGuard(t.guard, payload);
          if (!guardResult) {
            continue;
          }
        }
        await this.executeTransition(t, payload, startTime);
        return true;
      }
      debug.warn('All transitions guarded out for event "%s"', event);
      return false;
    } catch (error) {
      debug.error(
        "Transition failed: %s",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    } finally {
      this.isTransitioning = false;
      this.abortController = null;
      this.flushQueue();
    }
  }

  private findTransition(
    stateConfig: StateConfig<TContext> | undefined,
    event: Event,
  ): Transition<TContext> | Transition<TContext>[] | undefined {
    if (!stateConfig || !stateConfig.on) {
      return undefined;
    }
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
      throw new Error("Transition aborted");
    }
    this.currentState = toState;
    await this.executeActions(transition.actions, payload);
    await this.executeActions(entryActions, payload);
    const duration = Date.now() - startTime;
    this.history.push({
      from: fromState,
      to: toState,
      event: "transition",
      timestamp: Date.now(),
      duration,
      payload,
    });
    debug.info("Transition: %s -> %s (%dms)", fromState, toState, duration);
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
        "Guard evaluation failed: %s",
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  private async executeActions(
    actions: ActionFunction<TContext>[] | undefined,
    payload?: unknown,
  ): Promise<void> {
    if (!actions) {
      return;
    }
    for (const action of actions) {
      if (this.abortController?.signal.aborted) {
        throw new Error("Transition aborted");
      }
      try {
        await action(this.context, payload);
      } catch (error) {
        debug.error(
          "Action execution failed: %s",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    }
  }

  private isValidTransition(from: State, to: State): boolean {
    if (!this.config.states[to]) {
      debug.error("Target state does not exist", new Error(`State: ${to}`));
      return false;
    }
    return true;
  }

  private flushQueue(): void {
    const next = this.eventQueue.shift();
    if (next) {
      void this.send(next.event, next.payload);
    }
  }
}
