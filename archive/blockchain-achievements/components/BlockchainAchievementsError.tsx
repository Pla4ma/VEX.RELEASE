/**
 * Blockchain Achievements Error Component
 * 
 * Error state component for blockchain achievements with different error types,
 * retry functionality, and helpful error messages.
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';

interface BlockchainAchievementsErrorProps {
  error: string;
  type?: 'network' | 'wallet' | 'contract' | 'minting' | 'verification' | 'staking' | 'transfer' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function BlockchainAchievementsError({ 
  error, 
  type = 'unknown',
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3 
}: BlockchainAchievementsErrorProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: '🌐',
          title: 'Blockchain Network Error',
          description: 'Unable to connect to blockchain network. Please check your internet connection and network status.',
          canRetry: true,
          suggestions: [
            'Check your internet connection',
            'Verify network is operational',
            'Try switching networks',
            'Check gas fees',
          ],
        };
      case 'wallet':
        return {
          icon: '👛',
          title: 'Wallet Connection Error',
          description: 'Unable to connect to your wallet. Please ensure your wallet is properly configured.',
          canRetry: true,
          suggestions: [
            'Check wallet connection',
            'Verify wallet is unlocked',
            'Ensure sufficient funds',
            'Check wallet permissions',
          ],
        };
      case 'contract':
        return {
          icon: '📄',
          title: 'Smart Contract Error',
          description: 'Error interacting with smart contract. The contract may be temporarily unavailable.',
          canRetry: true,
          suggestions: [
            'Check contract address',
            'Verify contract is deployed',
            'Check gas settings',
            'Try again later',
          ],
        };
      case 'minting':
        return {
          icon: '🎨',
          title: 'NFT Minting Error',
          description: 'Failed to mint achievement NFT. Please check your settings and try again.',
          canRetry: true,
          suggestions: [
            'Check gas fees',
            'Verify wallet balance',
            'Check metadata format',
            'Try different network',
          ],
        };
      case 'verification':
        return {
          icon: '✅',
          title: 'Achievement Verification Error',
          description: 'Failed to verify achievement on blockchain. Please check achievement data.',
          canRetry: true,
          suggestions: [
            'Check achievement validity',
            'Verify verification data',
            'Check proof requirements',
            'Contact support if needed',
          ],
        };
      case 'staking':
        return {
          icon: '📊',
          title: 'Staking Error',
          description: 'Failed to stake achievement tokens. Please check staking parameters.',
          canRetry: true,
          suggestions: [
            'Check staking amount',
            'Verify token balance',
            'Check staking contract',
            'Review staking rules',
          ],
        };
      case 'transfer':
        return {
          icon: '🔄',
          title: 'Transfer Error',
          description: 'Failed to transfer NFT or tokens. Please check recipient address.',
          canRetry: true,
          suggestions: [
            'Verify recipient address',
            'Check token ownership',
            'Check gas fees',
            'Ensure sufficient balance',
          ],
        };
      default:
        return {
          icon: '❌',
          title: 'Blockchain Achievement Error',
          description: 'An unexpected error occurred with the blockchain achievement system.',
          canRetry: true,
          suggestions: [
            'Check internet connection',
            'Verify wallet connection',
            'Check network status',
            'Contact support if issues persist',
          ],
        };
    }
  };

  const errorConfig = getErrorConfig();
  const canRetry = errorConfig.canRetry && retryCount < maxRetries;
  const retryAttemptsRemaining = maxRetries - retryCount;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.errorCard}>
          {/* Error Icon and Title */}
          <View style={styles.header}>
            <Text style={styles.icon}>{errorConfig.icon}</Text>
            <Text style={styles.title}>{errorConfig.title}</Text>
          </View>

          {/* Error Description */}
          <Text style={styles.description}>{errorConfig.description}</Text>

          {/* Technical Error Details */}
          <View style={styles.technicalContainer}>
            <Text style={styles.technicalTitle}>Technical Details:</Text>
            <Text style={styles.technicalError}>{error}</Text>
          </View>

          {/* Retry Information */}
          {retryCount > 0 && (
            <View style={styles.retryContainer}>
              <Text style={styles.retryText}>
                Retry attempts: {retryCount}/{maxRetries}
              </Text>
              {canRetry && (
                <Text style={styles.retryRemaining}>
                  {retryAttemptsRemaining} attempts remaining
                </Text>
              )}
            </View>
          )}

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            {errorConfig.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {canRetry && onRetry && (
              <Button
                title={`Retry ${retryAttemptsRemaining > 1 ? `(${retryAttemptsRemaining} left)` : ''}`}
                onPress={onRetry}
                style={styles.retryButton}
              />
            )}
            
            {onDismiss && (
              <Button
                title="Dismiss"
                onPress={onDismiss}
                variant="secondary"
                style={styles.dismissButton}
              />
            )}
          </View>

          {/* Additional Help */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Need more help?</Text>
            <View style={styles.helpActions}>
              <Button
                title="Contact Support"
                variant="outline"
                size="small"
                style={styles.helpButton}
              />
              <Button
                title="View Documentation"
                variant="outline"
                size="small"
                style={styles.helpButton}
              />
            </View>
          </View>
        </Card>

        {/* Error Context */}
        <Card style={styles.contextCard}>
          <Text style={styles.contextTitle}>What this affects:</Text>
          <View style={styles.contextList}>
            <Text style={styles.contextItem}>• Achievement NFT minting</Text>
            <Text style={styles.contextItem}>• Blockchain verification</Text>
            <Text style={styles.contextItem}>• Reputation scoring</Text>
            <Text style={styles.contextItem}>• Decentralized credentials</Text>
            <Text style={styles.contextItem}>• Zero-knowledge proofs</Text>
          </View>
        </Card>

        {/* Troubleshooting Steps */}
        <Card style={styles.troubleshootingCard}>
          <Text style={styles.troubleshootingTitle}>Quick Troubleshooting:</Text>
          <View style={styles.troubleshootingSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check internet connection</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Verify wallet connection</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Check network status</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Verify gas fees</Text>
            </View>
          </View>
        </Card>

        {/* Blockchain Specific Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>Blockchain Tips:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure wallet has sufficient ETH/MATIC for gas</Text>
            <Text style={styles.tipItem}>• Check if the selected network is operational</Text>
            <Text style={styles.tipItem}>• Verify smart contract addresses are correct</Text>
            <Text style={styles.tipItem}>• Consider using a different network if one is congested</Text>
            <Text style={styles.tipItem}>• Check gas price settings for optimal transaction speed</Text>
          </View>
        </Card>

        {/* Network Status */}
        <Card style={styles.networkCard}>
          <Text style={styles.networkTitle}>Network Status Check:</Text>
          <View style={styles.networkItems}>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Ethereum:</Text>
              <Text style={styles.networkValue}>Checking...</Text>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Polygon:</Text>
              <Text style={styles.networkValue}>Checking...</Text>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Arbitrum:</Text>
              <Text style={styles.networkValue}>Checking...</Text>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>BSC:</Text>
              <Text style={styles.networkValue}>Checking...</Text>
            </View>
          </View>
        </Card>

        {/* Gas Information */}
        <Card style={styles.gasCard}>
          <Text style={styles.gasTitle}>Gas Fee Information:</Text>
          <View style={styles.gasItems}>
            <View style={styles.gasItem}>
              <Text style={styles.gasLabel}>Current Gas Price:</Text>
              <Text style={styles.gasValue}>Checking...</Text>
            </View>
            <View style={styles.gasItem}>
              <Text style={styles.gasLabel}>Estimated Transaction Cost:</Text>
              <Text style={styles.gasValue}>Calculating...</Text>
            </View>
            <View style={styles.gasItem}>
              <Text style={styles.gasLabel}>Recommended Gas Limit:</Text>
              <Text style={styles.gasValue}>Loading...</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  errorCard: {
    padding: 24,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  technicalContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  technicalError: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  retryContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  retryRemaining: {
    fontSize: 12,
    color: '#856404',
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    color: '#9B59B6',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#9B59B6',
  },
  dismissButton: {
    backgroundColor: '#95A5A6',
  },
  helpContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  helpActions: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flex: 1,
  },
  contextCard: {
    padding: 20,
    marginBottom: 16,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  contextList: {
    gap: 8,
  },
  contextItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  troubleshootingCard: {
    padding: 20,
    marginBottom: 16,
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  troubleshootingSteps: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9B59B6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  tipsCard: {
    padding: 20,
    marginBottom: 16,
  },
  tipsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  networkCard: {
    padding: 20,
    marginBottom: 16,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  networkItems: {
    gap: 8,
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  networkValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  gasCard: {
    padding: 20,
  },
  gasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  gasItems: {
    gap: 8,
  },
  gasItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gasLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  gasValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
});
