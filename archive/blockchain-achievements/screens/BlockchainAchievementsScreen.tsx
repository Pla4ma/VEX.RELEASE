/**
 * Blockchain Achievements Screen
 * 
 * Full-screen implementation for blockchain achievements with navigation,
 * header, and comprehensive feature access.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlockchainAchievements } from '../components/BlockchainAchievements';
import { Loading } from '../../../components/states/Loading';
import { ErrorState } from '../../../components/states/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface BlockchainAchievementsScreenProps {
  userId: string;
}

type RouteParams = {
  userId?: string;
  achievementId?: string;
  tab?: 'achievements' | 'nfts' | 'credentials' | 'reputation';
};

export function BlockchainAchievementsScreen({ userId }: BlockchainAchievementsScreenProps) {
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(userId);

  const routeParams = route.params as RouteParams;

  useEffect(() => {
    // Set up screen
    navigation.setOptions({
      title: 'Blockchain Achievements',
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#2C3E50',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
    });

    // Handle route parameters
    if (routeParams?.userId) {
      setCurrentUserId(routeParams.userId);
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, routeParams?.userId]);

  const handleAchievementPress = (achievement: any) => {
    // Navigate to achievement detail
    navigation.navigate('AchievementDetail', { achievementId: achievement.id });
  };

  const handleNFTPress = (nft: any) => {
    // Navigate to NFT detail
    navigation.navigate('NFTDetail', { nftId: nft.id });
  };

  const handleCredentialPress = (credential: any) => {
    // Navigate to credential detail
    navigation.navigate('CredentialDetail', { credentialId: credential.id });
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    
    // Retry loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleDismiss = () => {
    setError(null);
    navigation.goBack();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Loading message="Loading Blockchain Achievements..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ErrorState
          title="Blockchain Achievement Error"
          message={error}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <BlockchainAchievements
        userId={currentUserId}
        onAchievementPress={handleAchievementPress}
        onNFTPress={handleNFTPress}
        onCredentialPress={handleCredentialPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
