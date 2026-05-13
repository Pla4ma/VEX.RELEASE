export interface PrestigeState {
    prestigeLevel: number;
    totalPrestiges: number;
    firstPrestigeAt: number | null;
    lastPrestigeAt: number | null;
    activeBonuses: string[];
    fastestPrestige: number | null;
    mostXpAtPrestige: number | null;
    nightmareUnlocked: boolean;
    nightmareCompletions: number;
}

export interface PrestigeResult {
    success: boolean;
    newState: UnifiedMasteryState;
    prestigeState: PrestigeState;
    bonusesGained: PrestigeBonus[];
    message: string;
}

export interface NightmareModeConfig {
    unlocked: boolean;
    enemyHealthMultiplier: number;
    enemyDamageMultiplier: number;
    xpMultiplier: number;
    dropChanceMultiplier: number;
    exclusiveRewards: string[];
}

export type PrestigeBonus = z.infer<typeof PrestigeBonusSchema>;
