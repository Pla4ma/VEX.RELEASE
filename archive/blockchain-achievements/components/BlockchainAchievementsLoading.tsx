/**
 * Blockchain Achievements Loading Component
 * 
 * Loading state component for blockchain achievements with animated indicators
 * and progress feedback for different loading scenarios.
 */

import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

interface BlockchainAchievementsLoadingProps {
  type?: 'initial' | 'minting' | 'verification' | 'staking' | 'transfer' | 'credential';
  message?: string;
  progress?: number;
}

export function BlockchainAchievementsLoading({ 
  type = 'initial', 
  message,
  progress 
}: BlockchainAchievementsLoadingProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'initial':
        return 'Initializing Blockchain Achievements...';
      case 'minting':
        return 'Minting achievement NFT...';
      case 'verification':
        return 'Verifying achievement on blockchain...';
      case 'staking':
        return 'Staking achievement tokens...';
      case 'transfer':
        return 'Transferring NFT ownership...';
      case 'credential':
        return 'Creating decentralized credential...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingSteps = () => {
    switch (type) {
      case 'initial':
        return [
          'Connecting to blockchain networks',
          'Loading achievement data',
          'Verifying wallet connections',
          'Preparing smart contracts',
        ];
      case 'minting':
        return [
          'Preparing NFT metadata',
          'Connecting to smart contract',
          'Executing mint transaction',
          'Confirming on blockchain',
        ];
      case 'verification':
        return [
          'Validating achievement data',
          'Generating verification proof',
          'Submitting to blockchain',
          'Confirming verification',
        ];
      case 'staking':
        return [
          'Calculating stake amount',
          'Approving token transfer',
          'Executing stake transaction',
          'Confirming stake status',
        ];
      case 'transfer':
        return [
          'Validating recipient address',
          'Preparing transfer transaction',
          'Executing NFT transfer',
          'Confirming ownership change',
        ];
      case 'credential':
        return [
          'Generating credential data',
          'Creating digital signature',
          'Storing on blockchain',
          'Issuing credential',
        ];
      default:
        return ['Connecting...', 'Processing...', 'Finalizing...'];
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Blockchain Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.blockchainIcon}>⛓️</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: '#9B59B6',
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Loading Text */}
        <Text style={styles.loadingText}>{getLoadingMessage()}</Text>

        {/* Progress Bar */}
        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {/* Loading Steps */}
        <View style={styles.stepsContainer}>
          {getLoadingSteps().map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepDot,
                  { backgroundColor: progress !== undefined && progress > (index + 1) * 25 ? '#27AE60' : '#BDC3C7' }
                ]} />
              </View>
              <Text style={[
                styles.stepText,
                { color: progress !== undefined && progress > (index + 1) * 25 ? '#2C3E50' : '#95A5A6' }
              ]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Skeleton Content */}
        <View style={styles.skeletonContainer}>
          <Skeleton height={80} style={styles.skeletonCard} />
          <Skeleton height={80} style={styles.skeletonCard} />
          <Skeleton height={80} style={styles.skeletonCard} />
        </View>

        {/* Blockchain Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Blockchain Tip:</Text>
          <Text style={styles.tipsText}>
            Your achievements are securely stored on the blockchain with full ownership and verifiability.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Blockchain Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureName}>NFT Minting</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureName}>Verification</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📜</Text>
              <Text style={styles.featureName}>Credentials</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔐</Text>
              <Text style={styles.featureName}>ZK Proofs</Text>
            </View>
          </View>
        </View>
      </Animated.View>
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
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  blockchainIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E1E8ED',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9B59B6',
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepIndicator: {
    marginRight: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  skeletonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  skeletonCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  tipsContainer: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2B4DE',
    marginBottom: 30,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#9B59B6',
    lineHeight: 18,
  },
  featuresContainer: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: 14,
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
    padding: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
});
