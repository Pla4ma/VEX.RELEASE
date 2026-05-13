export interface SessionNarrative {
    sessionId: string;
    userId: string;
    createdAt: number;
    beats: NarrativeBeat[];
    openingLine: string;
    closingLine: string;
    theme: 'triumph' | 'struggle' | 'comeback' | 'mastery' | 'learning';
    totalInterruptions: number;
    longestPureStreak: number;
    comboCount: number;
    criticalHits: number;
    nearDeathMoments: number;
    tensionGraph: number[];
    climaxMoment: number;
    shareableSummary: string;
    heroQuote: string;
}

export interface NarrativeTemplate {
    id: string;
    type: NarrativeBeat['type'];
    conditions: Record<string, unknown>;
    templates: string[];
    intensity: number;
}

export type NarrativeBeat = z.infer<typeof NarrativeBeatSchema>;
