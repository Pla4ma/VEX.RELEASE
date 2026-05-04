/**
 * Blockchain Achievements Hook
 * 
 * React hook for accessing blockchain achievements with multi-chain integration,
 * NFT minting, reputation tracking, and decentralized credentials.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBlockchainAchievementSystem } from '../../productivity/blockchain/BlockchainAchievementSystem';
import type { 
  BlockchainAchievement,
  AchievementNFT,
  ReputationScore,
  DecentralizedCredential,
  MultiChainStatus,
  AchievementVerification,
  BlockchainConfig,
  AchievementRequest,
  AchievementResponse,
  ZeroKnowledgeProof,
  SmartContractInteraction
} from '../../productivity/blockchain/BlockchainAchievementSystem';

interface UseBlockchainAchievementsState {
  achievements: BlockchainAchievement[];
  nfts: AchievementNFT[];
  reputation: ReputationScore | null;
  credentials: DecentralizedCredential[];
  verifications: AchievementVerification[];
  multiChainStatus: MultiChainStatus[];
  zkProofs: ZeroKnowledgeProof[];
  smartContracts: SmartContractInteraction[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseBlockchainAchievementsActions {
  initialize: (config: BlockchainConfig) => Promise<void>;
  mintAchievementNFT: (achievementId: string) => Promise<AchievementNFT | null>;
  verifyAchievement: (achievementId: string) => Promise<VerificationResult | null>;
  transferNFT: (nftId: string, toAddress: string) => Promise<boolean>;
  stakeAchievement: (achievementId: string, amount: number) => Promise<boolean>;
  unstakeAchievement: (achievementId: string) => Promise<boolean>;
  createCredential: (credentialData: Partial<DecentralizedCredential>) => Promise<DecentralizedCredential | null>;
  verifyCredential: (credentialId: string) => Promise<boolean>;
  generateZKProof: (achievementId: string, verifierAddress: string) => Promise<ZeroKnowledgeProof | null>;
  verifyZKProof: (proof: ZeroKnowledgeProof) => Promise<boolean>;
  interactWithContract: (contractAddress: string, method: string, params: any[]) => Promise<any>;
  getAchievements: (request: AchievementRequest) => Promise<AchievementResponse | null>;
  refreshAchievements: () => Promise<void>;
  refreshReputation: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseBlockchainAchievementsReturn extends UseBlockchainAchievementsState, UseBlockchainAchievementsActions {
  isReady: boolean;
  hasAchievements: boolean;
  hasNFTs: boolean;
  hasCredentials: boolean;
  hasReputation: boolean;
  verifiedAchievements: BlockchainAchievement[];
  stakedAchievements: BlockchainAchievement[];
  totalReputationScore: number;
  canMintNFT: boolean;
  canStake: boolean;
  isConnectedToBlockchain: boolean;
}

export function useBlockchainAchievements(userId: string): UseBlockchainAchievementsReturn {
  const [state, setState] = useState<UseBlockchainAchievementsState>({
    achievements: [],
    nfts: [],
    reputation: null,
    credentials: [],
    verifications: [],
    multiChainStatus: [],
    zkProofs: [],
    smartContracts: [],
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize blockchain achievement system
  const initialize = useCallback(async (config: BlockchainConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getBlockchainAchievementSystem(userId);
      await system.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        refreshAchievements(),
        refreshReputation(),
        refreshNFTs(),
        refreshCredentials(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize blockchain achievements',
      }));
    }
  }, [userId]);

  // Refresh achievements
  const refreshAchievements = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getBlockchainAchievementSystem(userId);
      const [
        achievements,
        verifications,
        multiChainStatus,
        zkProofs,
        smartContracts,
      ] = await Promise.all([
        system.getAchievements(),
        system.getVerifications(),
        system.getMultiChainStatus(),
        system.getZKProofs(),
        system.getSmartContracts(),
      ]);
      
      setState(prev => ({
        ...prev,
        achievements,
        verifications,
        multiChainStatus,
        zkProofs,
        smartContracts,
        loading: false,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh achievements',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh reputation
  const refreshReputation = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const reputation = await system.getReputation();
      
      setState(prev => ({
        ...prev,
        reputation,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh reputation',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh NFTs
  const refreshNFTs = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const nfts = await system.getNFTs();
      
      setState(prev => ({
        ...prev,
        nfts,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh NFTs',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh credentials
  const refreshCredentials = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const credentials = await system.getCredentials();
      
      setState(prev => ({
        ...prev,
        credentials,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh credentials',
      }));
    }
  }, [userId, state.initialized]);

  // Mint achievement NFT
  const mintAchievementNFT = useCallback(async (achievementId: string): Promise<AchievementNFT | null> => {
    if (!state.initialized) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getBlockchainAchievementSystem(userId);
      const nft = await system.mintAchievementNFT(achievementId);
      
      if (nft) {
        setState(prev => ({
          ...prev,
          nfts: [...prev.nfts, nft],
          achievements: prev.achievements.map(achievement => 
            achievement.id === achievementId 
              ? { ...achievement, isMinted: true, nftId: nft.id }
              : achievement
          ),
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return nft;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to mint achievement NFT',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Verify achievement
  const verifyAchievement = useCallback(async (achievementId: string): Promise<VerificationResult | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const result = await system.verifyAchievement(achievementId);
      
      if (result) {
        setState(prev => ({
          ...prev,
          verifications: [...prev.verifications, {
            achievementId,
            verified: result.verified,
            timestamp: Date.now(),
            verifier: result.verifier,
            proof: result.proof,
          }],
          lastUpdated: Date.now(),
        }));
      }
      
      return result;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to verify achievement',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Transfer NFT
  const transferNFT = useCallback(async (nftId: string, toAddress: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const success = await system.transferNFT(nftId, toAddress);
      
      if (success) {
        setState(prev => ({
          ...prev,
          nfts: prev.nfts.filter(nft => nft.id !== nftId),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to transfer NFT',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Stake achievement
  const stakeAchievement = useCallback(async (achievementId: string, amount: number): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const success = await system.stakeAchievement(achievementId, amount);
      
      if (success) {
        setState(prev => ({
          ...prev,
          achievements: prev.achievements.map(achievement => 
            achievement.id === achievementId 
              ? { ...achievement, isStaked: true, stakedAmount: amount }
              : achievement
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stake achievement',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Unstake achievement
  const unstakeAchievement = useCallback(async (achievementId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const success = await system.unstakeAchievement(achievementId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          achievements: prev.achievements.map(achievement => 
            achievement.id === achievementId 
              ? { ...achievement, isStaked: false, stakedAmount: 0 }
              : achievement
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to unstake achievement',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Create credential
  const createCredential = useCallback(async (credentialData: Partial<DecentralizedCredential>): Promise<DecentralizedCredential | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const credential = await system.createCredential(credentialData);
      
      if (credential) {
        setState(prev => ({
          ...prev,
          credentials: [...prev.credentials, credential],
          lastUpdated: Date.now(),
        }));
      }
      
      return credential;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create credential',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Verify credential
  const verifyCredential = useCallback(async (credentialId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const success = await system.verifyCredential(credentialId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          credentials: prev.credentials.map(credential => 
            credential.id === credentialId 
              ? { ...credential, verified: true }
              : credential
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to verify credential',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Generate ZK proof
  const generateZKProof = useCallback(async (achievementId: string, verifierAddress: string): Promise<ZeroKnowledgeProof | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const proof = await system.generateZKProof(achievementId, verifierAddress);
      
      if (proof) {
        setState(prev => ({
          ...prev,
          zkProofs: [...prev.zkProofs, proof],
          lastUpdated: Date.now(),
        }));
      }
      
      return proof;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate ZK proof',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Verify ZK proof
  const verifyZKProof = useCallback(async (proof: ZeroKnowledgeProof): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const success = await system.verifyZKProof(proof);
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to verify ZK proof',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Interact with smart contract
  const interactWithContract = useCallback(async (contractAddress: string, method: string, params: any[]): Promise<any> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const result = await system.interactWithContract(contractAddress, method, params);
      
      return result;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to interact with smart contract',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Get achievements
  const getAchievements = useCallback(async (request: AchievementRequest): Promise<AchievementResponse | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBlockchainAchievementSystem(userId);
      const response = await system.getAchievements(request);
      
      return response;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get achievements',
      }));
      return null;
    }
  }, [userId, state.initialized]);

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
        refreshAchievements(),
        refreshReputation(),
        refreshNFTs(),
        refreshCredentials(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, refreshAchievements, refreshReputation, refreshNFTs, refreshCredentials, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasAchievements = useMemo(() => state.achievements.length > 0, [state.achievements.length]);
  const hasNFTs = useMemo(() => state.nfts.length > 0, [state.nfts.length]);
  const hasCredentials = useMemo(() => state.credentials.length > 0, [state.credentials.length]);
  const hasReputation = useMemo(() => state.reputation !== null, [state.reputation]);

  const verifiedAchievements = useMemo(() => 
    state.achievements.filter(achievement => achievement.isVerified),
    [state.achievements]
  );

  const stakedAchievements = useMemo(() => 
    state.achievements.filter(achievement => achievement.isStaked),
    [state.achievements]
  );

  const totalReputationScore = useMemo(() => 
    state.reputation?.score || 0,
    [state.reputation]
  );

  const canMintNFT = useMemo(() => 
    state.initialized && state.achievements.some(achievement => !achievement.isMinted),
    [state.initialized, state.achievements]
  );

  const canStake = useMemo(() => 
    state.initialized && state.achievements.some(achievement => !achievement.isStaked),
    [state.initialized, state.achievements]
  );

  const isConnectedToBlockchain = useMemo(() => 
    state.multiChainStatus.some(chain => chain.isConnected),
    [state.multiChainStatus]
  );

  // Auto-refresh data periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      refreshAchievements();
      refreshReputation();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [state.initialized, refreshAchievements, refreshReputation]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
    mintAchievementNFT,
    verifyAchievement,
    transferNFT,
    stakeAchievement,
    unstakeAchievement,
    createCredential,
    verifyCredential,
    generateZKProof,
    verifyZKProof,
    interactWithContract,
    getAchievements,
    refreshAchievements,
    refreshReputation,
    refreshNFTs,
    clearError,
    retry,
    isReady,
    hasAchievements,
    hasNFTs,
    hasCredentials,
    hasReputation,
    verifiedAchievements,
    stakedAchievements,
    totalReputationScore,
    canMintNFT,
    canStake,
    isConnectedToBlockchain,
  };
}
