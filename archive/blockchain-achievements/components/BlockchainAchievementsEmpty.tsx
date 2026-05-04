/**
 * Blockchain Achievements Empty Component
 * 
 * Empty state component for blockchain achievements when no data is available,
 * with helpful guidance and action prompts.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../../../components/primitives/Button';

interface BlockchainAchievementsEmptyProps {
  type?: 'achievements' | 'nfts' | 'credentials' | 'reputation' | 'all';
  onAction?: () => void;
  customMessage?: string;
  customIcon?: string;
}

export function BlockchainAchievementsEmpty({ 
  type = 'all', 
  onAction,
  customMessage,
  customIcon 
}: BlockchainAchievementsEmptyProps) {
  const getEmptyState = () => {
    switch (type) {
      case 'achievements':
        return {
          icon: customIcon || '🏆',
          title: 'No Blockchain Achievements',
          message: customMessage || 'Start earning achievements to mint them as NFTs on the blockchain.',
          actionText: 'Start Earning',
          tips: [
            'Complete productivity goals',
            'Earn reputation points',
            'Verify achievements on-chain',
            'Mint achievement NFTs',
          ],
        };
      case 'nfts':
        return {
          icon: customIcon || '🎨',
          title: 'No Achievement NFTs',
          message: customMessage || 'Mint your achievements as unique NFTs to own them on the blockchain.',
          actionText: 'Mint NFTs',
          tips: [
            'Select achievements to mint',
            'Choose blockchain network',
            'Pay gas fees',
            'Own your achievements forever',
          ],
        };
      case 'credentials':
        return {
          icon: customIcon || '📜',
          title: 'No Decentralized Credentials',
          message: customMessage || 'Create verifiable credentials for your achievements and skills.',
          actionText: 'Create Credentials',
          tips: [
            'Generate proof of achievement',
            'Store credentials on-chain',
            'Share with employers',
            'Control your data',
          ],
        };
      case 'reputation':
        return {
          icon: customIcon || '⭐',
          title: 'No Reputation Score',
          message: customMessage || 'Build your reputation through verified achievements and community recognition.',
          actionText: 'Build Reputation',
          tips: [
            'Verify achievements',
            'Stake achievement tokens',
            'Get community endorsements',
            'Increase reputation score',
          ],
        };
      default:
        return {
          icon: customIcon || '⛓️',
          title: 'Welcome to Blockchain Achievements',
          message: customMessage || 'Start your journey with blockchain-verified achievements and NFTs.',
          actionText: 'Get Started',
          tips: [
            'Earn achievements in productivity',
            'Mint them as NFTs',
            'Build your reputation',
            'Create verifiable credentials',
          ],
        };
    }
  };

  const emptyState = getEmptyState();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{emptyState.icon}</Text>
        </View>

        {/* Title and Message */}
        <Text style={styles.title}>{emptyState.title}</Text>
        <Text style={styles.message}>{emptyState.message}</Text>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title={emptyState.actionText}
            onPress={onAction || (() => {})}
            style={styles.actionButton}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick Tips:</Text>
          {emptyState.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Blockchain Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureName}>NFT Minting</Text>
              <Text style={styles.featureDescription}>Own your achievements</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureName}>Verification</Text>
              <Text style={styles.featureDescription}>On-chain verification</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📜</Text>
              <Text style={styles.featureName}>Credentials</Text>
              <Text style={styles.featureDescription}>Verifiable credentials</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔐</Text>
              <Text style={styles.featureName}>ZK Proofs</Text>
              <Text style={styles.featureDescription}>Privacy-preserving proofs</Text>
            </View>
          </View>
        </View>

        {/* Blockchain Networks */}
        <View style={styles.networksContainer}>
          <Text style={styles.networksTitle}>Supported Networks:</Text>
          <View style={styles.networksList}>
            <View style={styles.networkItem}>
              <Text style={styles.networkIcon}>🔷</Text>
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>Ethereum</Text>
                <Text style={styles.networkDesc}>Main network for NFTs</Text>
              </View>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkIcon}>🟣</Text>
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>Polygon</Text>
                <Text style={styles.networkDesc}>Low-cost transactions</Text>
              </View>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkIcon}>🔵</Text>
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>Arbitrum</Text>
                <Text style={styles.networkDesc}>Layer 2 scaling</Text>
              </View>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkIcon}>🟢</Text>
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>BSC</Text>
                <Text style={styles.networkDesc}>Fast transactions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why Blockchain Achievements?</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• True ownership of your achievements</Text>
            <Text style={styles.benefitItem}>• Verifiable proof of accomplishments</Text>
            <Text style={styles.benefitItem}>• Portable across platforms</Text>
            <Text style={styles.benefitItem}>• Tamper-proof record keeping</Text>
            <Text style={styles.benefitItem}>• Privacy-preserving verification</Text>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Start building your blockchain-verified achievement portfolio today. Your accomplishments deserve to be permanently recorded and owned by you.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionContainer: {
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#9B59B6',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  featuresContainer: {
    marginBottom: 32,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  networksContainer: {
    marginBottom: 32,
    width: '100%',
  },
  networksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  networksList: {
    gap: 12,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  networkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  networkDesc: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  benefitsContainer: {
    marginBottom: 32,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  encouragementContainer: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2B4DE',
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
});
