export interface BossPreviewCardProps {
    /** Boss name */
    bossName: string;
    /** Boss health percentage (0-100) */
    healthPercent: number;
    /** Hours remaining until boss escapes */
    hoursRemaining: number;
    /** Estimated damage this session would deal */
    estimatedDamage?: number;
    /** Boss tier/rarity */
    tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    /** Boss avatar/icon URL */
    bossIcon?: string;
    /** Whether this session would defeat the boss */
    wouldDefeat?: boolean;
    /** Navigate to boss detail screen */
    onPress?: () => void;
    /** Loading state */
    isLoading?: boolean;
    /** PHASE 7.3: Final Strike mode (1-15% health) - triggers urgent UI */
    isFinalStrike?: boolean;
    /** PHASE 12.1: Boss taunt message based on health */
    taunt?: string;
    /** Boss Bounty — Phase 4 */
    activeBountyCount?: number;
    maxBounties?: number;
    onPlaceBounty?: () => void;
    isPlacingBounty?: boolean;
    bountyError?: string | null;
    coinBalance?: number;
    BOUNTY_COST?: number;
}
