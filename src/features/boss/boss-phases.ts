export type BossPhase = string;
export type BossPhaseState = { currentPhase: BossPhase | null; previousPhase: BossPhase | null };
export const BOSS_PHASES: Record<string, { health: number; message: string }> = {};
export function getBossPhase(): BossPhase | null { return null; }
