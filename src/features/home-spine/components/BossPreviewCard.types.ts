export type BossTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface BossPreviewCardProps {
  bossName: string;
  healthPercent: number;
  hoursRemaining: number;
  estimatedDamage?: number;
  tier: BossTier;
  bossIcon?: string;
  wouldDefeat?: boolean;
  onPress?: () => void;
  isLoading?: boolean;
  isFinalStrike?: boolean;
  taunt?: string;
  activeBountyCount?: number;
  maxBounties?: number;
  onPlaceBounty?: () => void;
  isPlacingBounty?: boolean;
  bountyError?: string | null;
  coinBalance?: number;
  BOUNTY_COST?: number;
}
