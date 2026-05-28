import * as Sentry from "@sentry/react-native";
import { z } from "zod";

import { eventBus } from "../../events";
import { setOrchestratorHandlesCompletion } from "../../session/analytics/SessionAnalytics";
import { orchestrateSessionCompletion } from "./completion-orchestrator";

const SessionCompletedEventSchema = z
  .object({
    sessionId: z.string().uuid(),
    summary: z.unknown(),
    timestamp: z.number().optional(),
    userId: z.string().min(1),
  })
  .strict();

let initialized = false;

export function initializeSessionCompletionOrchestrator(): void {
  if (initialized) return;

  initialized = true;
  setOrchestratorHandlesCompletion(true);

  eventBus.subscribe("session:completed", (rawEvent) => {
    const parsed = SessionCompletedEventSchema.safeParse(rawEvent);
    if (!parsed.success) return;

    orchestrateSessionCompletion(parsed.data).catch((error: unknown) => {
      Sentry.captureException(error, {
        tags: { feature: "session-completion-orchestrator" },
      });
    });
  });
}
