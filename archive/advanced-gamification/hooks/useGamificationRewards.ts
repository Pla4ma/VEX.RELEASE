/**
 * Gamification Rewards Hook
 * 
 * React hook for accessing advanced gamification with real-world rewards,
 * cryptocurrency integration, NFTs, and IoT device control.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRealWorldRewardsSystem } from '../../productivity/gamification/RealWorldRewardsSystem';
import type { 
  Reward, 
  RewardCategory, 
  RewardTier, 
  CryptoReward, 
  NFTReward, 
  IoTReward, 
  AchievementReward,
  GamificationConfig,
  RewardProgress,
  UserRewards
} from '../../productivity/gamification/RealWorldRewardsSystem';

interface UseGamificationRewardsState {
  rewards: Reward[];
  userRewards: UserRewards | null;
  cryptoRewards: CryptoReward[];
  nftRewards: NFTReward[];
  IoTDevices: IoTReward[];
  achievements: AchievementReward[];
  progress: RewardProgress[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseGamificationRewardsActions {
  initialize: (config: GamificationConfig) => Promise<void>;
  refreshRewards: () => Promise<void>;
  claimReward: (rewardId: string) => Promise<boolean>;
  purchaseReward: (rewardId: string, paymentMethod?: string) => Promise<boolean>;
  unlockReward: (rewardId: string) => Promise<boolean>;
  exchangeCrypto: (fromCrypto: string, toCrypto: string, amount: number) => Promise<boolean>;
  mintNFT: (achievementId: string) => Promise<NFTReward | null>;
  controlIoTDevice: (deviceId: string, action: string, parameters?: any) => Promise<boolean>;
  syncCryptoWallet: (walletAddress: string) => Promise<boolean>;
  refreshProgress: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseGamificationRewardsReturn extends UseGamificationRewardsState, UseGamificationRewardsActions {
  isReady: boolean;
  hasRewards: boolean;
  hasCryptoRewards: boolean;
  hasNFTRewards: boolean;
  hasIoTDevices: boolean;
  totalValue: number;
  availableRewards: Reward[];
  claimedRewards: Reward[];
  rewardsByCategory: Record<RewardCategory, Reward[]>;
  rewardsByTier: Record<RewardTier, Reward[]>;
  canClaimFreeRewards: boolean;
  nextRewardProgress: RewardProgress | null;
}

export function useGamificationRewards(userId: string): UseGamificationRewardsReturn {
  const [state, setState] = useState<UseGamificationRewardsState>({
    rewards: [],
    userRewards: null,
    cryptoRewards: [],
    nftRewards: [],
    IoTDevices: [],
    achievements: [],
    progress: [],
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize gamification system
  const initialize = useCallback(async (config: GamificationConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getRealWorldRewardsSystem(userId);
      await system.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        refreshRewards(),
        refreshProgress(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize gamification rewards',
      }));
    }
  }, [userId]);

  // Refresh rewards
  const refreshRewards = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getRealWorldRewardsSystem(userId);
      const [
        rewards,
        userRewards,
        cryptoRewards,
        nftRewards,
        IoTDevices,
        achievements,
      ] = await Promise.all([
        system.getRewards(),
        system.getUserRewards(),
        system.getCryptoRewards(),
        system.getNFTRewards(),
        system.getIoTDevices(),
        system.getAchievementRewards(),
      ]);
      
      setState(prev => ({
        ...prev,
        rewards,
        userRewards,
        cryptoRewards,
        nftRewards,
        IoTDevices,
        achievements,
        loading: false,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh rewards',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh progress
  const refreshProgress = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const progress = await system.getRewardProgress();
      
      setState(prev => ({
        ...prev,
        progress,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh progress',
      }));
    }
  }, [userId, state.initialized]);

  // Claim reward
  const claimReward = useCallback(async (rewardId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const success = await system.claimReward(rewardId);
      
      if (success) {
        await refreshRewards();
        await refreshProgress();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to claim reward',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshRewards, refreshProgress]);

  // Purchase reward
  const purchaseReward = useCallback(async (rewardId: string, paymentMethod?: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const success = await system.purchaseReward(rewardId, paymentMethod);
      
      if (success) {
        await refreshRewards();
        await refreshProgress();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to purchase reward',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshRewards, refreshProgress]);

  // Unlock reward
  const unlockReward = useCallback(async (rewardId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const success = await system.unlockReward(rewardId);
      
      if (success) {
        await refreshRewards();
        await refreshProgress();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to unlock reward',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshRewards, refreshProgress]);

  // Exchange cryptocurrency
  const exchangeCrypto = useCallback(async (fromCrypto: string, toCrypto: string, amount: number): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const success = await system.exchangeCryptocurrency(fromCrypto, toCrypto, amount);
      
      if (success) {
        await refreshRewards();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to exchange cryptocurrency',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshRewards]);

  // Mint NFT
  const mintNFT = useCallback(async (achievementId: string): Promise<NFTReward | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const nft = await system.mintNFT(achievementId);
      
      if (nft) {
        await refreshRewards();
      }
      
      return nft;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mint NFT',
      }));
      return null;
    }
  }, [userId, state.initialized, refreshRewards]);

  // Control IoT device
  const controlIoTDevice = useCallback(async (deviceId: string, action: string, parameters?: any): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const success = await system.controlIoTDevice(deviceId, action, parameters);
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to control IoT device',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Sync crypto wallet
  const syncCryptoWallet = useCallback(async (walletAddress: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealWorldRewardsSystem(userId);
      const success = await system.syncCryptoWallet(walletAddress);
      
      if (success) {
        await refreshRewards();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sync crypto wallet',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshRewards]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Retry operation
  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setState(prev => ({
        ...prev,
        error: 'Maximum retry attempts exceeded',
      }));
      return;
    }
    
    setRetryCount(prev => prev + 1);
    clearError();
    
    // Retry the last failed operation
    if (state.initialized) {
      await Promise.all([
        refreshRewards(),
        refreshProgress(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, refreshRewards, refreshProgress, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasRewards = useMemo(() => state.rewards.length > 0, [state.rewards.length]);
  const hasCryptoRewards = useMemo(() => state.cryptoRewards.length > 0, [state.cryptoRewards.length]);
  const hasNFTRewards = useMemo(() => state.nftRewards.length > 0, [state.nftRewards.length]);
  const hasIoTDevices = useMemo(() => state.IoTDevices.length > 0, [state.IoTDevices.length]);

  const totalValue = useMemo(() => {
    return state.rewards.reduce((total, reward) => {
      if (reward.claimed) return total;
      return total + (reward.value || 0);
    }, 0);
  }, [state.rewards]);

  const availableRewards = useMemo(() => 
    state.rewards.filter(reward => !reward.claimed && reward.unlocked),
    [state.rewards]
  );

  const claimedRewards = useMemo(() => 
    state.rewards.filter(reward => reward.claimed),
    [state.rewards]
  );

  const rewardsByCategory = useMemo(() => {
    const grouped: Record<RewardCategory, Reward[]> = {} as Record<RewardCategory, Reward[]>;
    state.rewards.forEach(reward => {
      if (!grouped[reward.category]) {
        grouped[reward.category] = [];
      }
      grouped[reward.category].push(reward);
    });
    return grouped;
  }, [state.rewards]);

  const rewardsByTier = useMemo(() => {
    const grouped: Record<RewardTier, Reward[]> = {} as Record<RewardTier, Reward[]>;
    state.rewards.forEach(reward => {
      if (!grouped[reward.tier]) {
        grouped[reward.tier] = [];
      }
      grouped[reward.tier].push(reward);
    });
    return grouped;
  }, [state.rewards]);

  const canClaimFreeRewards = useMemo(() => 
    availableRewards.some(reward => reward.cost === 0),
    [availableRewards]
  );

  const nextRewardProgress = useMemo(() => {
    const incompleteProgress = state.progress.filter(p => !p.completed);
    return incompleteProgress.length > 0 ? incompleteProgress[0] : null;
  }, [state.progress]);

  // Auto-refresh rewards periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      refreshRewards();
      refreshProgress();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.initialized, refreshRewards, refreshProgress]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
    refreshRewards,
    refreshProgress,
    claimReward,
    purchaseReward,
    unlockReward,
    exchangeCrypto,
    mintNFT,
    controlIoTDevice,
    syncCryptoWallet,
    clearError,
    retry,
    isReady,
    hasRewards,
    hasCryptoRewards,
    hasNFTRewards,
    hasIoTDevices,
    totalValue,
    availableRewards,
    claimedRewards,
    rewardsByCategory,
    rewardsByTier,
    canClaimFreeRewards,
    nextRewardProgress,
  };
}
