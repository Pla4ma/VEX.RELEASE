import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import { Box, Text } from '../../components/primitives';
import { Button } from '../../components/primitives/Button';
import { useAuthStore } from '../../store';
import { getStreakService } from '../../streaks/StreakService';
import { useToast } from '../../shared/ui/components/Toast';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { StreakFuneralFlame } from './StreakFuneralFlame';
import { Text as VexText } from '../../components/primitives/Text';
import { vexFire } from '../../theme/tokens/vex-fire';

type StreakFuneralRoute = RouteProp<ExtendedRootStackParams, 'StreakFuneral'>;
type StreakFuneralNavigation = NativeStackNavigationProp<ExtendedRootStackParams>;

const StreakFuneralScreen: React.ComponentType = () => {
  const { show: showToast } = useToast();
  const { user } = useAuthStore();
  const navigation = useNavigation<StreakFuneralNavigation>();
  const route = useRoute<StreakFuneralRoute>();
  const { previousStreak, diedAt } = route.params;
  const hoursSinceDeath = Math.floor((Date.now() - diedAt) / (1000 * 60 * 60));
  const daysSinceDeath = Math.floor(hoursSinceDeath / 24);

  const completeFuneral = useCallback(() => {
    if (user?.id) {
      getStreakService(user.id).markFuneralShown();
    }
    navigation.goBack();
  }, [navigation, user?.id]);

  const handleStartFresh = useCallback(() => {
    Sentry.addBreadcrumb({
      category: 'streaks',
      message: 'User acknowledged streak pause and started fresh',
      level: 'info',
      data: { previousStreak, diedAt },
    });
    showToast({
      type: 'success',
      title: 'New rhythm started!',
      message: 'Every day is a clean start.',
      duration: 3000,
    });
    completeFuneral();
  }, [completeFuneral, previousStreak, diedAt, showToast]);

  const handleReminisce = useCallback((): void => {
    Sentry.addBreadcrumb({
      category: 'streaks',
      message: 'User chose to view streak history',
      level: 'info',
    });
    completeFuneral();
  }, [completeFuneral]);
  return (
    <Box flex={1} style={{ backgroundColor: vexFire.background }} px="lg" pt="xl">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        <Animated.View entering={FadeIn.delay(200)}>
          <Box alignItems="center" mb="2xl">
            <StreakFuneralFlame />
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(400)}>
          <Box alignItems="center" mb="xl">
              <Text variant="h2" style={{ color: vexFire.cream }} textAlign="center" mb="md">
              {previousStreak}-day rhythm paused
            </Text>
            <Text variant="body" style={{ color: vexFire.textSecondary }} textAlign="center">
              {daysSinceDeath > 0
                ? `${daysSinceDeath} day${daysSinceDeath !== 1 ? 's' : ''} ago`
                : `${hoursSinceDeath} hour${hoursSinceDeath !== 1 ? 's' : ''} ago`}
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(500)}>
          <Box alignItems="center" mb="xl">
            <Text variant="body" color={vexFire.textSecondary} textAlign="center">
              {previousStreak} days of focus. Every day built your rhythm, and
              that rhythm starts again today.
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(600)}>
          <Box
            style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1 }}
            p="xl"
            borderRadius="lg"
            alignItems="center"
            mb="2xl"
          >
            <Text variant="caption" color={vexFire.textSecondary} mb="sm">
              YOUR RHYTHM
            </Text>
            <Text
              variant="hero"
              style={{ color: vexFire.ember, fontSize: 72, fontWeight: '800' }}
            >
              {previousStreak}
            </Text>
            <Text variant="h4" style={{ color: vexFire.cream }}>
              {previousStreak === 1 ? 'day' : 'days'}
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(800)}>
          <Box mb="2xl">
            <Text
              variant="body"
              color={vexFire.textSecondary}
              textAlign="center"
              mb="md"
            >
              "Every comeback is proof of real consistency.
            </Text>
            <Text variant="body" color={vexFire.textSecondary} textAlign="center">
              Starting fresh is not failure. It is commitment."
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(1000)}>
          <Box gap="md">
            <Button variant="primary"
              size="lg"
              fullWidth
              onPress={handleStartFresh}
              accessibilityLabel="Start fresh with a new rhythm"
              accessibilityRole="button"
              accessibilityHint="Begins a new rhythm with your next session"
            >
              <VexText>Start fresh — new rhythm</VexText>
            </Button>
            <Button variant="ghost"
              size="sm"
              fullWidth
              onPress={handleReminisce}
              accessibilityLabel="View focus history"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <VexText>View Focus History</VexText>
            </Button>
          </Box>
        </Animated.View>

        <Box height={40} />
      </ScrollView>
    </Box>
  );
};
const StreakFuneralScreenWithBoundary = withScreenErrorBoundary(StreakFuneralScreen, 'StreakFuneral');
export { StreakFuneralScreenWithBoundary as StreakFuneralScreen };

export { StreakFuneralScreen as default };
