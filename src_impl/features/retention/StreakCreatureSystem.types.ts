export interface CreatureEvolutionResult {
    evolved: boolean;
    newStage?: CreatureStage;
    newAbilities?: string[];
    message: string;
}

export interface CreatureStats {
    stage: CreatureStage;
    level: number;
    experience: number;
    happiness: number;
    health: number;
    bond: number;
    abilities: string[];
    personality: PersonalityTrait[];
    nextEvolution: {
        stage: CreatureStage;
        progress: number;
        requirements: Record<string, number>;
        };
}

export type CreatureStage = z.infer<typeof CreatureStageSchema>;
export type PersonalityTrait = z.infer<typeof PersonalityTraitSchema>;
export type StreakCreature = z.infer<typeof StreakCreatureSchema>;
export type CreatureCareAction = z.infer<typeof CreatureCareActionSchema>;
export type CreatureAbility = z.infer<typeof CreatureAbilitySchema>;
