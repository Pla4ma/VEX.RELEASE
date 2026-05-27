/**
 * DailyQuestCard
 *
 * Displays the user's personalized daily quest from PersonalQuestGenerator.
 * Pinned at top of AICoachScreen message list.
 *
 * @phase 6
 */

import React from "react";
import { View, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeContext";
import { Text, ProgressBar } from "../../../components";
import type { PersonalQuest } from "../PersonalQuestGenerator";

interface DailyQuestCardProps {
  quest: PersonalQuest | null;
  coachName: string;
  onPress?: () => void;
}

export function DailyQuestCard({
  quest,
  coachName,
  onPress,
}: DailyQuestCardProps): JSX.Element {
  const { theme } = useTheme();

  const formatTimeRemaining = (): string => {
    const now = Date.now();
    const expiresAt = quest?.expiresAt || now;
    const hoursRemaining = Math.max(
      0,
      Math.ceil((expiresAt - now) / (1000 * 60 * 60)),
    );
    return hoursRemaining > 1 ? `${hoursRemaining} hours` : "Less than 1 hour";
  };

  const getQuestIcon = (type: string): string => {
    const icons: Record<string, string> = {
      PEAK_TIME_FOCUS: "🎯",
      BEAT_PERSONAL_BEST: "🏆",
      NO_PAUSE_CHALLENGE: "🧘",
      STREAK_PROTECTION: "🛡️",
      QUALITY_GRADE_TARGET: "⭐",
      DURATION_MILESTONE: "⏱️",
      BOSS_DAMAGE_DEALT: "⚔️",
      RIVAL_OUTFOCUS: "🏁",
      SQUAD_SUPPORT: "🛡️",
    };
    return icons[type] || "📋";
  };

  const progressPercent = quest
    ? Math.min(100, Math.round((quest.current / quest.target) * 100))
    : 0;

  const isCompleted = quest ? quest.current >= quest.target : false;

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={{
        marginHorizontal: theme.spacing[4],
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[2],
        backgroundColor: isCompleted
          ? theme.colors.success[500] + "15"
          : theme.colors.primary[500] + "10",
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: isCompleted
          ? theme.colors.success[500]
          : theme.colors.primary[500],
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <View style={{ padding: theme.spacing[4] }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3],
            }}
          >
            <Text fontSize={24}>{quest ? getQuestIcon(quest.type) : "🤖"}</Text>
            <View style={{ flex: 1 }}>
              <Text
                variant="h3"
                color={isCompleted ? "success" : "primary"}
                style={{ marginBottom: 2 }}
              >
                {isCompleted ? "Quest Complete!" : "Today's Quest"}
              </Text>
              <Text variant="caption" color="secondary">
                {quest ? `From ${coachName}` : `From ${coachName}`}
              </Text>
            </View>
            {isCompleted && (
              <View
                style={{
                  backgroundColor: theme.colors.success[500],
                  borderRadius: theme.borderRadius.full,
                  paddingHorizontal: theme.spacing[2],
                  paddingVertical: theme.spacing[1],
                }}
              >
                <Text
                  style={{
                    color: theme.colors.background.primary,
                    fontWeight: "600",
                  }}
                >
                  ✓ Done
                </Text>
              </View>
            )}
          </View>

          {/* Quest Content */}
          {quest ? (
            <>
              <Text variant="h4" style={{ marginBottom: theme.spacing[1] }}>
                {quest.title}
              </Text>
              <Text
                variant="body"
                color="secondary"
                style={{ marginBottom: theme.spacing[3], lineHeight: 20 }}
              >
                {quest.description}
              </Text>

              {/* Progress */}
              <View style={{ marginBottom: theme.spacing[2] }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: theme.spacing[1],
                  }}
                >
                  <Text variant="caption" color="secondary">
                    Progress
                  </Text>
                  <Text variant="caption" color="primary" weight="semibold">
                    {quest.current}/{quest.target} {quest.unit}
                  </Text>
                </View>
                <ProgressBar
                  progress={progressPercent / 100}
                  fillColor={
                    isCompleted
                      ? theme.colors.success[500]
                      : theme.colors.primary[500]
                  }
                  height={8}
                />
              </View>

              {/* Footer */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: theme.spacing[2],
                  paddingTop: theme.spacing[2],
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border.light,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing[1],
                  }}
                >
                  <Text fontSize={14}>🏆</Text>
                  <Text variant="caption" color="secondary">
                    {quest.rewardXp} XP
                  </Text>
                </View>
                <Text variant="caption" color="secondary">
                  ⏰ {formatTimeRemaining()} remaining
                </Text>
              </View>
            </>
          ) : (
            <View
              style={{
                alignItems: "center",
                paddingVertical: theme.spacing[4],
              }}
            >
              <Text
                variant="body"
                color="secondary"
                style={{ textAlign: "center", marginBottom: theme.spacing[2] }}
              >
                No quest today — {coachName} is analyzing your patterns
              </Text>
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: theme.colors.primary[500] + "30",
                  borderRadius: theme.borderRadius.full,
                }}
              />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
