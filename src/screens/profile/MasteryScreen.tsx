import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Box, Card, Text } from "../../components/primitives";
import { Button } from "../../components/primitives/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/states/ErrorState";
import { MasteryRankBadge } from "../../features/mastery/components/MasteryRankBadge";
import { TechniqueBar } from "../../features/mastery/components/TechniqueBar";
import { MasteryService } from "../../features/mastery/service";
import {
  getMasteryRankDisplay,
  MASTERY_RANK_THRESHOLDS,
  type MasteryChallenge,
  type MasteryRank,
  type MasteryState,
} from "../../features/mastery/types";
import { Icon } from "../../icons";
import type { MainStackParams } from "../../navigation/types";
import { getDefaultStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { useAuthStore } from "../../store";
import { useTheme } from "../../theme";
import { launchColors } from "@theme/tokens/launch-colors";
type Props = NativeStackScreenProps<MainStackParams, "Mastery">;
const TECHNIQUES = [
  {
    key: "durationMastery" as const,
    label: "Duration Focus",
    color: launchColors.hex_6366f1,
    description: "Long sessions without interruption",
  },
  {
    key: "purityMastery" as const,
    label: "Purity",
    color: launchColors.hex_14b8a6,
    description: "Sustained high focus scores",
  },
  {
    key: "consistencyMastery" as const,
    label: "Consistency",
    color: launchColors.hex_f97316,
    description: "Daily streaks maintained",
  },
  {
    key: "comebackMastery" as const,
    label: "Comeback",
    color: launchColors.hex_ec4899,
    description: "Recovering from broken streaks",
  },
  {
    key: "bossMastery" as const,
    label: "Boss",
    color: launchColors.hex_eab308,
    description: "Boss defeat efficiency",
  },
];
const RANK_UNLOCKS: Record<MasteryRank, string[]> = {
  APPRENTICE: ["All base session modes", "Basic boss encounters"],
  ADEPT: ["DEEP_WORK mode unlocked", "Advanced boss tier 3-4 access"],
  EXPERT: ["Nightmare Mode sessions (2x XP)", "Boss tier 5-6 access"],
  MASTER: ["Mastery Duel type", "Custom challenge creation"],
  GRANDMASTER: ["Exclusive Grandmaster badge", "Priority support access"],
};
const DIFFICULTY_COLORS = {
  EASY: launchColors.hex_10b981,
  MEDIUM: launchColors.hex_3b82f6,
  HARD: launchColors.hex_f59e0b,
  ELITE: launchColors.hex_8b5cf6,
};
function calculatePointsToNextRank(
  currentPoints: number,
  currentRank: MasteryRank,
): number {
  const ranks: MasteryRank[] = [
    "APPRENTICE",
    "ADEPT",
    "EXPERT",
    "MASTER",
    "GRANDMASTER",
  ];
  const currentIndex = ranks.indexOf(currentRank);
  if (currentIndex >= ranks.length - 1) {
    return 0;
  }
  const nextRank = ranks[currentIndex + 1]!;
  return Math.max(0, MASTERY_RANK_THRESHOLDS[nextRank] - currentPoints);
}
function useMasteryState(userId: string | null) {
  const [state, setState] = useState<MasteryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadMastery = useCallback(async () => {
    if (!userId) {
      setState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const masteryState = MasteryService.getOrCreateMasteryState(userId);
      setState(masteryState);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load mastery state"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    void loadMastery();
  }, [loadMastery]);
  const claimChallenge = useCallback(
    (challengeId: string) => {
      if (!userId) {
        return false;
      }
      const success = MasteryService.claimChallenge(userId, challengeId);
      if (success) {
        const updatedState = MasteryService.getOrCreateMasteryState(userId);
        setState(updatedState);
      }
      return success;
    },
    [userId],
  );
  const refreshChallenges = useCallback(() => {
    if (!userId) {
      return;
    }
    const updatedState = MasteryService.refreshChallenges(userId);
    setState(updatedState);
  }, [userId]);
  return {
    state,
    isLoading,
    error,
    refetch: loadMastery,
    claimChallenge,
    refreshChallenges,
  };
}
function ChallengeCard({
  challenge,
  onClaim,
}: {
  challenge: MasteryChallenge;
  onClaim: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const progress =
    challenge.target > 0
      ? Math.max(0, Math.min(1, challenge.current / challenge.target))
      : 0;
  const badgeColor = DIFFICULTY_COLORS[challenge.difficulty];
  return (
    <Card
      size="md"
      style={{ backgroundColor: theme.colors.background.secondary }}
    >
      <View style={{ gap: theme.spacing[3] }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            <Text variant="h4" color="text.primary">
              {challenge.title}
            </Text>
            <Text variant="caption" color="text.secondary">
              {challenge.description}
            </Text>
          </View>
          <View
            style={{
              borderRadius: 999,
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              backgroundColor: `${badgeColor}22`,
            }}
          >
            <Text variant="caption" style={{ color: badgeColor }}>
              {challenge.difficulty}
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.spacing[1] }}>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              backgroundColor: theme.colors.background.tertiary,
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 8,
                borderRadius: 4,
                backgroundColor: badgeColor,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="caption" color="text.tertiary">
              {challenge.current}/{challenge.target} {challenge.unit}
            </Text>
            <Text variant="caption" color="success.DEFAULT">
              +{challenge.masteryPoints} MP
            </Text>
          </View>
        </View>

        {challenge.status === "COMPLETED" && (
          <Button
            size="sm"
            variant="primary"
            onPress={onClaim}
            accessibilityLabel={`Claim reward for ${challenge.title}`}
            accessibilityRole="button"
            accessibilityHint={`Claims ${challenge.masteryPoints} mastery points`}
          >
            Claim +{challenge.masteryPoints} MP
          </Button>
        )}
      </View>
    </Card>
  );
}
function RankUnlocks({
  currentRank,
}: {
  currentRank: MasteryRank;
}): JSX.Element {
  const { theme } = useTheme();
  const ranks: MasteryRank[] = [
    "APPRENTICE",
    "ADEPT",
    "EXPERT",
    "MASTER",
    "GRANDMASTER",
  ];
  return (
    <View style={{ gap: theme.spacing[3] }}>
      <Text variant="h4" color="text.primary">
        Rank Unlocks
      </Text>
      {ranks.map((rank) => {
        const isCurrent = rank === currentRank;
        const isUnlocked = ranks.indexOf(rank) <= ranks.indexOf(currentRank);
        const rankDisplay = getMasteryRankDisplay(rank);
        return (
          <View
            key={rank}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing[3],
              padding: theme.spacing[3],
              borderRadius: 12,
              backgroundColor: isCurrent
                ? `${rankDisplay.color}15`
                : theme.colors.background.secondary,
              borderWidth: isCurrent ? 1 : 0,
              borderColor: isCurrent ? rankDisplay.color : undefined,
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            <Text fontSize={24}>{rankDisplay.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text
                variant="body"
                color="text.primary"
                fontWeight={isCurrent ? "700" : "500"}
                style={{
                  color: isUnlocked
                    ? rankDisplay.color
                    : theme.colors.text.secondary,
                }}
              >
                {rankDisplay.title}
                {isCurrent && " (Current)"}
                {!isUnlocked && " (Locked)"}
              </Text>
              <Text variant="caption" color="text.tertiary">
                {RANK_UNLOCKS[rank].join(" • ")}
              </Text>
            </View>
            {isUnlocked && (
              <Icon
                name="checkmark-circle"
                size={20}
                color={theme.colors.success.DEFAULT}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
function HistoryChart({ state }: { state: MasteryState }): JSX.Element {
  const { theme } = useTheme();
  const maxPoints = Math.max(25, state.totalMasteryPoints);
  const mockHistory = useMemo(() => {
    const days = 30;
    const points: number[] = [];
    for (let i = 0; i <= days; i++) {
      const progress = i / days;
      points.push(
        Math.round(
          state.totalMasteryPoints * progress * (0.8 + Math.random() * 0.4),
        ),
      );
    }
    return points;
  }, [state.totalMasteryPoints]);
  return (
    <View style={{ gap: theme.spacing[3] }}>
      <Text variant="h4" color="text.primary">
        30-Day Progress
      </Text>
      <Card
        size="md"
        style={{
          backgroundColor: theme.colors.background.secondary,
          paddingVertical: theme.spacing[4],
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 100,
            gap: 2,
          }}
        >
          {mockHistory.map((points, index) => {
            const height = Math.max(4, (points / maxPoints) * 100);
            const isCurrent = index === mockHistory.length - 1;
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  backgroundColor: isCurrent
                    ? theme.colors.primary[500]
                    : `${theme.colors.primary[500]}50`,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: theme.spacing[2],
          }}
        >
          <Text variant="caption" color="text.tertiary">
            30 days ago
          </Text>
          <Text variant="caption" color="text.primary" fontWeight="600">
            Today: {state.totalMasteryPoints} MP
          </Text>
        </View>
      </Card>
    </View>
  );
}
export function MasteryScreen({
  navigation: propNavigation,
}: Partial<Props>): JSX.Element {
  const navigation =
    propNavigation ??
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
  } = useMasteryState(userId);
  const rankDisplay = state
    ? getMasteryRankDisplay(state.rank)
    : getMasteryRankDisplay("APPRENTICE");
  const pointsToNext = state
    ? calculatePointsToNextRank(
        state.totalMasteryPoints,
        state.rank ?? "APPRENTICE",
      )
    : 0;
  const nextRankName = useMemo(() => {
    if (!state) {
      return "";
    }
    const ranks: MasteryRank[] = [
      "APPRENTICE",
      "ADEPT",
      "EXPERT",
      "MASTER",
      "GRANDMASTER",
    ];
    const currentIndex = ranks.indexOf(state.rank ?? "APPRENTICE");
    if (currentIndex >= ranks.length - 1) {
      return "Max Rank";
    }
    return getMasteryRankDisplay(ranks[currentIndex + 1]!).title;
  }, [state]);
  const rankProgress = useMemo(() => {
    if (!state || pointsToNext === 0) {
      return 1;
    }
    const currentThreshold = MASTERY_RANK_THRESHOLDS[state.rank!];
    const nextThreshold = currentThreshold + pointsToNext;
    const progressInRank = state.totalMasteryPoints - currentThreshold;
    const rankRange = nextThreshold - currentThreshold;
    return Math.max(0, Math.min(1, progressInRank / rankRange));
  }, [state, pointsToNext]);
  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = withTiming(rankProgress, { duration: 1000 });
  }, [progressAnim, rankProgress]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));
  if (isLoading) {
    return (
      <Box
        flex={1}
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + theme.spacing[5],
            paddingHorizontal: theme.spacing[5],
            paddingBottom: theme.spacing[10],
            gap: theme.spacing[4],
          }}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton width="60%" height={28} borderRadius={10} />
          <Skeleton width="40%" height={20} borderRadius={8} />
          <Card
            size="lg"
            style={{ backgroundColor: theme.colors.background.secondary }}
          >
            <Skeleton width="80%" height={72} borderRadius={18} />
            <View style={{ height: theme.spacing[4] }} />
            <Skeleton width="100%" height={8} borderRadius={4} />
          </Card>
          <Skeleton
            lines={5}
            height={10}
            borderRadius={999}
            spacing={theme.spacing[3]}
          />
          <Skeleton
            lines={3}
            height={80}
            borderRadius={14}
            spacing={theme.spacing[3]}
          />
        </ScrollView>
      </Box>
    );
  }
  if (error || !state) {
    return (
      <Box
        flex={1}
        style={{ backgroundColor: theme.colors.background.primary }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + theme.spacing[5],
            paddingHorizontal: theme.spacing[5],
            paddingBottom: theme.spacing[10],
          }}
        >
          <ErrorState
            title="Couldn't load mastery data"
            description="We encountered an error loading your mastery progress. Please try again."
            onRetry={refetch}
          />
        </ScrollView>
      </Box>
    );
  }
  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing[5],
          paddingHorizontal: theme.spacing[5],
          paddingBottom: theme.spacing[10],
          gap: theme.spacing[6],
        }}
        showsVerticalScrollIndicator={false}
      >
        {}
        <Animated.View entering={FadeInUp.duration(400)}>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
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
              accessibilityHint="Activates this control"
            >
              <Icon
                name="close"
                size={24}
                color={theme.colors.text.secondary}
              />
            </Pressable>
          </Box>
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <Card
            size="lg"
            style={{ backgroundColor: theme.colors.background.secondary }}
          >
            <Box alignItems="center" gap="md">
              <MasteryRankBadge
                rank={state.rank}
                totalPoints={state.totalMasteryPoints}
                size="lg"
              />

              {}
              {pointsToNext > 0 && (
                <View style={{ width: "100%", gap: theme.spacing[2] }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text variant="caption" color="text.secondary">
                      Progress to {nextRankName}
                    </Text>
                    <Text variant="caption" color="text.tertiary">
                      {pointsToNext} MP needed
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      overflow: "hidden",
                      backgroundColor: theme.colors.background.tertiary,
                    }}
                  >
                    <Animated.View
                      style={[
                        {
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: rankDisplay.color,
                        },
                        progressStyle,
                      ]}
                    />
                  </View>
                </View>
              )}

              {pointsToNext === 0 && (
                <Text variant="body" color="success.DEFAULT" fontWeight="600">
                  Maximum Rank Achieved!
                </Text>
              )}
            </Box>
          </Card>
        </Animated.View>

        {}
        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={{ gap: theme.spacing[3] }}
        >
          <Text variant="h4" color="text.primary">
            Technique Mastery
          </Text>
          <Card
            size="md"
            style={{ backgroundColor: theme.colors.background.secondary }}
          >
            <View style={{ gap: theme.spacing[4] }}>
              {TECHNIQUES.map((tech) => (
                <View key={tech.key}>
                  <TechniqueBar
                    label={tech.label}
                    value={state.techniques[tech.key]}
                    max={25}
                    color={tech.color}
                  />
                  <Text
                    variant="caption"
                    color="text.tertiary"
                    style={{ marginTop: theme.spacing[1] }}
                  >
                    {tech.description}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {}
        <Animated.View
          entering={FadeInUp.duration(400).delay(300)}
          style={{ gap: theme.spacing[3] }}
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text variant="h4" color="text.primary">
              Active Challenges
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onPress={refreshChallenges}
              accessibilityLabel="Refresh challenges"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Icon
                name="refresh"
                size={16}
                color={theme.colors.primary[500]}
              />
            </Button>
          </Box>

          {state.activeChallenges.length === 0 ? (
            <Card
              size="md"
              style={{ backgroundColor: theme.colors.background.secondary }}
            >
              <EmptyState
                icon="target"
                title="No active challenges"
                body="Complete sessions to unlock mastery challenges"
              />
            </Card>
          ) : (
            <View style={{ gap: theme.spacing[3] }}>
              {state.activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClaim={() => claimChallenge(challenge.id)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <RankUnlocks currentRank={state.rank} />
        </Animated.View>

        {}
        <Animated.View entering={FadeInUp.duration(400).delay(500)}>
          <HistoryChart state={state} />
        </Animated.View>
      </ScrollView>
    </Box>
  );
}
export default withScreenErrorBoundary(MasteryScreen, "Mastery");
