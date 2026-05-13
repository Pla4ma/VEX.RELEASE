import { eventBus } from "../../events";
import * as repository from "./repository";
import { applyBossDamageRules } from "./damage-rules";
import { CreateEncounterInputSchema, ApplyDamageInputSchema, CalculateDamageInputSchema, BossEncounterStatusSchema, type BossTemplate, type BossEncounter, type BossEncounterSummary, type BossDamageResult, type BossDefeatResult, type BossDefeatSummary, type CreateEncounterInput, type ApplyDamageInput, type CalculateDamageInput } from "./schemas";


export async function getDefeatSummary(encounterId: string): Promise<BossDefeatSummary | null> {
  // This would fetch detailed defeat information
  // For now, return null as we need to implement the defeat history query
  return null;
}

export async function getAvailableBosses(
  userId: string,
  userLevel: number,
): Promise<
  Array<{
    template: BossTemplate;
    unlocked: boolean;
    lockedReason: string | null;
    defeated: boolean;
  }>
> {
  const templates = await repository.fetchBossTemplates();

  const results = await Promise.all(
    templates.map(async (template) => {
      const { allowed, reason } = await canUserFightBoss(userId, template.id, userLevel);
      const defeated = await repository.hasDefeatedBoss(userId, template.id);

      return {
        template,
        unlocked: allowed,
        lockedReason: reason,
        defeated,
      };
    }),
  );

  return results;
}