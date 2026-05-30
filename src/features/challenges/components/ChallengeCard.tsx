import React from "react";
import { View, Pressable, type ViewStyle } from "react-native";
import { Badge, Button, Card, Text } from "../../../components";
import { useTheme } from "../../../theme";
import type { UserChallengeSummary } from "../schemas";
import {
  getStatusBadge,
  getDifficultyVariant,
  formatDuration,
  challengeCardStyles as styles,
} from "./challengeCardHelpers";

interface ChallengeCardProps {
  challenge: UserChallengeSummary;
  onClaim?: () => void;
  onReroll?: () => void;
  loading?: boolean;
}

export function ChallengeCard({
  challenge,
  onClaim,
  onReroll,
  loading = false,
}: ChallengeCardProps): JSX.Element {
  const { theme } = useTheme();
  const isActionable =
    challenge.status === "ACTIVE" || challenge.status === "COMPLETED";
  const cardStyle: ViewStyle = challenge.isExpired
    ? { ...styles.container, ...styles.expiredContainer }
    : styles.container;
  const statusBadge = getStatusBadge(challenge.status);
  return (
    <Card style={cardStyle}>
      <View style={styles.header}>
        <View style={styles.categoryRow}>
          <Badge variant="outline" size="sm">
            {challenge.type}
          </Badge>
          <Badge variant={getDifficultyVariant(challenge.difficulty)} size="sm">
            {challenge.difficulty}
          </Badge>
          {statusBadge}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.text.secondary }]}
          numberOfLines={2}
        >
          {challenge.description}
        </Text>
      </View>

      {challenge.status === "ACTIVE" && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {challenge.currentValue} / {challenge.targetValue}
            </Text>
            <Text
              style={[
                styles.progressPercent,
                { color: theme.colors.primary[500] },
              ]}
            >
              {Math.round(challenge.progressPercent)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: theme.colors.background.tertiary },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.colors.primary[500],
                  width: `${challenge.progressPercent}%`,
                },
              ]}
            />
          </View>
          {challenge.expiresInMs !== null && challenge.expiresInMs > 0 && (
            <Text
              style={[
                styles.expiresText,
                { color: theme.colors.error.DEFAULT },
              ]}
            >
              Expires in {formatDuration(challenge.expiresInMs)}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.rewardRow,
          { borderTopColor: theme.colors.border.light },
        ]}
      >
        <Text
          style={[styles.rewardText, { color: theme.colors.success.DEFAULT }]}
        >
          Reward: {challenge.rewardAmount} {challenge.rewardType}
        </Text>
      </View>

      {isActionable && (
        <View
          style={[
            styles.actionsRow,
            { borderTopColor: theme.colors.border.light },
          ]}
        >
          {challenge.status === "COMPLETED" && onClaim && (
            <Button
              variant="primary"
              onPress={onClaim}
              style={styles.actionButton}
              isLoading={loading}
              isDisabled={loading}
              accessibilityLabel="Claim Reward button"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
              Claim Reward
            </Button>
          )}

          {challenge.status === "ACTIVE" && challenge.canReroll && onReroll && (
            <Pressable
              onPress={onReroll}
              style={({ pressed }) => [
                styles.rerollButton,
                pressed && { opacity: 0.8 },
              ]}
              disabled={loading}
              accessibilityLabel="Challenge card"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
              <Badge variant="outline">
                {challenge.freeRerollAvailable
                  ? "Free Reroll"
                  : `${challenge.rerollCost} Gems`}
              </Badge>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  );
}
