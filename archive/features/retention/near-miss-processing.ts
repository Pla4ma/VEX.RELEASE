import { eventBus } from "../../events";
import { generateIntervention } from "./near-miss-hooks";
import type { NearMissRepository } from "./near-miss-templates";

export async function processNearMissOpportunities(
  repository: NearMissRepository,
): Promise<{ streakInterventions: number; sessionInterventions: number }> {
  let streakInterventions = 0;
  let sessionInterventions = 0;

  const atRiskStreaks = await repository.fetchUsersWithAtRiskStreaks();
  for (const user of atRiskStreaks) {
    if (user.hoursRemaining <= 0.5) {
      const intervention = generateIntervention(user.userId, "STREAK_ABOUT_TO_BREAK", {
        streakDays: user.streakDays,
      });
      if (intervention) {
        streakInterventions++;
        eventBus.publish("notification:send", {
          userId: user.userId,
          type: "STREAK_EMERGENCY",
          title: intervention.content.headline,
          body: intervention.content.body,
          priority: "high",
        });
      }
    }
  }

  const abandonedSessions = await repository.fetchUsersWithAbandonedSessions();
  for (const session of abandonedSessions) {
    if (session.progress >= 80) {
      const intervention = generateIntervention(session.userId, "SESSION_ABANDON_80_PERCENT", {
        sessionCount: 1,
      });
      if (intervention) {
        sessionInterventions++;
        eventBus.publish("notification:send", {
          userId: session.userId,
          type: "SESSION_ABANDON",
          title: intervention.content.headline,
          body: intervention.content.body,
          priority: "medium",
        });
      }
    }
  }
  return { streakInterventions, sessionInterventions };
}
