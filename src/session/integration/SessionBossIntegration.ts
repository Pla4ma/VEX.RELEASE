import { z } from "zod";

import { eventBus } from "../../events";
import { applyBossDamageRules } from "../../features/boss/damage-rules";
import { applyDamage, getActiveEncounter } from "../../features/boss/service";
import { getAvailabilityFor } from "../../features/liveops-config/feature-access-store";
import { SessionSummarySchema } from "../types";
import {
  getSessionModeConfig,
  getSprintChainMultiplier,
  resolveSessionMode,
  SessionMode,
} from "../modes";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session:boss-integration");

const SessionCompletedEventSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  summary: SessionSummarySchema,
});

function getSessionDatePart(timestamp: number | undefined): {
  currentDay: number;
  currentHour: number;
} {
  const date = new Date(timestamp ?? Date.now());
  return {
    currentDay: date.getDay(),
    currentHour: date.getHours(),
  };
}

export function calculateBossDamage(
  summary: z.infer<typeof SessionSummarySchema>,
  bossId?: string,
): number {
  const durationMinutes = Math.max(0, summary.effectiveDuration / 60000);
  const purityMultiplier = Math.max(
    0,
    Math.min(1, (summary.focusPurityScore ?? summary.focusQuality ?? 0) / 100),
  );

  if (durationMinutes <= 0 || purityMultiplier <= 0) {
    return 0;
  }

  const mode = resolveSessionMode(summary.sessionMode);
  const baseModeMultiplier = getSessionModeConfig(mode).bossDamageMultiplier;
  const sprintMultiplier =
    mode === SessionMode.SPRINT
      ? getSprintChainMultiplier(
          summary.modeBonus > 0 ? Math.round(summary.modeBonus / 5) + 1 : 1,
        )
      : 1;
  const baseDamage = Math.max(
    1,
    Math.round(
      durationMinutes *
        purityMultiplier *
        baseModeMultiplier *
        sprintMultiplier,
    ),
  );
  return applyBossDamageRules(baseDamage, {
    sessionDuration: Math.max(1, Math.round(summary.effectiveDuration / 1000)),
    sessionQuality: Math.max(
      0,
      Math.min(100, summary.focusPurityScore ?? summary.focusQuality ?? 0),
    ),
    streakDays: summary.streakDays ?? 0,
    squadMultiplier: 1,
    equippedItemIds: [],
    bossId,
    backgroundEvents: summary.interruptions,
    ...getSessionDatePart(summary.createdAt),
  });
}

export function initializeSessionBossIntegration(): () => void {
  const availability = getAvailabilityFor("boss_tab");
  if (!availability.canSubscribeToEvents) {
    debug.info(
      "SessionBossIntegration skipped — boss_tab feature cannot subscribe to events (state: %s)",
      availability.state,
    );
    return () => {};
  }

  const unsubscribe = eventBus.subscribe(
    "session:completed",
    async (rawEvent) => {
      const parsedEvent = SessionCompletedEventSchema.safeParse(rawEvent);
      if (!parsedEvent.success) {
        debug.warn(
          "Skipping boss damage because the session completion payload was invalid",
        );
        return;
      }

      const { sessionId, userId, summary } = parsedEvent.data;

      try {
        const activeEncounter = await getActiveEncounter(userId);
        if (!activeEncounter || activeEncounter.status !== "ACTIVE") {
          return;
        }

        const damage = calculateBossDamage(summary, activeEncounter.bossId);
        if (damage <= 0) {
          debug.debug(
            "Skipping boss damage for session %s because the active boss blocked damage",
            sessionId,
          );
          return;
        }

        await applyDamage({
          encounterId: activeEncounter.id,
          sessionId,
          damage,
        });
      } catch (error) {
        debug.error(
          "Failed to apply boss damage from session completion",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    },
  );

  return unsubscribe;
}
