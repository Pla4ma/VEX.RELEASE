import { withScreenErrorBoundary } from '../shared/ui/components/ScreenErrorBoundary';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../components/primitives';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useTheme } from '../theme';
import { useAuthStore } from '../store';
// Rivals feature not implemented - stubbing imports
// import {
//   ActiveChallengesSection,
//   MyRivalsSection,
//   SuggestedRivalsSection,
// } from '../features/rivals/components';
// import {
//   useActiveChallenges,
//   useMyRivals,
//   useRivalSuggestions,
// } from '../features/rivals/hooks';

// Stub hooks
const useMyRivals = (_userId: string | null) => ({
  data: null,
  isLoading: false,
  error: null,
});
const useActiveChallenges = (_userId: string | null) => ({
  data: null,
  isLoading: false,
});
const useRivalSuggestions = (
  _userId: string | null,
  _count1: number,
  _count2: number,
  _count3: number,
) => ({ data: null, isLoading: false });
// Stub components
const MyRivalsSection = (_props: { rivalsResult: unknown }) => null;
const ActiveChallengesSection = (_props: {
  challengesResult: unknown;
  userId: string;
}) => null;
const SuggestedRivalsSection = (_props: {
  suggestionsResult: unknown;
  userId: string;
}) => null;

function RivalsScreenSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing[5],
          gap: theme.spacing[4],
        }}
      >
        <Skeleton height={40} width={200} />
        <Skeleton height={180} variant="rounded" />
        <Skeleton height={120} variant="rounded" />
        <Skeleton height={200} variant="rounded" />
      </ScrollView>
    </SafeAreaView>
  );
}

export function RivalsScreen(): JSX.Element {
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const rivalsResult = useMyRivals(userId);
  const challengesResult = useActiveChallenges(userId);
  const suggestionsResult = useRivalSuggestions(userId, 5, 4, 30);
  const isInitialLoading =
    (rivalsResult.isLoading && !rivalsResult.data) ||
    (challengesResult.isLoading && !challengesResult.data);

  if (isInitialLoading) {
    return <RivalsScreenSkeleton />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing[5],
          gap: theme.spacing[6],
          paddingBottom: theme.spacing[10],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text variant="h2" color={theme.colors.text.primary} fontWeight="800">
            Rivals
          </Text>
          <Text
            variant="body"
            color={theme.colors.text.secondary}
            style={{ marginTop: theme.spacing[1] }}
          >
            Compete weekly with players at your level.
          </Text>
        </Animated.View>

        {userId ? (
          <>
            <MyRivalsSection rivalsResult={rivalsResult} />
            <ActiveChallengesSection
              challengesResult={challengesResult}
              userId={userId}
            />
            <SuggestedRivalsSection
              suggestionsResult={suggestionsResult}
              userId={userId}
            />
          </>
        ) : (
          <EmptyState
            icon="!"
            title="Sign in to find rivals"
            body="Rivalries need your profile before they can start."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default withScreenErrorBoundary(RivalsScreen, 'Rivals');
