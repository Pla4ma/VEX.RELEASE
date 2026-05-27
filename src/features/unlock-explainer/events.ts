import type { UnlockDecision } from "./types";

export interface UnlockDecisionResolvedEvent {
  decision: UnlockDecision;
  timestamp: number;
  type: "unlock_decision_resolved";
}

export interface UnlockDecisionDismissedEvent {
  featureKey: string;
  timestamp: number;
  type: "unlock_decision_dismissed";
}

export type UnlockExplainerEvent =
  | UnlockDecisionResolvedEvent
  | UnlockDecisionDismissedEvent;
