import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";
interface StreakFlameChainProps {
  currentStreak: number;
  longestStreak: number;
  isAtRisk: boolean;
  riskLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  streakDays: Array<{
    date: string;
    completed: boolean;
    hasMilestone?: boolean;
  }>;
}
const DAY_SIZE = 44;
const SPACING = 8;
export const StreakFlameChain: React.FC<StreakFlameChainProps> = ({
  currentStreak,
  longestStreak,
  isAtRisk,
  riskLevel,
  streakDays,
}) => {
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    if (isAtRisk) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 120 });
    }
  }, [isAtRisk, pulseAnim]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));
  const getRiskColor = () => {
    switch (riskLevel) {
      case "CRITICAL":
        return launchColors.hex_f44336;
      case "HIGH":
        return launchColors.hex_ff9800;
      case "MEDIUM":
        return launchColors.hex_ffc107;
      case "LOW":
        return launchColors.hex_ffeb3b;
      default:
        return launchColors.hex_4caf50;
    }
  };
  const getFlameColor = (index: number, completed: boolean) => {
    if (!completed) {
      return [launchColors.hex_3a3a5a, launchColors.hex_2a2a4a];
    }
    const day = index + 1;
    if (day >= 100) {
      return [launchColors.hex_ffd700, launchColors.hex_ff6b35];
    }
    if (day >= 30) {
      return [launchColors.hex_ff6b35, launchColors.hex_f44336];
    }
    if (day >= 7) {
      return [launchColors.hex_ff9800, launchColors.hex_ff5722];
    }
    return [launchColors.hex_ffc107, launchColors.hex_ff9800];
  };
  const renderDayNode = (day: (typeof streakDays)[0], index: number) => {
    const isCompleted = day.completed;
    const isToday = index === streakDays.length - 1;
    const [flameColor1] = getFlameColor(index, isCompleted);
    const hasMilestone = day.hasMilestone;
    return (
      <Animated.View
        key={day.date}
        style={[
          styles.dayNode,
          isCompleted && isAtRisk ? pulseStyle : undefined,
        ]}
      >
        <View
          style={[
            styles.dayCircle,
            isCompleted && {
              backgroundColor: flameColor1,
              shadowColor: flameColor1,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 8,
            },
            !isCompleted && styles.inactiveCircle,
            isToday && styles.todayCircle,
          ]}
        >
          <Text
            style={[styles.dayNumber, isCompleted && styles.activeDayNumber]}
          >
            {index + 1}
          </Text>

          {}
          {isCompleted && (
            <View style={styles.flameIcon}>
              <Text style={styles.flameEmoji}>🔥</Text>
            </View>
          )}

          {}
          {hasMilestone && (
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneEmoji}>⭐</Text>
            </View>
          )}
        </View>

        {}
        {index < streakDays.length - 1 &&
          isCompleted &&
          streakDays[index + 1]?.completed && (
            <View
              style={[styles.connector, { backgroundColor: flameColor1 }]}
            />
          )}
      </Animated.View>
    );
  };
  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{currentStreak}</Text>
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.longestText}>Best: {longestStreak} days</Text>
        </View>
        {isAtRisk && (
          <Animated.View style={[styles.riskBadge, pulseStyle]}>
            <Text style={styles.riskEmoji}>⚠️</Text>
            <Text style={[styles.riskText, { color: getRiskColor() }]}>
              AT RISK
            </Text>
          </Animated.View>
        )}
      </View>

      {}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(currentStreak / Math.max(longestStreak, 30)) * 100}%`,
                backgroundColor: isAtRisk
                  ? getRiskColor()
                  : launchColors.hex_ff6b35,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((currentStreak / Math.max(longestStreak, 30)) * 100)}% to
          record
        </Text>
      </View>

      {}
      <View style={styles.chainContainer}>
        {streakDays.map((day, index) => renderDayNode(day, index))}
      </View>

      {}
      {(() => {
        const milestones = [3, 7, 14, 30, 60, 100, 180, 365];
        const nextMilestone = milestones.find((m) => m > currentStreak);
        if (nextMilestone) {
          const remaining = nextMilestone - currentStreak;
          return (
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneEmojiSmall}>🎯</Text>
              <Text style={styles.milestoneText}>
                {remaining} day{remaining !== 1 ? "s" : ""} until{" "}
                {nextMilestone}-day milestone!
              </Text>
              <Text style={styles.milestoneReward}>
                Reward: {getMilestoneReward(nextMilestone)}
              </Text>
            </View>
          );
        }
        return null;
      })()}
    </View>
  );
};
const getMilestoneReward = (days: number): string => {
  const rewards: Record<number, string> = {
    3: "100 Coins",
    7: "250 Coins",
    14: "25 Gems",
    30: "Streak Shield",
    60: "100 Gems",
    100: "250 Gems",
    180: "500 Gems",
    365: "1000 Gems + Legendary Badge",
  };
  return rewards[days] || "Special Reward";
};
const styles = createSheet({
  container: {
    backgroundColor: launchColors.hex_1a1a2e,
    borderRadius: 20,
    padding: 20,
    margin: 16,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: launchColors.rgb_255_107_53_0_2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: launchColors.hex_ff6b35,
  },
  streakEmoji: { fontSize: 24, marginRight: 8 },
  streakCount: {
    fontSize: 28,
    fontWeight: "bold",
    color: launchColors.hex_ff6b35,
  },
  streakInfo: { marginLeft: 16, flex: 1 },
  streakLabel: { fontSize: 16, fontWeight: "600", color: launchColors.hex_fff },
  longestText: {
    fontSize: 12,
    color: launchColors.rgb_255_255_255_0_5,
    marginTop: 2,
  },
  riskBadge: { alignItems: "center", padding: 8 },
  riskEmoji: { fontSize: 20 },
  riskText: { fontSize: 10, fontWeight: "bold", marginTop: 4 },
  progressContainer: { marginBottom: 20 },
  progressTrack: {
    height: 8,
    backgroundColor: launchColors.hex_2a2a4a,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: {
    fontSize: 11,
    color: launchColors.rgb_255_255_255_0_5,
    marginTop: 6,
    textAlign: "right",
  },
  chainContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING,
    marginBottom: 16,
  },
  dayNode: { position: "relative" },
  dayCircle: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    backgroundColor: launchColors.hex_2a2a4a,
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveCircle: {
    backgroundColor: launchColors.hex_2a2a4a,
    borderWidth: 2,
    borderColor: launchColors.hex_3a3a5a,
  },
  todayCircle: { borderWidth: 3, borderColor: launchColors.hex_4caf50 },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: launchColors.rgb_255_255_255_0_3,
  },
  activeDayNumber: { color: launchColors.hex_fff },
  flameIcon: { position: "absolute", top: -4, right: -4 },
  flameEmoji: { fontSize: 16 },
  milestoneBadge: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    marginLeft: -8,
  },
  milestoneEmoji: { fontSize: 16 },
  connector: {
    position: "absolute",
    right: -SPACING,
    top: "50%",
    width: SPACING,
    height: 4,
    marginTop: -2,
  },
  milestoneCard: {
    backgroundColor: launchColors.rgb_255_215_0_0_1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: launchColors.rgb_255_215_0_0_3,
    alignItems: "center",
  },
  milestoneEmojiSmall: { fontSize: 20, marginBottom: 4 },
  milestoneText: {
    fontSize: 13,
    color: launchColors.hex_fff,
    textAlign: "center",
    fontWeight: "600",
  },
  milestoneReward: {
    fontSize: 11,
    color: launchColors.hex_ffd700,
    marginTop: 4,
  },
});
