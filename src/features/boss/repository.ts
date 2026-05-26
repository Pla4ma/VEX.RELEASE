interface BossEncounterStub { id: string; bossId: string; healthRemaining: number; maxHealth: number; status: string; name: string }
interface BossTemplateStub { id: string; name: string; tier: number; minLevel: number; bossId?: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchBossTemplate(..._args: any[]): Promise<BossTemplateStub | null> { return null; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchActiveEncounter(..._args: any[]): Promise<BossEncounterStub | null> { return null; }
export async function hasActiveBossEncounter(): Promise<boolean> { return false; }
export async function getBossEncounter(): Promise<BossEncounterStub | null> { return null; }
export const bossRepository = { hasActiveBossEncounter, getBossEncounter, fetchBossTemplate, fetchActiveEncounter };
