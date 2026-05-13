export interface QualityIndicatorProps {
    /** Current quality grade */
    grade: QualityGrade;
    /** Numeric purity score (0-100) */
    purityScore: number;
    /** Estimated XP at current pace */
    xpEstimate: number;
    /** XP multiplier from streaks/other bonuses */
    xpMultiplier: number;
    /** Whether strict mode is enabled */
    isStrictMode: boolean;
    /** Whether session is currently paused (affects grade display) */
    isPaused: boolean;
    /** Whether quality decreased recently (trigger animation) */
    qualityDecreased?: boolean;
    /** Loading state */
    isLoading?: boolean;
}

export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D';
