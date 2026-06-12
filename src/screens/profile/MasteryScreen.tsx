import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Box, Text } from '../../components/primitives';
import { Skeleton } from '../../shared/ui/primitives';
import { ErrorState } from '../../components/states/ErrorState';
import { Icon } from '../../icons';
import type { MainStackParams } from '../../navigation/types';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import { MasteryHeader, RankUnlocks } from './MasteryHeader';
import { MasteryTechniqueGrid } from './MasteryTechniqueGrid';
import { MasteryChallengesList } from './MasteryChallengesList';
import { useMasteryState } from './useMasteryState';

export function MasteryScreen(): JSX.Element {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const {
    state,
    isLoading,
    error,
    refetch,
    claimChallenge,
    refreshChallenges,
    pointsToNext,
    nextRankName,
    rankProgress,
  } = useMasteryState(userId);
  const progressAnim = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));
  useEffect(() => {
    progressAnim.value = withTiming(rankProgress, { duration: 1000 });
  }, [progressAnim, rankProgress]);
  if (isLoading) {
    return (
      <Box
        flex={1}
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <Box
          style={{
            paddingTop: insets.top + theme.spacing[5],
            paddingHorizontal: theme.spacing[5],
          }}
        >
          <Skeleton width={120} height={20} style={{ marginBottom: 12 }} />
          <Skeleton width={200} height={32} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={100} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={200} />
        </Box>
      </Box>
    );
  }
  if (error || !state) {
    return (
      <Box
        flex={1}
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <View
          style={{
            paddingTop: insets.top + theme.spacing[5],
            paddingHorizontal: theme.spacing[5],
          }}
        >
          <ErrorState
            title="Couldn't load mastery data"
            description="We encountered an error loading your mastery progress. Please try again."
            onRetry={refetch}
          />
        </View>
      </Box>
    );
  }
  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <View
        style={{
          paddingTop: insets.top + theme.spacing[5],
          paddingHorizontal: theme.spacing[5],
          paddingBottom: theme.spacing[10],
        }}
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text variant="label" color="text.secondary">
                MASTERY
              </Text>
              <Text variant="h2" color="text.primary">
                Skill Progression
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              style={{ padding: 8 }}
              accessibilityHint="Closes mastery screen"
            >
              <Icon
                name="close"
                size={24}
                color={theme.colors.text.secondary}
              />
            </Pressable>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <MasteryHeader
            state={state}
            pointsToNext={pointsToNext}
            nextRankName={nextRankName}
            progressStyle={progressStyle}
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <Text variant="h4" color="text.primary">
            Technique Mastery
          </Text>
          <MasteryTechniqueGrid state={state} />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
          <MasteryChallengesList
            challenges={state.activeChallenges}
            onClaim={claimChallenge}
            onRefresh={refreshChallenges}
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <RankUnlocks currentRank={state.rank} />
        </Animated.View>
      </View>
    </Box>
  );
}

export default withScreenErrorBoundary(MasteryScreen, 'Mastery');
