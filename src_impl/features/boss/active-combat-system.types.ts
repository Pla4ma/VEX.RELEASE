export interface CombatActionResult {
    success: boolean;
    damageDealt: number;
    energyConsumed: number;
    bossHealthRemaining: number;
    newPhase: BossPhase;
    comboBonus: number;
    message: string;
}

export type BossAttackPattern = z.infer<typeof BossAttackPatternSchema>;
export type BossPhase = z.infer<typeof BossPhaseSchema>;
export type CombatAbility = z.infer<typeof CombatAbilitySchema>;
export type ActiveEncounter = z.infer<typeof ActiveEncounterSchema>;
