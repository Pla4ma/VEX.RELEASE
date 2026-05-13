export interface StakesSessionResult {
    sessionId: string;
    userId: string;
    difficulty: SessionDifficulty;
    completed: boolean;
    xpEarned: number;
    baseXp: number;
    gemWager: number;
    gemsWon: number;
    gemsLost: number;
    pausesUsed: number;
    qualityScore: number;
    winStreakUpdated: number;
}

export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;
export type SessionStakes = z.infer<typeof SessionStakesSchema>;
export type UserStakesPreference = z.infer<typeof UserStakesPreferenceSchema>;
