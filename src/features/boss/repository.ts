interface BossEncounterStub {
  id: string;
  bossId: string;
  healthRemaining: number;
  maxHealth: number;
  status: string;
  name: string;
}
interface BossTemplateStub {
  id: string;
  name: string;
  tier: number;
  minLevel: number;
  bossId?: string;
}

export async function fetchBossTemplate(
  ..._args: unknown[]
): Promise<BossTemplateStub | null> {
  void _args;
  return null;
}
export async function fetchActiveEncounter(
  ..._args: unknown[]
): Promise<BossEncounterStub | null> {
  void _args;
  return null;
}
export async function hasActiveBossEncounter(): Promise<boolean> {
  return false;
}
export async function getBossEncounter(): Promise<BossEncounterStub | null> {
  return null;
}
export const bossRepository = {
  hasActiveBossEncounter,
  getBossEncounter,
  fetchBossTemplate,
  fetchActiveEncounter,
};
