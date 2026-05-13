export interface SquadBossEncounter {
    id: string;
    bossId: string;
    squadId: string;
    healthRemaining: number;
    maxHealth: number;
    status: 'ACTIVE' | 'DEFEATED' | 'TIMEOUT' | 'ABANDONED';
    startedAt: number;
    expiresAt: number;
    defeatedAt: number | null;
    memberContributions: SquadMemberContribution[];
    squadDamageTotal: number;
    lastActivityAt: number;
}

export interface SquadMemberContribution {
    userId: string;
    userName: string;
    avatarUrl: string | null;
    damageDealt: number;
    sessionsContributed: number;
    lastContributionAt: number;
    largestSingleHit: number;
    criticalHits: number;
    bountyPlaced: boolean;
}

export interface SquadVictoryCeremony {
    encounterId: string;
    bossId: string;
    bossName: string;
    defeatedAt: number;
    squadId: string;
    mvp: SquadMemberContribution | null;
    contributions: SquadMemberContribution[];
    totalSquadDamage: number;
    victoryMessage: string;
    sharedRewards: SquadSharedReward[];
}

export interface SquadSharedReward {
    userId: string;
    xpAmount: number;
    coinAmount: number;
    cosmeticId: string | null;
    bonusReward: boolean;
}

export interface SquadBossInvite {
    id: string;
    encounterId: string;
    squadId: string;
    invitedByUserId: string;
    invitedAt: number;
    expiresAt: number;
    accepted: boolean;
    declined: boolean;
}
