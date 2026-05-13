export interface LiveFocusingData {
    /** Total number of people currently focusing */
    totalCount: number;
    /** Number of friends currently focusing */
    friendsCount: number;
    /** Number of squad members currently focusing */
    squadCount: number;
    /** Sample of avatars to display */
    sampleAvatars?: Array<{ url?: string; initials: string }>;
    /** Trend: 'up' | 'down' | 'stable' */
    trend?: 'up' | 'down' | 'stable';
    /** Percentage change from last hour */
    trendPercent?: number;
}
