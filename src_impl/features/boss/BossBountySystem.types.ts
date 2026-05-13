export interface BountyStatus {
    hasActiveBounty: boolean;
    bountyCount: number;
    totalLootMultiplier: number;
    expiresAt: number | null;
    hoursRemaining: number;
    canPlaceBounty: boolean;
    maxStackReached: boolean;
}

export interface PlaceBountyResult {
    success: boolean;
    bountyId: string | null;
    stackCount: number;
    lootMultiplier: number;
    error: { code: string; message: string } | null;
}

export type BossBounty = z.infer<typeof BossBountySchema>;
export type PlaceBountyInput = z.infer<typeof PlaceBountyInputSchema>;
export type ConsumeBountyInput = z.infer<typeof ConsumeBountyInputSchema>;
export type GetBountyStatusInput = z.infer<typeof GetBountyStatusInputSchema>;
