/**
 * Gamification Rewards Component
 * 
 * Main UI component for displaying advanced gamification rewards including
 * cryptocurrency, NFTs, IoT device control, and real-world rewards.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useGamificationRewards } from '../hooks/useGamificationRewards';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from '../../../utils/dateFns';

interface GamificationRewardsProps {
  userId: string;
  onRewardPress?: (reward: any) => void;
  onCryptoPress?: (crypto: any) => void;
  onNFTPress?: (nft: any) => void;
  onIoTPress?: (device: any) => void;
}

export function GamificationRewards({ 
  userId, 
  onRewardPress, 
  onCryptoPress, 
  onNFTPress, 
  onIoTPress 
}: GamificationRewardsProps) {
  const {
    rewards,
    userRewards,
    cryptoRewards,
    nftRewards,
    IoTDevices,
    achievements,
    progress,
    loading,
    error,
    initialized,
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
    claimReward,
    purchaseReward,
    unlockReward,
    exchangeCrypto,
    mintNFT,
    controlIoTDevice,
    syncCryptoWallet,
    refreshRewards,
    clearError,
    retry,
  } = useGamificationRewards(userId);

  const [selectedTab, setSelectedTab] = useState<'rewards' | 'crypto' | 'nft' | 'iot' | 'achievements'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableCrypto: true,
        enableNFT: true,
        enableIoT: true,
        enableRealWorldRewards: true,
        cryptoNetworks: ['ethereum', 'bitcoin', 'polygon'],
        nftMarketplace: 'opensea',
      });
    }
  }, [initialized]);

  const initialize = async (config: any) => {
    // Implementation would call the initialize function from the hook
    console.log('Initializing gamification with config:', config);
  };

  // Handle reward actions
  const handleRewardPress = (reward: any) => {
    if (onRewardPress) {
      onRewardPress(reward);
    } else {
      showRewardDetails(reward);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    const success = await claimReward(rewardId);
    if (success) {
      Alert.alert('Success', 'Reward claimed successfully!');
    } else {
      Alert.alert('Error', 'Failed to claim reward');
    }
  };

  const handlePurchaseReward = async (rewardId: string) => {
    const success = await purchaseReward(rewardId);
    if (success) {
      Alert.alert('Success', 'Reward purchased successfully!');
    } else {
      Alert.alert('Error', 'Failed to purchase reward');
    }
  };

  const showRewardDetails = (reward: any) => {
    Alert.alert(
      reward.name,
      `${reward.description}\n\nValue: ${reward.value} points\nTier: ${reward.tier}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: reward.cost === 0 ? 'Claim' : 'Purchase', 
          onPress: () => reward.cost === 0 ? handleClaimReward(reward.id) : handlePurchaseReward(reward.id)
        },
      ]
    );
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading text="Loading Rewards..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="Rewards Error"
        description={error}
        onRetry={retry}
      />
    );
  }

  // Empty state
  if (!hasRewards && isReady) {
    return (
      <EmptyState
        icon="🎁"
        title="No Rewards Available"
        body="Complete achievements and challenges to unlock amazing rewards!"
        actionLabel="View Achievements"
        onAction={() => {}}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rewards & Achievements</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalValue}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{availableRewards.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{claimedRewards.length}</Text>
            <Text style={styles.statLabel}>Claimed</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rewards' && styles.activeTab]}
          onPress={() => setSelectedTab('rewards')}
        >
          <Text style={[styles.tabText, selectedTab === 'rewards' && styles.activeTabText]}>
            Rewards ({rewards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'crypto' && styles.activeTab]}
          onPress={() => setSelectedTab('crypto')}
        >
          <Text style={[styles.tabText, selectedTab === 'crypto' && styles.activeTabText]}>
            Crypto ({cryptoRewards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'nft' && styles.activeTab]}
          onPress={() => setSelectedTab('nft')}
        >
          <Text style={[styles.tabText, selectedTab === 'nft' && styles.activeTabText]}>
            NFTs ({nftRewards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'iot' && styles.activeTab]}
          onPress={() => setSelectedTab('iot')}
        >
          <Text style={[styles.tabText, selectedTab === 'iot' && styles.activeTabText]}>
            IoT ({IoTDevices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
            Achievements ({achievements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'rewards' && (
          <RewardsTab
            rewards={rewards}
            availableRewards={availableRewards}
            claimedRewards={claimedRewards}
            rewardsByCategory={rewardsByCategory}
            rewardsByTier={rewardsByTier}
            onRewardPress={handleRewardPress}
            onClaim={handleClaimReward}
            onPurchase={handlePurchaseReward}
          />
        )}

        {selectedTab === 'crypto' && (
          <CryptoTab
            cryptoRewards={cryptoRewards}
            onCryptoPress={onCryptoPress}
            onExchange={exchangeCrypto}
            onSync={syncCryptoWallet}
          />
        )}

        {selectedTab === 'nft' && (
          <NFTTab
            nftRewards={nftRewards}
            achievements={achievements}
            onNFTPress={onNFTPress}
            onMint={mintNFT}
          />
        )}

        {selectedTab === 'iot' && (
          <IoTTab
            IoTDevices={IoTDevices}
            onIoTPress={onIoTPress}
            onControl={controlIoTDevice}
          />
        )}

        {selectedTab === 'achievements' && (
          <AchievementsTab
            achievements={achievements}
            progress={progress}
            nextRewardProgress={nextRewardProgress}
            onAchievementPress={onRewardPress}
          />
        )}
      </ScrollView>
    </View>
  );
}

// Rewards Tab Component
function RewardsTab({ 
  rewards, 
  availableRewards, 
  claimedRewards, 
  rewardsByCategory, 
  rewardsByTier,
  onRewardPress,
  onClaim,
  onPurchase 
}: any) {
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all');

  const filteredRewards = useMemo(() => {
    switch (filter) {
      case 'available':
        return availableRewards;
      case 'claimed':
        return claimedRewards;
      default:
        return rewards;
    }
  }, [filter, rewards, availableRewards, claimedRewards]);

  return (
    <View style={styles.tabContent}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'available', 'claimed'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({filterType === 'all' ? rewards.length : filterType === 'available' ? availableRewards.length : claimedRewards.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rewards List */}
      {filteredRewards.length === 0 ? (
        <EmptyState
          icon="🎁"
          title={`No ${filter} rewards`}
          body={filter === 'all' ? 'Complete achievements to unlock rewards' : `No ${filter} rewards available`}
        />
      ) : (
        filteredRewards.map((reward: any) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onPress={() => onRewardPress(reward)}
            onClaim={() => onClaim(reward.id)}
            onPurchase={() => onPurchase(reward.id)}
          />
        ))
      )}
    </View>
  );
}

