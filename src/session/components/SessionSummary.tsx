import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { SessionSummary as SessionSummaryType } from "../types";
import { getGrade, type MoodType } from "./SessionSummary.helpers";
import { SessionSummaryMoodSelector } from "./SessionSummaryMoodSelector";
import { SessionSummaryStats } from "./SessionSummaryStats";
import styles from "./SessionSummary.styles";

interface SessionSummaryProps {
  summary: SessionSummaryType;
  onClose: () => void;
  onShare?: () => void;
  onStartNew?: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  summary,
  onClose,
  onShare,
  onStartNew,
}) => {
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState<MoodType>(null);
  const scaleAnim = useSharedValue(0);
  React.useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 120 });
  }, [scaleAnim]);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));
  const grade = getGrade(summary.finalScore);
  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, scaleStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>Session Complete! 🎉</Text>
          <Text style={styles.subtitle}>
            {summary.status === "COMPLETED"
              ? "Great job staying focused!"
              : "Session ended"}
          </Text>
        </View>

        <View style={[styles.scoreCircle, { borderColor: grade.color }]}>
          <Text style={[styles.scoreLetter, { color: grade.color }]}>
            {grade.letter}
          </Text>
          <Text style={styles.scoreNumber}>{summary.finalScore}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </View>

        <SessionSummaryStats summary={summary} />

        {(summary.xpEarned > 0 ||
          summary.coinsEarned > 0 ||
          summary.gemsEarned > 0) && (
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Rewards Earned</Text>
            <View style={styles.rewardsRow}>
              {summary.xpEarned > 0 && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>⭐</Text>
                  <Text style={styles.rewardValue}>+{summary.xpEarned}</Text>
                  <Text style={styles.rewardLabel}>XP</Text>
                </View>
              )}
              {summary.coinsEarned > 0 && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>🪙</Text>
                  <Text style={styles.rewardValue}>+{summary.coinsEarned}</Text>
                  <Text style={styles.rewardLabel}>Coins</Text>
                </View>
              )}
              {summary.gemsEarned > 0 && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>💎</Text>
                  <Text style={styles.rewardValue}>+{summary.gemsEarned}</Text>
                  <Text style={styles.rewardLabel}>Gems</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {summary.streakMaintained && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {summary.streakDays} Day Streak!
            </Text>
            {summary.streakIncreased && (
              <Text style={styles.streakBonus}>+1 day</Text>
            )}
          </View>
        )}

        {summary.bonuses && summary.bonuses.length > 0 && (
          <View style={styles.bonusesSection}>
            <Text style={styles.sectionTitle}>Bonus Awards</Text>
            {summary.bonuses.map((bonus, index) => (
              <View key={index} style={styles.bonusItem}>
                <Text style={styles.bonusIcon}>🏆</Text>
                <View style={styles.bonusInfo}>
                  <Text style={styles.bonusType}>{bonus.type}</Text>
                  <Text style={styles.bonusDescription}>
                    {bonus.description}
                  </Text>
                </View>
                <Text style={styles.bonusAmount}>+{bonus.amount}</Text>
              </View>
            ))}
          </View>
        )}

        <SessionSummaryMoodSelector
          mood={mood}
          reflection={reflection}
          onMoodChange={setMood}
          onReflectionChange={setReflection}
        />

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.shareButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onShare}
            accessibilityLabel="📤 Share button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.newSessionButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onStartNew}
            accessibilityLabel="▶ New Session button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.newSessionButtonText}>▶ New Session</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onClose}
            accessibilityLabel="Close button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default SessionSummary;
