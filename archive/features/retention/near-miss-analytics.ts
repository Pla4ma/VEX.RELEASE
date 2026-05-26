import * as Sentry from "@sentry/react-native";
import { eventBus } from "../../events";
import type { NearMissIntervention } from "./near-miss-schemas";

export function trackInterventionEffectiveness(
  intervention: NearMissIntervention,
  outcome: "SUCCESS" | "DISMISSED" | "IGNORED",
): void {
  Sentry.addBreadcrumb({
    category: "near_miss_analytics",
    message: `Intervention ${outcome}`,
    data: {
      trigger: intervention.trigger,
      urgency: intervention.urgency,
      outcome,
      timeToAction: Date.now() - intervention.triggeredAt,
    },
  });
  eventBus.publish("near_miss:analytics", {
    interventionId: intervention.id,
    trigger: intervention.trigger,
    outcome,
  });
}
