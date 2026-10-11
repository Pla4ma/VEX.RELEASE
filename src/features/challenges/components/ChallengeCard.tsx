import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import { vexFire } from '../../../theme/tokens/vex-fire';
import type { UserChallengeSummary } from '../schemas';
import {
  getStatusBadge,
  getDifficultyVariant,
  formatDuration,
  challengeCardStyles as styles,
} from './challengeCardHelpers';

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
}: ChallengeCardProps): React.ReactNode {
  const isActionable =
    challenge.status === 'ACTIVE' || challenge.status === 'COMPLETED';
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
          style={[styles.description, { color: vexFire.textSecondary }]}
          numberOfLines={2}
        >
          {challenge.description}
        </Text>
      </View>

      {challenge.status === 'ACTIVE' && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {challenge.currentValue} / {challenge.targetValue}
            </Text>
            <Text
              style={[
                styles.progressPercent,
                { color: vexFire.ember },
              ]}
            >
              {Math.round(challenge.progressPercent)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: vexFire.backgroundSoft },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: vexFire.ember,
                  width: `${challenge.progressPercent}%`,
                },
              ]}
            />
          </View>
          {challenge.expiresInMs !== null && challenge.expiresInMs > 0 && (
            <Text
              style={[
                styles.expiresText,
                { color: vexFire.danger },
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
          { borderTopColor: vexFire.line },
        ]}
      >
        <Text
          style={[styles.rewardText, { color: vexFire.success }]}
        >
          Reward: {challenge.rewardAmount} {challenge.rewardType}
        </Text>
      </View>

      {isActionable && (
        <View
          style={[
            styles.actionsRow,
            { borderTopColor: vexFire.line },
          ]}
        >
          {challenge.status === 'COMPLETED' && onClaim && (
            <Button variant="primary"
              onPress={onClaim}
              style={styles.actionButton}
              isLoading={loading}
              isDisabled={loading}
              accessibilityLabel="Claim challenge reward"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
              <VexText>Claim Reward</VexText>
            </Button>
          )}

          {challenge.status === 'ACTIVE' && challenge.canReroll && onReroll && (
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
                  ? 'Free Reroll'
                  : `${challenge.rerollCost} Gems`}
              </Badge>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  );
}
