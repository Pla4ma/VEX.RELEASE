/**
 * Blockchain Achievements Component
 * 
 * Main UI component for blockchain achievements with multi-chain integration,
 * NFT minting, reputation tracking, and decentralized credentials.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useBlockchainAchievements } from '../hooks/useBlockchainAchievements';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

interface BlockchainAchievementsProps {
  userId: string;
  onAchievementPress?: (achievement: any) => void;
  onNFTPress?: (nft: any) => void;
  onCredentialPress?: (credential: any) => void;
}

export function BlockchainAchievements({ 
  userId, 
  onAchievementPress, 
  onNFTPress, 
  onCredentialPress 
}: BlockchainAchievementsProps) {
  const {
    achievements,
    nfts,
    reputation,
    credentials,
    verifications,
    multiChainStatus,
    zkProofs,
    smartContracts,
    loading,
    error,
    initialized,
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
  } = useBlockchainAchievements(userId);

  const [selectedTab, setSelectedTab] = useState<'achievements' | 'nfts' | 'credentials' | 'reputation'>('achievements');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableMultiChain: true,
        enableNFTMinting: true,
        enableZKProofs: true,
        enableReputation: true,
        enableCredentials: true,
        supportedChains: ['ethereum', 'polygon', 'arbitrum'],
        defaultChain: 'ethereum',
      });
    }
  }, [initialized]);

  // Handle achievement actions
  const handleMintNFT = async (achievementId: string) => {
    const nft = await mintAchievementNFT(achievementId);
    if (nft) {
      Alert.alert('Success', 'Achievement NFT minted successfully!');
      setSelectedTab('nfts');
    } else {
      Alert.alert('Error', 'Failed to mint achievement NFT');
    }
  };

  const handleVerifyAchievement = async (achievementId: string) => {
    const result = await verifyAchievement(achievementId);
    if (result) {
      Alert.alert('Success', 'Achievement verified successfully!');
    } else {
      Alert.alert('Error', 'Failed to verify achievement');
    }
  };

  const handleStakeAchievement = async (achievementId: string, amount: number) => {
    const success = await stakeAchievement(achievementId, amount);
    if (success) {
      Alert.alert('Success', 'Achievement staked successfully!');
    } else {
      Alert.alert('Error', 'Failed to stake achievement');
    }
  };

  const handleUnstakeAchievement = async (achievementId: string) => {
    const success = await unstakeAchievement(achievementId);
    if (success) {
      Alert.alert('Success', 'Achievement unstaked successfully!');
    } else {
      Alert.alert('Error', 'Failed to unstake achievement');
    }
  };

  const handleCreateCredential = async (type: string, data: any) => {
    const credential = await createCredential({
      type,
      data,
      issuer: 'VEX Blockchain System',
      subject: userId,
    });

    if (credential) {
      Alert.alert('Success', 'Credential created successfully!');
      setSelectedTab('credentials');
      setShowCredentialModal(false);
    } else {
      Alert.alert('Error', 'Failed to create credential');
    }
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading message="Loading Blockchain Achievements..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="Blockchain Achievement Error"
        message={error}
        onRetry={retry}
        onDismiss={clearError}
      />
    );
  }

  // Empty state
  if (!hasAchievements && isReady) {
    return (
      <EmptyState
        title="Welcome to Blockchain Achievements"
        message="Earn, mint, and verify your achievements on the blockchain with NFTs and decentralized credentials."
        icon="🏆"
        action={{
          title: "Start Earning",
          onPress: () => {},
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Blockchain Achievements</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{nfts.length}</Text>
            <Text style={styles.statLabel}>NFTs</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalReputationScore}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
        </View>
      </View>

      {/* Blockchain Connection Status */}
      <View style={styles.connectionContainer}>
        <View style={styles.connectionHeader}>
          <Text style={styles.connectionTitle}>Blockchain Status</Text>
          <Badge 
            text={isConnectedToBlockchain ? 'Connected' : 'Disconnected'} 
            color={isConnectedToBlockchain ? '#27AE60' : '#E74C3C'} 
            size="small" 
          />
        </View>
        {multiChainStatus.length > 0 && (
          <View style={styles.chainList}>
            {multiChainStatus.map((chain) => (
              <View key={chain.name} style={styles.chainItem}>
                <Text style={styles.chainName}>{chain.name}</Text>
                <Badge 
                  text={chain.isConnected ? 'Active' : 'Inactive'} 
                  color={chain.isConnected ? '#27AE60' : '#95A5A6'} 
                  size="small" 
                />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Reputation Banner */}
      {hasReputation && (
        <Card style={styles.reputationBanner}>
          <View style={styles.reputationHeader}>
            <Text style={styles.reputationTitle}>Reputation Score</Text>
            <Badge text="Verified" color="#9B59B6" size="small" />
          </View>
          <Text style={styles.reputationScore}>{totalReputationScore}</Text>
          <ProgressBar 
            progress={(totalReputationScore / 1000) * 100} 
            color="#9B59B6"
          />
          <Text style={styles.reputationDescription}>
            Top {Math.floor((totalReputationScore / 1000) * 100)}% of achievers
          </Text>
        </Card>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
            Achievements ({achievements.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'nfts' && styles.activeTab]}
          onPress={() => setSelectedTab('nfts')}
        >
          <Text style={[styles.tabText, selectedTab === 'nfts' && styles.activeTabText]}>
            NFTs ({nfts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'credentials' && styles.activeTab]}
          onPress={() => setSelectedTab('credentials')}
        >
          <Text style={[styles.tabText, selectedTab === 'credentials' && styles.activeTabText]}>
            Credentials ({credentials.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reputation' && styles.activeTab]}
          onPress={() => setSelectedTab('reputation')}
        >
          <Text style={[styles.tabText, selectedTab === 'reputation' && styles.activeTabText]}>
            Reputation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'achievements' && (
          <AchievementsTab
            achievements={achievements}
            verifiedAchievements={verifiedAchievements}
            stakedAchievements={stakedAchievements}
            onAchievementPress={onAchievementPress}
            onMintNFT={handleMintNFT}
            onVerify={handleVerifyAchievement}
            onStake={handleStakeAchievement}
            onUnstake={handleUnstakeAchievement}
          />
        )}

        {selectedTab === 'nfts' && (
          <NFTsTab
            nfts={nfts}
            onNFTPress={onNFTPress}
            onTransfer={transferNFT}
          />
        )}

        {selectedTab === 'credentials' && (
          <CredentialsTab
            credentials={credentials}
            onCredentialPress={onCredentialPress}
            onVerify={verifyCredential}
            onCreate={() => setShowCredentialModal(true)}
          />
        )}

        {selectedTab === 'reputation' && (
          <ReputationTab
            reputation={reputation}
            verifications={verifications}
            zkProofs={zkProofs}
            onGenerateZKProof={generateZKProof}
            onVerifyZKProof={verifyZKProof}
          />
        )}
      </ScrollView>

      {/* Mint NFT Modal */}
      <Modal
        visible={showMintModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMintModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mint Achievement NFT</Text>
            <Text style={styles.modalDescription}>
              Convert your achievement into a unique NFT on the blockchain.
            </Text>
            
            <Button
              title="Mint NFT"
              onPress={() => setShowMintModal(false)}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowMintModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Stake Modal */}
      <Modal
        visible={showStakeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStakeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stake Achievement</Text>
            <Text style={styles.modalDescription}>
              Stake your achievement tokens to earn rewards and increase reputation.
            </Text>
            
            <Button
              title="Stake Achievement"
              onPress={() => setShowStakeModal(false)}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowStakeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Credential Modal */}
      <Modal
        visible={showCredentialModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCredentialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Credential</Text>
            <Text style={styles.modalDescription}>
              Create a decentralized credential for your achievements.
            </Text>
            
            <Button
              title="Create Credential"
              onPress={() => handleCreateCredential('achievement', {})}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowCredentialModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Achievements Tab Component
function AchievementsTab({ 
  achievements, 
  verifiedAchievements, 
  stakedAchievements, 
  onAchievementPress, 
  onMintNFT, 
  onVerify, 
  onStake, 
  onUnstake 
}: any) {
  const [filter, setFilter] = useState<'all' | 'verified' | 'staked' | 'unminted'>('all');

  const filteredAchievements = useMemo(() => {
    switch (filter) {
      case 'verified':
        return verifiedAchievements;
      case 'staked':
        return stakedAchievements;
      case 'unminted':
        return achievements.filter(achievement => !achievement.isMinted);
      default:
        return achievements;
    }
  }, [filter, achievements, verifiedAchievements, stakedAchievements]);

  return (
    <View style={styles.tabContent}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'verified', 'staked', 'unminted'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Achievements List */}
      {filteredAchievements.length === 0 ? (
        <EmptyState
          title={`No ${filter} achievements`}
          message={filter === 'all' ? 'Start earning achievements' : `No ${filter} achievements available`}
          icon="🏆"
        />
      ) : (
        filteredAchievements.map((achievement: any) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onPress={() => onAchievementPress?.(achievement)}
            onMint={() => onMintNFT(achievement.id)}
            onVerify={() => onVerify(achievement.id)}
            onStake={() => onStake(achievement.id, 100)}
            onUnstake={() => onUnstake(achievement.id)}
          />
        ))
      )}
    </View>
  );
}

// Achievement Card Component
function AchievementCard({ 
  achievement, 
  onPress, 
  onMint, 
  onVerify, 
  onStake, 
  onUnstake 
}: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return '#27AE60';
      case 'STAKED': return '#9B59B6';
      case 'MINTED': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  return (
    <Card style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <View style={styles.achievementBadges}>
          {achievement.isVerified && (
            <Badge text="Verified" color="#27AE60" size="small" />
          )}
          {achievement.isMinted && (
            <Badge text="NFT" color="#3498DB" size="small" />
          )}
          {achievement.isStaked && (
            <Badge text="Staked" color="#9B59B6" size="small" />
          )}
        </View>
      </View>
      
      <Text style={styles.achievementDescription}>{achievement.description}</Text>
      <Text style={styles.achievementDate}>
        Earned {formatDistanceToNow(new Date(achievement.earnedAt), { addSuffix: true })}
      </Text>

      <View style={styles.achievementInfo}>
        <Text style={styles.achievementInfoText}>
          Value: {achievement.value} points
        </Text>
        <Text style={styles.achievementInfoText}>
          Rarity: {achievement.rarity}
        </Text>
      </View>

      <View style={styles.achievementFooter}>
        <TouchableOpacity style={styles.achievementDetailsButton} onPress={onPress}>
          <Text style={styles.achievementDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        <View style={styles.achievementActions}>
          {!achievement.isMinted && (
            <TouchableOpacity style={styles.achievementActionButton} onPress={onMint}>
              <Text style={styles.achievementActionText}>Mint</Text>
            </TouchableOpacity>
          )}
          {!achievement.isVerified && (
            <TouchableOpacity style={styles.achievementActionButton} onPress={onVerify}>
              <Text style={styles.achievementActionText}>Verify</Text>
            </TouchableOpacity>
          )}
          {achievement.isStaked ? (
            <TouchableOpacity style={styles.achievementActionButton} onPress={onUnstake}>
              <Text style={styles.achievementActionText}>Unstake</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.achievementActionButton} onPress={onStake}>
              <Text style={styles.achievementActionText}>Stake</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

// NFTs Tab Component
function NFTsTab({ nfts, onNFTPress, onTransfer }: any) {
  return (
    <View style={styles.tabContent}>
      {nfts.length === 0 ? (
        <EmptyState
          title="No NFTs"
          message="Mint your achievements as NFTs to own them on the blockchain"
          icon="🎨"
        />
      ) : (
        nfts.map((nft: any) => (
          <NFTCard
            key={nft.id}
            nft={nft}
            onPress={() => onNFTPress?.(nft)}
            onTransfer={() => onTransfer(nft.id, '0x...')}
          />
        ))
      )}
    </View>
  );
}

// NFT Card Component
function NFTCard({ nft, onPress, onTransfer }: any) {
  return (
    <Card style={styles.nftCard}>
      <View style={styles.nftHeader}>
        <Text style={styles.nftTitle}>{nft.name}</Text>
        <Badge text={nft.blockchain} color="#3498DB" size="small" />
      </View>
      
      <Text style={styles.nftDescription}>{nft.description}</Text>
      <Text style={styles.nftDate}>
        Minted {formatDistanceToNow(new Date(nft.mintedAt), { addSuffix: true })}
      </Text>

      <View style={styles.nftInfo}>
        <Text style={styles.nftInfoText}>
          Token ID: {nft.tokenId}
        </Text>
        <Text style={styles.nftInfoText}>
          Contract: {nft.contractAddress.slice(0, 6)}...
        </Text>
      </View>

      <View style={styles.nftFooter}>
        <TouchableOpacity style={styles.nftDetailsButton} onPress={onPress}>
          <Text style={styles.nftDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        <View style={styles.nftActions}>
          <TouchableOpacity style={styles.nftActionButton} onPress={onTransfer}>
            <Text style={styles.nftActionText}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

// Credentials Tab Component
function CredentialsTab({ credentials, onCredentialPress, onVerify, onCreate }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.credentialHeader}>
        <Text style={styles.credentialHeaderTitle}>Decentralized Credentials</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreate}>
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {credentials.length === 0 ? (
        <EmptyState
          title="No Credentials"
          message="Create decentralized credentials for your achievements"
          icon="📜"
        />
      ) : (
        credentials.map((credential: any) => (
          <CredentialCard
            key={credential.id}
            credential={credential}
            onPress={() => onCredentialPress?.(credential)}
            onVerify={() => onVerify(credential.id)}
          />
        ))
      )}
    </View>
  );
}

// Credential Card Component
function CredentialCard({ credential, onPress, onVerify }: any) {
  return (
    <Card style={styles.credentialCard}>
      <View style={styles.credentialHeader}>
        <Text style={styles.credentialTitle}>{credential.type}</Text>
        <Badge 
          text={credential.verified ? 'Verified' : 'Pending'} 
          color={credential.verified ? '#27AE60' : '#F39C12'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.credentialDescription}>{credential.description}</Text>
      <Text style={styles.credentialIssuer}>Issuer: {credential.issuer}</Text>

      <View style={styles.credentialFooter}>
        <TouchableOpacity style={styles.credentialDetailsButton} onPress={onPress}>
          <Text style={styles.credentialDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        {!credential.verified && (
          <TouchableOpacity style={styles.credentialActionButton} onPress={onVerify}>
            <Text style={styles.credentialActionText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

// Reputation Tab Component
function ReputationTab({ reputation, verifications, zkProofs, onGenerateZKProof, onVerifyZKProof }: any) {
  return (
    <View style={styles.tabContent}>
      <Card style={styles.reputationCard}>
        <Text style={styles.reputationCardTitle}>Reputation Score</Text>
        <Text style={styles.reputationCardScore}>{reputation?.score || 0}</Text>
        <ProgressBar 
          progress={(reputation?.score || 0) / 1000 * 100} 
          color="#9B59B6"
        />
        <Text style={styles.reputationCardDescription}>
          Your reputation is calculated based on verified achievements and community recognition.
        </Text>
      </Card>

      <Card style={styles.verificationsCard}>
        <Text style={styles.verificationsTitle}>Recent Verifications</Text>
        {verifications.length === 0 ? (
          <Text style={styles.verificationsEmpty}>No verifications yet</Text>
        ) : (
          verifications.slice(0, 5).map((verification: any) => (
            <View key={verification.id} style={styles.verificationItem}>
              <Text style={styles.verificationText}>
                {verification.achievementId} verified by {verification.verifier}
              </Text>
              <Text style={styles.verificationTime}>
                {formatDistanceToNow(new Date(verification.timestamp), { addSuffix: true })}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Card style={styles.zkProofsCard}>
        <Text style={styles.zkProofsTitle}>Zero-Knowledge Proofs</Text>
        <Text style={styles.zkProofsDescription}>
          Generate ZK proofs to verify achievements without revealing sensitive data.
        </Text>
        <TouchableOpacity style={styles.zkProofButton} onPress={() => onGenerateZKProof('achievement-id', 'verifier-address')}>
          <Text style={styles.zkProofButtonText}>Generate ZK Proof</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  connectionContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  chainList: {
    gap: 8,
  },
  chainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chainName: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  reputationBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  reputationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reputationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  reputationScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginBottom: 8,
  },
  reputationDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498DB',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#3498DB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#3498DB',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  achievementCard: {
    padding: 16,
    marginBottom: 16,
  },
  achievementHeader: {
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  achievementBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 8,
  },
  achievementInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  achievementInfoText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  achievementDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  achievementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  achievementActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  achievementActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nftCard: {
    padding: 16,
    marginBottom: 16,
  },
  nftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  nftDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  nftDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 8,
  },
  nftInfo: {
    marginBottom: 12,
  },
  nftInfoText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  nftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nftDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  nftDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  nftActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  nftActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  credentialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  credentialHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27AE60',
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  credentialCard: {
    padding: 16,
    marginBottom: 16,
  },
  credentialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  credentialDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  credentialIssuer: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 12,
  },
  credentialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credentialDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  credentialDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  credentialActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F39C12',
    borderRadius: 4,
  },
  credentialActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reputationCard: {
    padding: 20,
    marginBottom: 16,
  },
  reputationCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  reputationCardScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginBottom: 12,
  },
  reputationCardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 12,
    lineHeight: 20,
  },
  verificationsCard: {
    padding: 20,
    marginBottom: 16,
  },
  verificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  verificationsEmpty: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    padding: 20,
  },
  verificationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  verificationText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  verificationTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  zkProofsCard: {
    padding: 20,
  },
  zkProofsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  zkProofsDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  zkProofButton: {
    padding: 12,
    backgroundColor: '#9B59B6',
    borderRadius: 6,
    alignItems: 'center',
  },
  zkProofButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#3498DB',
    marginBottom: 12,
  },
  modalCancel: {
    alignItems: 'center',
    padding: 12,
  },
  modalCancelText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
});
