import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useEffect } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Skeleton } from '../../shared/ui/primitives/Skeleton';
import { ErrorState } from '../../components/states/ErrorState';
import { Icon } from '../../icons/components/Icon';
import type { MainStackParams } from '../../navigation/types';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { MasteryHeader, RankUnlocks } from './MasteryHeader';
import { MasteryTechniqueGrid } from './MasteryTechniqueGrid';
import { MasteryChallengesList } from './MasteryChallengesList';
import { useMasteryState } from './useMasteryState';
import { vexFire } from '../../theme/tokens/vex-fire';

function MasteryScreen(): React.ReactNode {
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
        style={{ backgroundColor: vexFire.background }}
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
        style={{ backgroundColor: vexFire.background }}
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
    <Box flex={1} style={{ backgroundColor: vexFire.background }}>
      <Image
        accessibilityIgnoresInvertColors
        source={require('../../../assets/vex/utility/mastery-crown.png')}
        resizeMode="contain"
        style={{ height: 200, opacity: 0.14, position: 'absolute', right: -54, top: insets.top + 8, width: 200 }}
      />
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
              <Text variant="label" style={{ color: vexFire.textSecondary }}>
                MASTERY
              </Text>
              <Text variant="h2" style={{ color: vexFire.cream }}>
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
                color={vexFire.textSecondary}
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
          <Text variant="h4" style={{ color: vexFire.cream }}>
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

const MasteryScreenWithBoundary = withScreenErrorBoundary(MasteryScreen, 'Mastery');
export { MasteryScreenWithBoundary as MasteryScreen };

export { MasteryScreen as default };
