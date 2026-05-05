/**
 * PostSessionStoryScreen Container
 *
 * Wrapper that handles data fetching and states (loading, error, empty, success)
 * for the PostSessionStoryScreen.
 *
 * @phase 5
 */

import React, { useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../../theme';
import { Box, Button, Text } from '../../../components/primitives';
import { useSessionStory } from '../hooks/useSessionStory';
import { useAuthStore } from '../../../store';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { PostSessionStoryScreen } from './PostSessionStoryScreen';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type RouteProps = RouteProp<ExtendedRootStackParams, 'PostSessionStory'>;

export function PostSessionStoryScreenContainer(): JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user } = useAuthStore();

  const { sessionId, focusScore, purityScore } = route.params;
  const { story, isLoading, error } = useSessionStory(sessionId, user?.id ?? null);

  const handleComplete = useCallback(() => {
    navigation.navigate('Main', { screen: 'Home' });
  }, [navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate('Main', { screen: 'Home' });
  }, [navigation]);

  const handleShare = useCallback((storyData: unknown) => {
    // Share functionality - would integrate with share API
    // For now, just log or show toast
  }, []);

  const handleRetry = useCallback(() => {
    // Force refetch by navigating back and forth
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate('PostSessionStory', { sessionId, focusScore, purityScore });
    }, 100);
  }, [navigation, sessionId, focusScore, purityScore]);

  // Loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text variant="body" color={theme.colors.text.secondary} style={{ marginTop: 16 }}>
          Crafting your session story...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text variant="h4" color={theme.colors.error.DEFAULT} style={{ marginBottom: 8 }}>
          Couldn't load story
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} style={{ marginBottom: 24, textAlign: 'center' }}>
          {error.message}
        </Text>
        <Box flexDirection="row" gap={3}>
          <Button variant="secondary" onPress={handleRetry}>
            Try Again
          </Button>
          <Button variant="primary" onPress={handleSkip}>
            Continue
          </Button>
        </Box>
      </View>
    );
  }

  // Empty state - no story generated
  if (!story) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📖</Text>
        <Text variant="h4" color={theme.colors.text.primary} style={{ marginBottom: 8 }}>
          No story yet
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} style={{ marginBottom: 24, textAlign: 'center' }}>
          Stories are generated after sessions with significant moments. Keep building your streak!
        </Text>
        <Button variant="primary" onPress={handleComplete}>
          Return Home
        </Button>
      </View>
    );
  }

  // Success state - render the actual story screen
  return (
    <PostSessionStoryScreen
      story={story}
      onComplete={handleComplete}
      onSkip={handleSkip}
      onShare={handleShare}
      autoAdvance={true}
    />
  );
}
