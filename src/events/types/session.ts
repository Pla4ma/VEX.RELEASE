export type { SessionLifecycleEventDefinitions } from "./session-lifecycle";
export type { SessionInterruptionEventDefinitions } from "./session-interruption";
export type { SessionCombatEventDefinitions } from "./session-combat";
export type { SessionMetaEventDefinitions } from "./session-meta";

import type { SessionLifecycleEventDefinitions } from "./session-lifecycle";
import type { SessionInterruptionEventDefinitions } from "./session-interruption";
import type { SessionCombatEventDefinitions } from "./session-combat";
import type { SessionMetaEventDefinitions } from "./session-meta";

export interface SessionEventDefinitions
  extends SessionLifecycleEventDefinitions,
    SessionInterruptionEventDefinitions,
    SessionCombatEventDefinitions,
    SessionMetaEventDefinitions {}
