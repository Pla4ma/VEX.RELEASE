export interface ExpansionBossTemplate extends BossTemplate {
    damageType: string;
    unlockRequirement: {
        type: string;
        value: number;
        description: string;
        };
    spawnConditions: {
        timeOfDay: string | null;
        dayOfWeek: string | null;
        specialCondition: string | null;
        };
    flavorText: string[];
    artworkDescription: string;
    mechanics: {
        specialAbility: string;
        abilityDescription: string;
        damageMultiplier: {
          condition: string;
          multiplier: number;
          description: string;
        };
        };
}
