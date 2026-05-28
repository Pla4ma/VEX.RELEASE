import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Sentry from "@sentry/react-native";
import { Box, Text } from "../../components/primitives";
import { Button } from "../../components/primitives/Button";
import { useAuthStore } from "../../store";
import { getStreakService } from "../../streaks/StreakService";
import { useTheme } from "../../theme";
import { useToast } from "../../shared/ui/components/Toast";
import { useBalance } from "../../features/economy/hooks";
import { getFeatureStatus } from "../../features/liveops-config/final-release-feature-map";
import type { ExtendedRootStackParams } from "../../navigation/types";
import { StreakFuneralFlame } from "./StreakFuneralFlame";
import { calculateRestoreCost } from "./streak-funeral-costs";

type StreakFuneralRoute = RouteProp<ExtendedRootStackParams, "StreakFuneral">;
type StreakFuneralNavigation = NativeStackNavigationProp<ExtendedRootStackParams>;

export const StreakFuneralScreen: React.FC = () => {
  const { theme } = useTheme();
  const showGems = getFeatureStatus("gems_prominent") !== "hidden";
  const { show: showToast } = useToast();
  const { user } = useAuthStore();
  const navigation = useNavigation<StreakFuneralNavigation>();
  const route = useRoute<StreakFuneralRoute>();
  const { previousStreak, diedAt } = route.params;
  const hoursSinceDeath = Math.floor((Date.now() - diedAt) / (1000 * 60 * 60));
  const daysSinceDeath = Math.floor(hoursSinceDeath / 24);
  const restoreCost = useMemo(
    () => calculateRestoreCost(previousStreak),
    [previousStreak],
  );
  const { data: gemsBalanceData } = useBalance(user?.id ?? "", "GEMS");
  const gemBalance = gemsBalanceData ?? 0;

  const completeFuneral = useCallback(() => {
    if (user?.id) {
      getStreakService(user.id).markFuneralShown();
    }
    navigation.goBack();
  }, [navigation, user?.id]);

  const handleStartFresh = useCallback(() => {
    Sentry.addBreadcrumb({
      category: "streaks",
      message: "User acknowledged streak funeral and started fresh",
      level: "info",
      data: { previousStreak, diedAt },
    });
    showToast({
      type: "success",
      title: "New streak started!",
      message: "Every day is a fresh beginning.",
      duration: 3000,
    });
    completeFuneral();
  }, [completeFuneral, previousStreak, diedAt, showToast]);

  const handleReminisce = useCallback((): void => {
    Sentry.addBreadcrumb({
      category: "streaks",
      message: "User chose to view streak history",
      level: "info",
    });
    completeFuneral();
  }, [completeFuneral]);
  return (
    <Box flex={1} bg="background.primary" px="lg" pt="xl">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <Animated.View entering={FadeIn.delay(200)}>
          <Box alignItems="center" mb="2xl">
            <StreakFuneralFlame />
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(400)}>
          <Box alignItems="center" mb="xl">
            <Text variant="h2" color="text.primary" textAlign="center" mb="md">
              {previousStreak}-day rhythm paused
            </Text>
            <Text variant="body" color="text.secondary" textAlign="center">
              {daysSinceDeath > 0
                ? `${daysSinceDeath} day${daysSinceDeath !== 1 ? "s" : ""} ago`
                : `${hoursSinceDeath} hour${hoursSinceDeath !== 1 ? "s" : ""} ago`}
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(500)}>
          <Box alignItems="center" mb="xl">
            <Text variant="body" color="text.secondary" textAlign="center">
              {previousStreak} days of focus. Every day built your rhythm, and
              that rhythm starts again today.
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(600)}>
          <Box
            bg="background.secondary"
            p="xl"
            borderRadius="lg"
            alignItems="center"
            mb="2xl"
            style={{ borderWidth: 1, borderColor: theme.colors.border.light }}
          >
            <Text variant="caption" color="text.secondary" mb="sm">
              YOUR RHYTHM
            </Text>
            <Text
              variant="hero"
              color="primary.500"
              style={{ fontSize: 72, fontWeight: "800" }}
            >
              {previousStreak}
            </Text>
            <Text variant="h4" color="text.primary">
              {previousStreak === 1 ? "day" : "days"}
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(800)}>
          <Box mb="2xl">
            <Text
              variant="body"
              color="text.secondary"
              textAlign="center"
              mb="md"
            >
              "Every comeback is proof of real consistency.
            </Text>
            <Text variant="body" color="text.secondary" textAlign="center">
              Starting fresh is not failure. It is commitment." 💪
            </Text>
          </Box>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(1000)}>
          <Box gap="md">
            {showGems && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleStartFresh}
                disabled={gemBalance < restoreCost}
                accessibilityLabel={`Restore rhythm for ${restoreCost} gems`}
                accessibilityRole="button"
                accessibilityHint={`Protects your ${previousStreak}-day rhythm for ${restoreCost} gems`}
              >
                Restore rhythm for {restoreCost} 💎
              </Button>
            )}

            {showGems && gemBalance < restoreCost && (
              <Text variant="caption" color="text.tertiary" textAlign="center">
                Need {restoreCost} gems. You have {gemBalance}.{"\n"}
                Complete more sessions to earn gems.
              </Text>
            )}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleStartFresh}
              accessibilityLabel="Start fresh with a new rhythm"
              accessibilityRole="button"
              accessibilityHint="Begins a new rhythm with bonus XP for your first sessions"
            >
              Start fresh — new rhythm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onPress={handleReminisce}
              accessibilityLabel="View focus history button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              View Focus History
            </Button>
          </Box>
        </Animated.View>

        <Box height={40} />
      </ScrollView>
    </Box>
  );
};
export default withScreenErrorBoundary(StreakFuneralScreen, "StreakFuneral");
