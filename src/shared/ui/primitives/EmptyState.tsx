import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../theme";
import { useFadeIn, useSlideIn } from "../hooks/useReanimated";
import { createSheet } from "@/shared/ui/create-sheet";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  animated = true,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const fadeStyle = useFadeIn(500, animated ? 100 : 0);
  const slideStyle = useSlideIn("up", 30);
  const containerStyle = animated ? fadeStyle : undefined;
  const contentStyle = animated ? slideStyle : undefined;
  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.background.tertiary },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.message, { color: theme.colors.text.tertiary }]}>
          {message}
        </Text>

        {(actionLabel || secondaryActionLabel) && (
          <View style={styles.actions}>
            {actionLabel && onAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary[500] },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onAction}
                accessibilityLabel="Interactive control"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.colors.text.inverse },
                  ]}
                >
                  {actionLabel}
                </Text>
              </Pressable>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onSecondaryAction}
                accessibilityLabel="Interactive control"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.colors.primary[500] },
                  ]}
                >
                  {secondaryActionLabel}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export function EmptyAnalytics({
  onStartSession,
}: {
  onStartSession?: () => void;
}) {
  return (
    <EmptyState
      icon="📊"
      title="No Data Yet"
      message="We can't analyze what hasn't happened. One session changes everything — your patterns, your insights, your trajectory."
      actionLabel="Start First Session"
      onAction={onStartSession}
    />
  );
}

export function EmptyInsights({
  onViewSessions,
}: {
  onViewSessions?: () => void;
}) {
  return (
    <EmptyState
      icon="💡"
      title="Pattern Analysis Pending"
      message="We need more focus sessions to understand your rhythm. The AI Coach learns from consistency — give it something to work with."
      actionLabel="View Sessions"
      onAction={onViewSessions}
    />
  );
}

export function EmptyChallenges({
  onBrowseChallenges,
}: {
  onBrowseChallenges?: () => void;
}) {
  return (
    <EmptyState
      icon="🏆"
      title="No Active Challenges"
      message="Challenges are where legends are made. Pick a mission, rally your squad, and prove what you're capable of."
      actionLabel="Find a Challenge"
      onAction={onBrowseChallenges}
    />
  );
}

export function EmptyNotifications({
  onAdjustSettings,
}: {
  onAdjustSettings?: () => void;
}) {
  return (
    <EmptyState
      icon="🔔"
      title="Quiet... Too Quiet"
      message="Nothing to see yet — but your streak breaking would change that real fast. 👀"
      secondaryActionLabel="Notification Settings"
      onSecondaryAction={onAdjustSettings}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="🌐"
      title="VEX Lost Connection"
      message="Your progress is safe locally. Check your connection and we'll sync when you're back online."
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export function EmptyFeed({
  bossName,
  onStartSession,
}: {
  bossName: string;
  onStartSession?: () => void;
}) {
  return (
    <EmptyState
      icon="👹"
      title="The Arena Awaits"
      message={`${bossName} is waiting. Your squad has no sessions to show yet. Change that.`}
      actionLabel="Start a Session"
      onAction={onStartSession}
    />
  );
}

export function EmptyRivals({ onFindRivals }: { onFindRivals?: () => void }) {
  return (
    <EmptyState
      icon="⚔️"
      title="No Rivals Yet"
      message="Ghost rivals are warming your seat. They're already focused. Find real competitors and take them on."
      actionLabel="Find Rivals"
      onAction={onFindRivals}
    />
  );
}

export function EmptyAchievements({
  onStartSession,
}: {
  onStartSession?: () => void;
}) {
  return (
    <EmptyState
      icon="🏆"
      title="Zero Achievements"
      message="Zero. One session changes that permanently. Every legend starts with a single focus block."
      actionLabel="Start Session"
      onAction={onStartSession}
    />
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  content: { alignItems: "center", maxWidth: 400 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: { flexDirection: "column", gap: 12, width: "100%" },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: { fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: { fontSize: 16, fontWeight: "500" },
});
