import { z } from "zod";

import type { HomePrimaryPriority } from "../../../features/home-spine/priority-schemas";
import type { SessionStackParams } from "../../../navigation/types";

export const SessionSetupParamsSchema = z
  .object({
    presetMode: z
      .enum(["LIGHT_FOCUS", "DEEP_WORK", "SPRINT", "STUDY"])
      .optional(),
    recommendationId: z.string().uuid().optional(),
    suggestedDurationSeconds: z.number().int().positive().optional(),
  })
  .strict();

export function toSessionSetupParams(
  params: Record<string, unknown> | undefined,
): SessionStackParams["SessionSetup"] {
  return SessionSetupParamsSchema.parse(params ?? {});
}

export function buildOfflineFallback(
  priority: HomePrimaryPriority,
): HomePrimaryPriority {
  if (priority.cta.action === "OPEN_SESSION_SETUP") {
    return priority;
  }
  return {
    ...priority,
    cta: {
      action: "OPEN_SESSION_SETUP",
      params: { presetMode: "DEEP_WORK", suggestedDurationSeconds: 15 * 60 },
      text: "Start Focus Offline",
    },
    reason:
      "Network-only surfaces are paused right now. You can still start a clean local session.",
  };
}
