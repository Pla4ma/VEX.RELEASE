import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeInUp,
  useReducedMotion,
} from "react-native-reanimated";
import { Box, Card, Text } from "../../components/primitives";
import { ErrorState } from "../../components/states/ErrorState";
import {
  type CompanionMood,
  type CompanionState,
  ELEMENT_THEMES,
} from "../../features/companion/types";
import { LivingCompanion } from "../../features/companion/components/LivingCompanion";
import {
  loadCompanionState,
  loadRecentSessionMoods,
} from "../../features/companion/session-storage";
import { useCompanionMemories } from "../../features/companion/memory-hooks";
import { useAuthStore } from "../../store";
import { useTheme } from "../../theme";
import { CompanionMemoryTimeline } from "../../features/companion/components/CompanionMemoryTimeline";
import type { ExtendedRootStackParams } from "../../navigation/types";
import {
  CompanionScreenSkeleton,
  ELEMENT_LORE,
  MoodDot,
  PHASE_NAMES,
  PhaseProgressBar,
  ProgressToNext,
  StatCard,
} from "./components/CompanionScreenSupport";

const HERO_HEIGHT = Dimensions.get("window").height * 0.6;

interface SessionMoodEntry {
  mood: CompanionMood;
  sessionId: string;
  timestamp: number;
}

type LoadState =
  | { status: "empty" }
  | { error: Error; status: "error" }
  | { status: "loading" }
  | {
      companion: CompanionState;
      moodHistory: SessionMoodEntry[];
      status: "success";
    };

export function CompanionScreen(): JSX.Element {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const reducedMotion = useReducedMotion();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const memories = useCompanionMemories(userId);
  const load = useCallback(async (): Promise<void> => {
    if (!userId) {
      setLoadState({ status: "empty" });
      return;
    }
    setLoadState({ status: "loading" });
    try {
      const [companion, moodHistory] = await Promise.all([
        loadCompanionState(userId),
        loadRecentSessionMoods(userId, 5),
      ]);
      setLoadState({ companion, moodHistory, status: "success" });
    } catch (caught: unknown) {
      setLoadState({
        error: caught instanceof Error ? caught : new Error(String(caught)),
        status: "error",
      });
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState.status === "loading") {
    return <CompanionScreenSkeleton heroHeight={HERO_HEIGHT} />;
  }
  if (loadState.status === "empty") {
    return (
      <Box
        flex={1}
        bg="background.primary"
        justifyContent="center"
        alignItems="center"
        p="xl"
      >
        <Text variant="h4" color="text.primary" textAlign="center">
          Your companion needs an active profile.
        </Text>
      </Box>
    );
  }
  if (loadState.status === "error") {
    return (
      <ErrorState
        title="Companion details did not load"
        description="VEX kept the session safe. Retry the companion profile."
        retryLabel="Retry companion"
        onRetry={load}
      />
    );
  }

  const { companion, moodHistory } = loadState;
  const themeColors = ELEMENT_THEMES[companion.element];
  const fadeIn = reducedMotion ? undefined : FadeIn.duration(600);
  const fadeUp = (delay: number) =>
    reducedMotion ? undefined : FadeInUp.duration(400).delay(delay);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background.primary, flex: 1 }}
      contentContainerStyle={{ paddingBottom: theme.spacing[5] }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={fadeIn}>
        <Box
          height={HERO_HEIGHT}
          bg="background.secondary"
          justifyContent="center"
          alignItems="center"
        >
          <LivingCompanion
            companionState={companion}
            elapsedSeconds={0}
            isPaused={false}
            purityScore={85}
            sessionProgress={0}
            totalSeconds={1800}
          />
          <Box
            position="absolute"
            px="md"
            py="sm"
            borderRadius="full"
            bg="background.tertiary"
            style={{ right: theme.spacing[4], top: theme.spacing[4] }}
          >
            <Text variant="caption" color="text.primary" fontWeight="600">
              {PHASE_NAMES[companion.phase]} Phase
            </Text>
          </Box>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(200)}>
        <Box px="lg" py="xl" gap="lg">
          <Text variant="h3" color="text.primary">
            Companion Stats
          </Text>
          <Box flexDirection="row" gap="md">
            <StatCard
              label="Focus Minutes"
              value={Math.floor(companion.totalFocusMinutes).toLocaleString()}
            />
            <StatCard
              label="Sessions Together"
              value={companion.sessionCount.toLocaleString()}
            />
            <StatCard
              label="Perfect Sessions"
              value={companion.perfectSessions.toLocaleString()}
            />
          </Box>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(300)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">
            Evolution Progress
          </Text>
          <Card size="md">
            <Box gap="md">
              <PhaseProgressBar currentPhase={companion.phase} />
              <Text variant="body" color="text.secondary">
                Level {companion.level}/100
              </Text>
              <ProgressToNext companion={companion} />
            </Box>
          </Card>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(400)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">
            Element Affinity
          </Text>
          <Card
            size="md"
            style={{ borderColor: themeColors.primary, borderWidth: 1 }}
          >
            <Text variant="h4" color="text.primary" fontWeight="600">
              {companion.element}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Affinity: {companion.elementAffinity}%
            </Text>
            <Text variant="bodySmall" color="text.secondary">
              {ELEMENT_LORE[companion.element]}
            </Text>
          </Card>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(500)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">
            Session History
          </Text>
          <Card size="md">
            <Box gap="md">
              <Text variant="bodySmall" color="text.secondary">
                Last {moodHistory.length} session
                {moodHistory.length === 1 ? "" : "s"}
              </Text>
              <Box flexDirection="row" gap="sm" alignItems="center">
                {moodHistory.length > 0 ? (
                  moodHistory.map((entry) => (
                    <MoodDot key={entry.sessionId} mood={entry.mood} />
                  ))
                ) : (
                  <Text variant="caption" color="text.tertiary">
                    No recent sessions recorded
                  </Text>
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      </Animated.View>
      <Box px="lg" pb="xl">
        <CompanionMemoryTimeline
          isError={memories.isError}
          isPending={memories.isPending}
          memories={memories.data}
          onRetry={memories.refetch}
          onStartFocus={() =>
            navigation.navigate({ name: "SessionSetup", params: {} })
          }
        />
      </Box>
    </ScrollView>
  );
}

export default withScreenErrorBoundary(CompanionScreen, "Companion");
