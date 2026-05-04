/**
 * RivalChallengeCard Component
 *
 * Shows a rival challenge with countdown, progress, and action buttons.
 * Challenge types: 24h focus duel, best session quality, first boss defeat.
 *
 * @phase 7
 */

import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { RivalChallenge } from '../hooks';

export interface RivalChallengeCardProps {
  /** Challenge data */
  challenge: RivalChallenge;
  /** Current user ID to determine perspective */
  currentUserId: string;
  /** Called when accepting a pending challenge */
  onAccept?: () => void;
  /** Called when declining a pending challenge */
  onDecline?: () => void;
  /** Called when navigating to challenge detail */
  onPress?: () => void;
  /** Optional loading state for actions */
  isLoading?: boolean;
}

/**
 * Get human-readable label for challenge type
 */
function getChallengeTypeLabel(type: RivalChallenge['type']): string {
  switch (type) {
    case 'FOCUS_TIME_24H':
      return '⚔️ 24h Focus Duel';
    case 'SESSION_QUALITY_TODAY':
      return '🎯 Best Session Quality';
    case 'FIRST_BOSS_DEFEAT':
      return '👹 First to Defeat a Boss';
    default:
      return '⚔️ Challenge';
  }
}

/**
 * Get challenge description based on type
 */
function getChallengeDescription(type: RivalChallenge['type']): string {
  switch (type) {
    case 'FOCUS_TIME_24H':
      return 'Who can focus the most in 24 hours?';
    case 'SESSION_QUALITY_TODAY':
      return 'Who will get the highest session grade today?';
    case 'FIRST_BOSS_DEFEAT':
      return 'First to defeat any boss wins!';
    default:
      return 'May the best focuser win!';
  }
}

/**
 * Format time remaining as readable string
 */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) {return 'Challenge ended';}

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  }
  return `${seconds}s remaining`;
}

/**
 * Countdown hook for live timer updates
 */
function useCountdown(targetTime: number | undefined): string {
  const [timeLeft, setTimeLeft] = useState(() =>
    targetTime ? Math.max(0, targetTime - Date.now()) : 0
  );

  useEffect(() => {
    if (!targetTime) {return;}

    const update = () => {
      const remaining = Math.max(0, targetTime - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    };

    const interval = setInterval(update, 1000);
    update();

    return () => clearInterval(interval);
  }, [targetTime]);

  return formatTimeRemaining(timeLeft);
}

/**
 * Pulsing animation for active challenges
 */
function useActivePulse() {
  return useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(1.02, { duration: 1000 })
          ),
          -1,
          true
        ),
      },
    ],
  }));
}

