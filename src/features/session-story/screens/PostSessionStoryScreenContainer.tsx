import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/states/ErrorState';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { SessionSummary } from '../../../session/types';
import { useAuthStore } from '../../../store';
import {
  trackStreakShieldMomentDismissed,
  trackStreakShieldMomentViewed,
} from '../../monetization/analytics';
import { useStreakShieldMoment } from '../../monetization/hooks';
import { usePostSessionStoryViewModel } from '../../session-completion/hooks';
import { PostSessionStoryScreen } from './PostSessionStoryScreen';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type RouteProps = RouteProp<ExtendedRootStackParams, 'PostSessionStory'>;

function StorySkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, gap: theme.spacing[3], padding: theme.spacing[5] }} testID="post-session-story-loading">
      {[120, 180, 180, 180].map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.light,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            height,
          }}
        />
      ))}
    </View>
  );
}

function EmptyStory({ onDone }: { onDone: () => void }): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing[5] }} testID="post-session-story-empty">
      <Text variant="h3" color={theme.colors.text.primary}>No story could be rebuilt yet.</Text>
      <Text variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing[2], marginBottom: theme.spacing[4] }}>
        VEX saved the finish, but this story packet is still incomplete. Return home and start the next clean block.
      </Text>
      <Button accessibilityLabel="Return home" accessibilityRole="button" onPress={onDone} variant="primary">
        Return home
      </Button>
    </View>
  );
}

export function PostSessionStoryScreenContainer(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const summary = route.params.summary;
  const done = useCallback(() => navigation.navigate('Main', { screen: 'Home' }), [navigation]);

  if (!summary) {
    return <EmptyStory onDone={done} />;
  }
  return <ResolvedStory done={done} summary={summary} />;
}

function ResolvedStory({
  done,
  summary,
}: {
  done: () => void;
  summary: SessionSummary;
}): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user } = useAuthStore();
  const story = usePostSessionStoryViewModel({
    sessionId: route.params.sessionId,
    summary,
    userId: user?.id ?? null,
  });
  const streakShield = useStreakShieldMoment({
    sessionId: route.params.sessionId,
    summary,
  });
  const retryStory = story.refetch;
  const handleOpenStreakShield = useCallback(() => {
    if (!streakShield.moment) {
      return;
    }
    void streakShield.markShown();
    trackStreakShieldMomentViewed(route.params.sessionId, summary.streakDays ?? 0);
    navigation.navigate('Paywall', streakShield.moment.routeParams);
  }, [navigation, route.params.sessionId, streakShield, summary.streakDays]);
  const handleDismissStreakShield = useCallback(() => {
    void streakShield.markShown();
    trackStreakShieldMomentDismissed(route.params.sessionId);
  }, [route.params.sessionId, streakShield]);
  const handlePrimaryAction = useCallback(() => {
    if (story.data?.nextActionCta.route === 'SessionSetup' && story.data.nextActionCta.routeParams) {
      navigation.navigate({ name: 'SessionSetup', params: story.data.nextActionCta.routeParams });
      return;
    }
    done();
  }, [done, navigation, story.data]);

  if (story.isPending) {
    return <StorySkeleton />;
  }
  if (story.isError) {
    return (
      <ErrorState
        description="VEX could not shape this finish into a story yet. Try again in a moment."
        onDegraded={done}
        onRetry={() => { void retryStory(); }}
        title="Story could not load"
      />
    );
  }
  if (!story.data) {
    return <EmptyStory onDone={done} />;
  }
  return (
    <PostSessionStoryScreen
      isOffline={story.isOffline}
      monetizationMoment={streakShield.moment}
      onMonetizationAccept={handleOpenStreakShield}
      onMonetizationDismiss={handleDismissStreakShield}
      onPrimaryAction={handlePrimaryAction}
      viewModel={story.data}
    />
  );
}
