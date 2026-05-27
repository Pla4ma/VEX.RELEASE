import type { SessionLifecycleEvents } from "./session-lifecycle-events";
import type { SessionRuntimeEvents } from "./session-runtime-events";

export type { SessionLifecycleEvents } from "./session-lifecycle-events";
export type { SessionRuntimeEvents } from "./session-runtime-events";

export interface SessionEventChannels
  extends SessionLifecycleEvents,
    SessionRuntimeEvents {}

export type SessionEventChannel = keyof SessionEventChannels;
export type SessionEventPayload<T extends SessionEventChannel> =
  SessionEventChannels[T];