export function RivalChallengeCard({
  challenge,
  currentUserId,
  onAccept,
  onDecline,
  onPress,
  isLoading = false,
}: RivalChallengeCardProps): JSX.Element {
  const { theme } = useTheme();
  const isChallenger = challenge.challengerId === currentUserId;
  const isPending = challenge.status === 'PENDING';
  const isActive = challenge.status === 'ACTIVE';
  const isCompleted = challenge.status === 'COMPLETED';

  const timeRemaining = useCountdown(challenge.endsAt);
  const pulseStyle = useActivePulse();

  // Calculate winner
  const isWinner = challenge.winnerId === currentUserId;
  const isLoser = challenge.winnerId && challenge.winnerId !== currentUserId;

  const opponentName = isChallenger ? challenge.challengedName : challenge.challengerName;

  // Score display
  const myScore = isChallenger ? challenge.challengerScore : challenge.challengedScore;
  const theirScore = isChallenger ? challenge.challengedScore : challenge.challengerScore;

  return (
    <Pressable onPress={onPress} disabled={isLoading}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[
          {
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing[4],
            marginBottom: theme.spacing[3],
            borderWidth: 2,
            borderColor: isActive
              ? theme.colors.primary[500]
              : isCompleted && isWinner
              ? theme.colors.success[500]
              : isCompleted && isLoser
              ? theme.colors.error[500]
              : theme.colors.border.light,
          },
          isActive && pulseStyle,
        ]}
      >
        {/* Header: Type and Status */}
        <Animated.View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing[3],
          }}
        >
          <Text variant="body" fontWeight="600" color={theme.colors.text.primary}>
            {getChallengeTypeLabel(challenge.type)}
          </Text>

          <Animated.View
            style={{
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[1],
              backgroundColor: isPending
                ? `${theme.colors.warning[500]}20`
                : isActive
                ? `${theme.colors.primary[500]}20`
                : isWinner
                ? `${theme.colors.success[500]}20`
                : isLoser
                ? `${theme.colors.error[500]}20`
                : theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Text
              variant="caption"
              color={
                isPending
                  ? theme.colors.warning[500]
                  : isActive
                  ? theme.colors.primary[500]
                  : isWinner
                  ? theme.colors.success[500]
                  : isLoser
                  ? theme.colors.error[500]
                  : theme.colors.text.tertiary
              }
              fontWeight="600"
            >
              {isPending ? 'Pending' : isActive ? 'Active' : isWinner ? 'Won!' : isLoser ? 'Lost' : 'Draw'}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Description */}
        <Text variant="bodySmall" color={theme.colors.text.secondary} style={{ marginBottom: theme.spacing[3] }}>
          {getChallengeDescription(challenge.type)}
        </Text>

        {/* Opponent Info */}
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[3],
            marginBottom: theme.spacing[3],
          }}
        >
          {/* Avatar placeholder */}
          <Animated.View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isChallenger ? theme.colors.primary[500] : theme.colors.accent.purple,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text fontSize={18} color={theme.colors.text.inverse} fontWeight="600">
              {isChallenger ? '🎯' : '⚔️'}
            </Text>
          </Animated.View>

          <Animated.View style={{ flex: 1 }}>
            <Text variant="body" color={theme.colors.text.primary} fontWeight="600">
              {isChallenger ? `Challenged: ${opponentName}` : `From: ${opponentName}`}
            </Text>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              {isPending
                ? 'Waiting for response...'
                : isActive
                ? timeRemaining
                : 'Challenge completed'}
            </Text>
          </Animated.View>

          {/* Reward badge */}
          <Animated.View
            style={{
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              backgroundColor: `${theme.colors.accent.orange}15`,
              borderRadius: theme.borderRadius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing[1],
            }}
          >
            <Text fontSize={12}>🏆</Text>
            <Text variant="caption" color={theme.colors.accent.orange} fontWeight="600">
              {challenge.rewardXp} XP
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Live Score Comparison - Only show for active/completed */}
        {(isActive || isCompleted) && (
          <Animated.View
            style={{
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing[3],
              marginBottom: theme.spacing[3],
            }}
          >
            {/* Score bars */}
            <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
              {/* My score */}
              <Animated.View style={{ alignItems: 'center', flex: 1 }}>
                <Text variant="caption" color={theme.colors.text.tertiary} style={{ marginBottom: 4 }}>
                  You
                </Text>
                <Text
                  variant="h3"
                  color={
                    myScore > theirScore
                      ? theme.colors.success[500]
                      : myScore < theirScore
                      ? theme.colors.error[500]
                      : theme.colors.text.primary
                  }
                  fontWeight="700"
                >
                  {myScore}
                </Text>
              </Animated.View>

              {/* VS */}
              <Text variant="caption" color={theme.colors.text.tertiary} fontWeight="700">
                VS
              </Text>

              {/* Their score */}
              <Animated.View style={{ alignItems: 'center', flex: 1 }}>
                <Text variant="caption" color={theme.colors.text.tertiary} style={{ marginBottom: 4 }}>
                  Rival
                </Text>
                <Text
                  variant="h3"
                  color={
                    theirScore > myScore
                      ? theme.colors.success[500]
                      : theirScore < myScore
                      ? theme.colors.error[500]
                      : theme.colors.text.primary
                  }
                  fontWeight="700"
                >
                  {theirScore}
                </Text>
              </Animated.View>
            </Animated.View>

            {/* Progress bar */}
            <Animated.View
              style={{
                flexDirection: 'row',
                height: 6,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: 3,
                overflow: 'hidden',
                marginTop: theme.spacing[2],
              }}
            >
              <Animated.View
                style={{
                  width: `${myScore + theirScore > 0 ? (myScore / (myScore + theirScore)) * 100 : 50}%`,
                  backgroundColor: myScore >= theirScore ? theme.colors.success[500] : theme.colors.error[500],
                  height: '100%',
                }}
              />
              <Animated.View
                style={{
                  width: `${myScore + theirScore > 0 ? (theirScore / (myScore + theirScore)) * 100 : 50}%`,
                  backgroundColor: theirScore > myScore ? theme.colors.success[500] : theme.colors.error[500],
                  height: '100%',
                }}
              />
            </Animated.View>
          </Animated.View>
        )}

        {/* Action Buttons - Only show for pending challenges received */}
        {!isChallenger && isPending && (
          <Animated.View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
            <Pressable
              onPress={onAccept}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: isLoading ? theme.colors.background.tertiary : theme.colors.primary[500],
                paddingVertical: theme.spacing[3],
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                opacity: isLoading ? 0.7 : 1,
              }}

            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              <Text color={theme.colors.text.inverse} fontWeight="600">
                {isLoading ? '...' : 'Accept Challenge'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDecline}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: theme.colors.background.tertiary,
                paddingVertical: theme.spacing[3],
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                opacity: isLoading ? 0.7 : 1,
              }}

            accessibilityLabel="Decline button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              <Text color={theme.colors.text.secondary} fontWeight="600">
                Decline
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Pending indicator for sent challenges */}
        {isChallenger && isPending && (
          <Animated.View
            style={{
              backgroundColor: `${theme.colors.warning[500]}15`,
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.lg,
              alignItems: 'center',
            }}
          >
            <Text variant="bodySmall" color={theme.colors.warning[500]}>
              ⏳ Waiting for {opponentName} to accept...
            </Text>
          </Animated.View>
        )}

        {/* Result banner for completed */}
        {isCompleted && (
          <Animated.View
            style={{
              backgroundColor: isWinner
                ? `${theme.colors.success[500]}15`
                : isLoser
                ? `${theme.colors.error[500]}15`
                : theme.colors.background.tertiary,
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.lg,
              alignItems: 'center',
            }}
          >
            <Text
              variant="body"
              color={isWinner ? theme.colors.success[500] : isLoser ? theme.colors.error[500] : theme.colors.text.secondary}
              fontWeight="600"
            >
              {isWinner ? '🎉 You won! +' : isLoser ? '😔 You lost this one' : '🤝 It\'s a draw!'}
              {isWinner ? ` ${challenge.rewardXp} XP` : ''}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default RivalChallengeCard;
