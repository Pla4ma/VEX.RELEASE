export interface MasteryTrackState {
    level: number;
    xp: number;
    xpToNext: number;
    totalXp: number;
    milestonesCompleted: number[];
}

export interface UnifiedMasteryState {
    userId: string;
    tracks: Record<MasteryTrack, MasteryTrackState>;
    overallLevel: number;
    overallRank: MasteryRank;
    prestigeLevel: number;
    prestigeBonuses: string[];
    lastUpdated: number;
    createdAt: number;
}

export interface SessionMasteryXp {
    track: MasteryTrack;
    xpEarned: number;
    reason: string;
}

export interface SessionMasteryResult {
    totalXp: number;
    byTrack: Record<MasteryTrack, number>;
    levelUps: Array<{ track: MasteryTrack; newLevel: number }>;
    overallLevelUp: boolean;
}

export interface ApplyXpResult {
    newState: UnifiedMasteryState;
    levelUps: Array<{ track: MasteryTrack; oldLevel: number; newLevel: number }>;
    overallLevelUp: { oldLevel: number; newLevel: number; newRank: MasteryRank } | null;
}

export interface MasteryUnlock {
    id: string;
    name: string;
    description: string;
    requiredTrack: MasteryTrack;
    requiredLevel: number;
    unlocked: boolean;
}

export type MasteryTrack = z.infer<typeof MasteryTrackSchema>;
export type MasteryRank = | 'APPRENTICE' // Overall 1-10
      | 'ADEPT' // 11-20
      | 'EXPERT' // 21-30
      | 'MASTER' // 31-40
      | 'GRANDMASTER' // 41-50
      | 'TRANSCENDENT';
