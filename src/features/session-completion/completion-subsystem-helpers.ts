import * as Sentry from "@sentry/react-native";
import { getAvailabilityFor } from "../liveops-config/feature-access-store";
import { CompletionLedgerSchema, type CompletionLedger } from "./schemas";
import type { SubsystemMeta } from "./subsystem-meta";

export function subsystemShouldRun(meta: SubsystemMeta): boolean {
  if (
    meta.kind === "CORE_REQUIRED" ||
    meta.kind === "REQUIRED" ||
    meta.kind === "ANALYTICS_ONLY"
  ) {
    return true;
  }
  if (meta.kind === "FEATURE_DEPENDENT" && meta.featureKey) {
    return getAvailabilityFor(meta.featureKey).canSubscribeToEvents;
  }
  return false;
}

export function rewardAmountFor(ledger: CompletionLedger): number {
  return Math.max(1, Math.floor(ledger.xpDelta / 10));
}

export async function runSubsystem(
  degradedSystems: string[],
  label: string,
  fn: () => Promise<void>,
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    degradedSystems.push(label);
    Sentry.captureException(error, {
      tags: { feature: "session-completion", subsystem: label },
    });
  }
}

export function withDegradedSystems(
  ledger: CompletionLedger,
  degradedSystems: string[],
): CompletionLedger {
  return CompletionLedgerSchema.parse({
    ...ledger,
    degradedSystems: Array.from(
      new Set([...ledger.degradedSystems, ...degradedSystems]),
    ),
  });
}
