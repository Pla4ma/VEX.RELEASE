export type SquadWarMemberStatus = {
  userId: string;
  displayName: string;
  isCurrentlyFocusing: boolean;
  sessionStartedAt: number | null;
  damageContributed: number;
  lastSeenAt: number;
};

export type SquadWar = {
  id: string;
  squadId: string;
  opponentSquadId: string | null;
  bossName: string;
  bossMaxHealth: number;
  bossCurrentHealth: number;
  weekStartsAt: string;
  weekEndsAt: string;
  members: SquadWarMemberStatus[];
  status: 'active' | 'victory' | 'defeat' | 'expired';
  rewardMultiplier: number;
};
