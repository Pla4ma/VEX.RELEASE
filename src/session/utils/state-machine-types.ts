export type State = string;
export type Event = string;

export type GuardFunction<TContext> = (
  context: TContext,
  payload?: unknown,
) => boolean | Promise<boolean>;

export type ActionFunction<TContext> = (
  context: TContext,
  payload?: unknown,
) => void | Promise<void>;

export interface Transition<TContext> {
  target: State;
  guard?: GuardFunction<TContext>;
  actions?: ActionFunction<TContext>[];
}

export interface StateConfig<TContext> {
  entry?: ActionFunction<TContext>[];
  exit?: ActionFunction<TContext>[];
  on?: Record<Event, Transition<TContext> | Transition<TContext>[]>;
}

export interface StateMachineConfig<TContext> {
  id: string;
  initial: State;
  context: TContext;
  states: Record<State, StateConfig<TContext>>;
  on?: Record<Event, Transition<TContext>>;
}

export interface TransitionRecord {
  from: State;
  to: State;
  event: Event;
  timestamp: number;
  duration: number;
  payload?: unknown;
}

export interface SessionMachineContext {
  sessionId: string | null;
  userId: string | null;
  startTime: number | null;
  pausedDuration: number;
  interruptions: number;
  errorCount: number;
  lastError: Error | null;
  canRecover: boolean;
  recoveryAttempts: number;
  syncAttempts: number;
  storageStatus: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
  networkStatus: "ONLINE" | "OFFLINE" | "UNSTABLE";
}
