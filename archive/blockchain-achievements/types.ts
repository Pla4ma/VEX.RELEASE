/**
 * Blockchain Achievements - Domain Types
 */

export interface BlockchainAchievement {
  id: string;
  name: string;
  description: string;
  category: 'skill' | 'milestone' | 'contribution' | 'collaboration' | 'innovation' | 'leadership';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  type: 'individual' | 'team' | 'community' | 'global';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  metadata: {
    issuer: string;
    issuedAt: Date;
    blockchain: string;
    contractAddress: string;
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    gasPrice: string;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected' | 'disputed';
    verifiedBy?: string;
    verifiedAt?: Date;
    evidence: string[];
    disputes: AchievementDispute[];
  };
  statistics: {
    earnedCount: number;
  totalEligible: number;
  completionRate: number;
  averageTimeToComplete: number; // days
  successRate: number;
  popularity: number;
  trending: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementRequirement {
  id: string;
  type: 'skill_level' | 'experience_points' | 'time_spent' | 'projects_completed' | 'collaborations' | 'contributions' | 'certifications' | 'milestones' | 'custom';
  description: string;
  criteria: {
    operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains' | 'completed';
    value: any;
    unit?: string;
  };
  optional: boolean;
  weight: number; // importance weighting
  validation: {
    method: 'automatic' | 'manual' | 'peer_review' | 'oracle';
    validator?: string;
    smartContract?: string;
  };
}

export interface AchievementReward {
  id: string;
  type: 'badge' | 'token' | 'nft' | 'certificate' | 'access' | 'discount' | 'recognition' | 'custom';
  name: string;
  description: string;
  value: {
    amount?: number;
    currency?: string;
    tokenId?: string;
    contractAddress?: string;
    url?: string;
    metadata?: any;
  };
  distribution: {
    method: 'automatic' | 'claim' | 'airdrop' | 'transfer';
    conditions?: string[];
    expiryDate?: Date;
  };
  scarcity: {
    totalSupply?: number;
    remainingSupply?: number;
    isTransferable: boolean;
    isBurnable: boolean;
  };
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  status: 'in_progress' | 'completed' | 'claimed' | 'expired' | 'revoked';
  progress: AchievementProgress[];
  startedAt: Date;
  completedAt?: Date;
  claimedAt?: Date;
  expiresAt?: Date;
  evidence: AchievementEvidence[];
  blockchain: {
    transactionHash?: string;
    contractAddress: string;
    tokenId?: string;
    mintedAt?: Date;
    transferredAt?: Date;
  };
  sharing: {
    isPublic: boolean;
    sharedTo: string[]; // platform IDs
    sharedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementProgress {
  requirementId: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
  completedAt?: Date;
  lastUpdated: Date;
  evidence?: string[];
}

export interface AchievementEvidence {
  id: string;
  type: 'screenshot' | 'document' | 'link' | 'video' | 'code' | 'testimony' | 'data' | 'custom';
  content: string;
  url?: string;
  hash?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  uploadedAt: Date;
}

export interface AchievementDispute {
  id: string;
  userAchievementId: string;
  challengerId: string;
  reason: 'fraud' | 'misrepresentation' | 'technical_error' | 'policy_violation' | 'other';
  description: string;
  evidence: AchievementEvidence[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: {
    outcome: 'upheld' | 'overturned' | 'compromise';
    action: 'revoke' | 'confirm' | 'modify' | 'compensate';
    description: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockchainNetwork {
  id: string;
  name: string;
  chainId: number;
  type: 'mainnet' | 'testnet' | 'private';
  consensus: 'proof_of_work' | 'proof_of_stake' | 'proof_of_authority' | 'delegated_proof_of_stake';
  currency: {
    symbol: string;
    decimals: number;
    name: string;
  };
  contracts: {
    achievement: {
      address: string;
      abi: any[];
      deployedAt: Date;
      version: string;
    };
    badge: {
      address: string;
      abi: any[];
      deployedAt: Date;
      version: string;
    };
    reward: {
      address: string;
      abi: any[];
      deployedAt: Date;
      version: string;
    };
  };
  settings: {
    gasLimit: number;
    gasPrice: string;
    confirmations: number;
    timeout: number;
  };
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementCollection {
  id: string;
  name: string;
  description: string;
  creator: string;
  type: 'personal' | 'community' | 'organization' | 'global';
  visibility: 'public' | 'private' | 'unlisted';
  achievements: CollectionAchievement[];
  requirements: CollectionRequirement[];
  rewards: CollectionReward[];
  statistics: {
    totalAchievements: number;
    completedBy: number;
    averageCompletionTime: number;
    difficulty: number;
    popularity: number;
  };
  blockchain: {
    contractAddress?: string;
    tokenId?: string;
    mintedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionAchievement {
  achievementId: string;
  required: boolean;
  order: number;
  weight: number;
}

export interface CollectionRequirement {
  type: 'all_achievements' | 'specific_count' | 'specific_achievements' | 'custom';
  description: string;
  criteria: any;
}

export interface CollectionReward {
  type: 'bonus_achievement' | 'special_badge' | 'token_reward' | 'nft_reward' | 'recognition';
  name: string;
  description: string;
  value: any;
  conditions?: string[];
}

export interface AchievementMarketplace {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'auction';
  status: 'active' | 'inactive' | 'maintenance';
  listings: MarketplaceListing[];
  transactions: MarketplaceTransaction[];
  fees: {
    listingFee: number;
    transactionFee: number;
    royaltyFee: number;
    currency: string;
  };
  settings: {
    minimumPrice: number;
    maximumPrice?: number;
    allowedCurrencies: string[];
    verificationRequired: boolean;
    escrowEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  userAchievementId: string;
  type: 'sale' | 'auction' | 'trade';
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  auction?: {
    startPrice: number;
    reservePrice?: number;
    startTime: Date;
    endTime: Date;
    currentBid?: number;
    currentBidder?: string;
    bids: AuctionBid[];
  };
  conditions: {
    transferable: boolean;
    verificationRequired: boolean;
    escrow: boolean;
    returnPolicy: string;
  };
  metadata: {
    title: string;
    description: string;
    tags: string[];
    images: string[];
  };
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuctionBid {
  id: string;
  bidderId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: 'active' | 'outbid' | 'winning';
}

export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  type: 'sale' | 'auction' | 'trade';
  price: {
    amount: number;
    currency: string;
  };
  fees: {
    marketplace: number;
    royalty: number;
    total: number;
  };
  blockchain: {
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    gasPrice: string;
    timestamp: Date;
  };
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  escrow?: {
    released: boolean;
    releasedAt?: Date;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface AchievementAnalytics {
  achievementId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalEarned: number;
    uniqueEarners: number;
    averageTimeToComplete: number;
    completionRate: number;
    dropoutRate: number;
    retryCount: number;
    successRate: number;
    difficultyRating: number;
    satisfactionScore: number;
  };
  demographics: {
    experienceLevels: Record<string, number>;
    regions: Record<string, number>;
    ageGroups: Record<string, number>;
    skillAreas: Record<string, number>;
  };
  trends: {
    popularityTrend: 'increasing' | 'stable' | 'decreasing';
    difficultyTrend: 'easier' | 'stable' | 'harder';
    completionTrend: 'improving' | 'stable' | 'declining';
  };
  revenue: {
    totalRevenue: number;
    averageRevenue: number;
    marketplaceRevenue: number;
    royaltyRevenue: number;
  };
  createdAt: Date;
}

export interface BlockchainEvent {
  id: string;
  type: 'achievement_earned' | 'achievement_claimed' | 'achievement_transferred' | 'achievement_revoked' | 'collection_completed' | 'marketplace_transaction' | 'dispute_resolved';
  data: any;
  user?: string;
  achievement?: string;
  collection?: string;
  transaction?: {
    hash: string;
    blockNumber: number;
    timestamp: Date;
  };
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AchievementVerification {
  id: string;
  userAchievementId: string;
  verifier: string;
  method: 'automatic' | 'manual' | 'peer_review' | 'oracle' | 'ai';
  status: 'pending' | 'approved' | 'rejected' | 'requires_additional';
  score: number; // 0-100 confidence score
  feedback: string;
  evidence: AchievementEvidence[];
  blockchain: {
    transactionHash?: string;
    verifiedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