// Reward Card Component
function RewardCard({ reward, onPress, onClaim, onPurchase }: any) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'LEGENDARY': return '#FFD700';
      case 'EPIC': return '#9B59B6';
      case 'RARE': return '#3498DB';
      case 'COMMON': return '#95A5A6';
      default: return '#BDC3C7';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CRYPTOCURRENCY': return '₿';
      case 'NFT': return '🎨';
      case 'IOT_DEVICE': return '🏠';
      case 'EXPERIENCE': return '⭐';
      case 'DIGITAL_GOODS': return '💻';
      case 'REAL_WORLD': return '🌍';
      default: return '🎁';
    }
  };

  return (
    <Card style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View style={styles.rewardTitleContainer}>
          <Text style={styles.rewardTitle}>{reward.name}</Text>
          <View style={styles.rewardBadges}>
            <Badge 
              size="sm"
              variant={getTierColor(reward.tier) === '#27AE60' ? 'success' : getTierColor(reward.tier) === '#E74C3C' ? 'error' : 'secondary'}
            >
              {reward.tier}
            </Badge>
            <Badge 
              size="sm"
            >
              {getCategoryIcon(reward.category) + ' ' + reward.category}
            </Badge>
          </View>
        </View>
        <Text style={styles.rewardValue}>{reward.value} pts</Text>
      </View>

      <Text style={styles.rewardDescription}>{reward.description}</Text>

      {reward.requirements && (
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          {reward.requirements.slice(0, 2).map((req: any, index: number) => (
            <Text key={index} style={styles.requirementText}>• {req.description}</Text>
          ))}
        </View>
      )}

      <View style={styles.rewardFooter}>
        <Text style={styles.rewardCost}>
          {reward.cost === 0 ? 'FREE' : `${reward.cost} points`}
        </Text>
        <View style={styles.rewardActions}>
          {reward.unlocked && !reward.claimed && (
            <TouchableOpacity
              style={[styles.rewardActionButton, reward.cost === 0 ? styles.claimButton : styles.purchaseButton]}
              onPress={() => reward.cost === 0 ? onClaim() : onPurchase()}
            >
              <Text style={styles.rewardActionText}>
                {reward.cost === 0 ? 'Claim' : 'Purchase'}
              </Text>
            </TouchableOpacity>
          )}
          {reward.claimed && (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>Claimed</Text>
            </View>
          )}
          {!reward.unlocked && (
            <TouchableOpacity style={styles.rewardActionButton} onPress={onPress}>
              <Text style={styles.rewardActionText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

// Crypto Tab Component
function CryptoTab({ cryptoRewards, onCryptoPress, onExchange, onSync }: any) {
  if (cryptoRewards.length === 0) {
    return (
      <EmptyState
        title="No Crypto Rewards"
        message="Unlock achievements to earn cryptocurrency rewards!"
        icon="₿"
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      <Card style={styles.cryptoHeader}>
        <Text style={styles.cryptoTitle}>Cryptocurrency Portfolio</Text>
        <Text style={styles.cryptoSubtitle}>Track and exchange your crypto earnings</Text>
        <Button
          onPress={() => onSync('0x123...')}
          style={styles.syncButton}
        >
          Sync Wallet
        </Button>
      </Card>

      {cryptoRewards.map((crypto: any) => (
        <Card key={crypto.id} style={styles.cryptoCard}>
          <View style={styles.cryptoHeader}>
            <Text style={styles.cryptoName}>{crypto.name}</Text>
            <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
          </View>
          <Text style={styles.cryptoAmount}>{crypto.amount} {crypto.symbol}</Text>
          <Text style={styles.cryptoValue}>${crypto.valueUSD} USD</Text>
          <View style={styles.cryptoActions}>
            <TouchableOpacity style={styles.cryptoActionButton}>
              <Text style={styles.cryptoActionText}>Exchange</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cryptoActionButton}>
              <Text style={styles.cryptoActionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );
}

// NFT Tab Component
function NFTTab({ nftRewards, achievements, onNFTPress, onMint }: any) {
  return (
    <View style={styles.tabContent}>
      <Card style={styles.nftHeader}>
        <Text style={styles.nftTitle}>NFT Collection</Text>
        <Text style={styles.nftSubtitle}>Mint and trade your achievement NFTs</Text>
        <Button
          onPress={() => onMint('achievement_123')}
          style={styles.mintButton}
        >
          Mint New NFT
        </Button>
      </Card>

      {nftRewards.length === 0 ? (
        <EmptyState
          icon="🎨"
          title="No NFTs Yet"
          body="Mint your first achievement NFT to start your collection!"
        />
      ) : (
        <View style={styles.nftGrid}>
          {nftRewards.map((nft: any) => (
            <Card key={nft.id} style={styles.nftCard}>
              <View style={styles.nftImage}>
                <Text style={styles.nftImagePlaceholder}>🎨</Text>
              </View>
              <Text style={styles.nftName}>{nft.name}</Text>
              <Text style={styles.nftCollection}>{nft.collection}</Text>
              <TouchableOpacity style={styles.nftActionButton}>
                <Text style={styles.nftActionText}>View</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

// IoT Tab Component
function IoTTab({ IoTDevices, onIoTPress, onControl }: any) {
  if (IoTDevices.length === 0) {
    return (
      <EmptyState
        icon="🏠"
        title="No IoT Devices"
        body="Connect smart devices to control them with your achievements!"
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      {IoTDevices.map((device: any) => (
        <Card key={device.id} style={styles.iotCard}>
          <View style={styles.iotHeader}>
            <Text style={styles.iotName}>{device.name}</Text>
            <Text style={[styles.iotStatus, device.online && styles.iotOnline]}>
              {device.online ? 'Online' : 'Offline'}
            </Text>
          </View>
          <Text style={styles.iotType}>{device.type}</Text>
          <Text style={styles.iotDescription}>{device.description}</Text>
          <View style={styles.iotActions}>
            <TouchableOpacity 
              style={styles.iotActionButton}
              onPress={() => onControl(device.id, 'toggle')}
            >
              <Text style={styles.iotActionText}>Toggle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iotActionButton}>
              <Text style={styles.iotActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );
}

// Achievements Tab Component
function AchievementsTab({ achievements, progress, nextRewardProgress, onAchievementPress }: any) {
  return (
    <View style={styles.tabContent}>
      {/* Next Reward Progress */}
      {nextRewardProgress && (
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>Next Reward Progress</Text>
          <Text style={styles.progressDescription}>{nextRewardProgress.description}</Text>
          <ProgressBar progress={nextRewardProgress.progress} />
          <Text style={styles.progressText}>
            {nextRewardProgress.current}/{nextRewardProgress.required} - {Math.round(nextRewardProgress.progress)}%
          </Text>
        </Card>
      )}

      {/* Achievements List */}
      {achievements.map((achievement: any) => (
        <Card key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Badge 
              size="sm"
              variant={achievement.completed ? 'success' : 'secondary'}
            >
              {achievement.completed ? '✅' : '🔒'}
            </Badge>
          </View>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          {achievement.reward && (
            <Text style={styles.achievementReward}>Reward: {achievement.reward.name}</Text>
          )}
          <TouchableOpacity style={styles.achievementActionButton}>
            <Text style={styles.achievementActionText}>View Details</Text>
          </TouchableOpacity>
        </Card>
      ))}
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
  rewardCard: {
    marginBottom: 16,
    padding: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardTitleContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 12,
  },
  requirementsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#34495E',
    marginBottom: 4,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  rewardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  claimButton: {
    backgroundColor: '#27AE60',
  },
  purchaseButton: {
    backgroundColor: '#F39C12',
  },
  rewardActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  claimedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#BDC3C7',
    borderRadius: 4,
  },
  claimedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cryptoHeader: {
    padding: 20,
    marginBottom: 16,
  },
  cryptoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  cryptoSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  syncButton: {
    backgroundColor: '#3498DB',
  },
  cryptoCard: {
    padding: 16,
    marginBottom: 16,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cryptoSymbol: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  cryptoAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498DB',
    marginVertical: 8,
  },
  cryptoValue: {
    fontSize: 14,
    color: '#27AE60',
  },
  cryptoActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cryptoActionButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#3498DB',
    borderRadius: 4,
    alignItems: 'center',
  },
  cryptoActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nftHeader: {
    padding: 20,
    marginBottom: 16,
  },
  nftTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  nftSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  mintButton: {
    backgroundColor: '#9B59B6',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  nftCard: {
    width: '48%',
    padding: 12,
    alignItems: 'center',
  },
  nftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nftImagePlaceholder: {
    fontSize: 24,
  },
  nftName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  nftCollection: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
  },
  nftActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  nftActionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  iotCard: {
    padding: 16,
    marginBottom: 16,
  },
  iotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  iotStatus: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  iotOnline: {
    color: '#27AE60',
  },
  iotType: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  iotDescription: {
    fontSize: 12,
    color: '#34495E',
    marginBottom: 12,
  },
  iotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iotActionButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#3498DB',
    borderRadius: 4,
    alignItems: 'center',
  },
  iotActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressCard: {
    padding: 20,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#3498DB',
    textAlign: 'center',
    marginTop: 8,
  },
  achievementCard: {
    padding: 16,
    marginBottom: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  achievementReward: {
    fontSize: 12,
    color: '#27AE60',
    marginBottom: 12,
  },
  achievementActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  achievementActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
