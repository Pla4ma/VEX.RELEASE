export interface CoachPersonaConfig {
    id: CoachPersona;
    name: string;
    description: string;
    unlockRequirement: {
        type: 'FREE' | 'PREMIUM' | 'MASTERY_RANK';
        value?: string;
        };
    messageStyle: 'gentle' | 'direct' | 'analytical' | 'energetic' | 'challenging';
    avatarUrl: string;
    colorTheme: string;
    freeFeatures: string[];
    premiumFeatures: string[];
}

export interface FreeTierFeatures {
    dailyReminders: boolean;
    streakRiskWarnings: boolean;
    sessionStartPrompts: boolean;
    weeklySummary: boolean;
    streakStatus: boolean;
    simpleProgress: boolean;
    dailyTip: boolean;
    modeSuggestions: boolean;
    basicBossStrategies: boolean;
    activeQuests: CoachQuest[];
    questSlots: number;
}

export interface CoachQuest {
    id: string;
    title: string;
    description: string;
    requirement: {
        type: 'SESSION_COUNT' | 'PURITY_THRESHOLD' | 'STREAK_DAYS' | 'BOSS_DEFEAT';
        value: number;
        details?: Record<string, unknown>;
        };
    reward: {
        coins: number;
        xp?: number;
        itemId?: string;
        };
    progress: number;
    completed: boolean;
    expiresAt: number;
}

export type CoachPersona = z.infer<typeof CoachPersonaSchema>;
