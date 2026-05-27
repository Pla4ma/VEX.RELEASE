import type { UnlockDecision } from "./types";

export function trackUnlockDecisionResolved(decision: UnlockDecision): void {
  // Intentionally no-op: analytics wiring deferred until PostHog/Sentry integration planned.
  // Event shape preserved for future use.
  void decision;
}

export function trackUnlockDecisionDismissed(featureKey: string): void {
  void featureKey;
}
