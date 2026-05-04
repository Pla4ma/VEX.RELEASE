/**
 * RivalLeaderboardWidget Component
 *
 * Small card on Home screen showing rival standings.
 * "You're 23 minutes behind [Name]. One session closes the gap."
 *
 * @phase 7
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../theme';
import type { CurrentRival } from '../schemas';
import { formatFocusMinutes } from '../service';

export interface RivalLeaderboardWidgetProps {
  /** Current user's rival data */
  myRival: CurrentRival | null;
  /** User's average session length for gap calculation */
  avgSessionMinutes?: number;
  /** Navigate to full Rivals screen */
  onPress?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

interface RivalLeader {
  name: string;
  focusMinutes: number;
  isMe: boolean;
  rank: number;
}

/**
 * Calculate motivational message based on gap
 */
function getMotivationalMessage(
  myMinutes: number,
  rivalMinutes: number,
  rivalName: string,
  avgSessionMinutes: number = 25
): string {
  const gap = rivalMinutes - myMinutes;

  if (gap <= 0) {
    // I'm ahead
    const myLead = myMinutes - rivalMinutes;
    if (myLead < 15) {
      return 'You\'re barely ahead! Keep focusing to secure the win.';
    } else if (myLead < 60) {
      return `Nice lead! Don't let ${rivalName} catch up.`;
    } else {
      return `Dominating! ${rivalName} needs ${formatFocusMinutes(gap)} to catch you.`;
    }
  }

  // I'm behind
  const sessionsNeeded = Math.ceil(gap / avgSessionMinutes);

  if (gap <= 15) {
    return `You're just ${formatFocusMinutes(gap)} behind. One quick session!`;
  } else if (gap <= avgSessionMinutes) {
    return `You're ${formatFocusMinutes(gap)} behind ${rivalName}. One solid session closes the gap!`;
  } else if (sessionsNeeded <= 2) {
    return `You're ${formatFocusMinutes(gap)} behind. ${sessionsNeeded} focused sessions and you're leading!`;
  } else {
    return `${rivalName} is ahead by ${formatFocusMinutes(gap)}. Time to focus!`;
  }
}

/**
 * Get status color based on relative position
 */
function getStatusColor(
  myMinutes: number,
  rivalMinutes: number,
  colors: Record<string, any>
): string {
  if (myMinutes > rivalMinutes) {
    return colors.success[500];
  } else if (myMinutes < rivalMinutes) {
    return colors.error[500];
  }
  return colors.warning[500];
}

/**
 * Mini leaderboard item
 */
function LeaderboardItem({
  leader,
  isLast,
  theme,
}: {
  leader: RivalLeader;
  isLast: boolean;
  theme: any;
}): JSX.Element {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.border.light,
      }}
    >
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text fontSize={14}>{getRankIcon(leader.rank)}</Text>
        <Animated.View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: leader.isMe
              ? theme.colors.primary[500]
              : theme.colors.background.tertiary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            fontSize={12}
            color={leader.isMe ? theme.colors.text.inverse : theme.colors.text.tertiary}
            fontWeight={leader.isMe ? '600' : '400'}
          >
            {leader.name.charAt(0).toUpperCase()}
          </Text>
        </Animated.View>
        <Text
          variant="bodySmall"
          color={leader.isMe ? theme.colors.text.primary : theme.colors.text.secondary}
          fontWeight={leader.isMe ? '600' : '400'}
        >
          {leader.isMe ? 'You' : leader.name}
        </Text>
      </Animated.View>

      <Text
        variant="bodySmall"
        color={leader.isMe ? theme.colors.text.primary : theme.colors.text.tertiary}
        fontWeight={leader.isMe ? '600' : '400'}
      >
        {formatFocusMinutes(leader.focusMinutes)}
      </Text>
    </Animated.View>
  );
}

export function RivalLeaderboardWidget({
  myRival,
  avgSessionMinutes = 25,
  onPress,
  isLoading = false,
}: RivalLeaderboardWidgetProps): JSX.Element {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <Animated.View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Skeleton height={120} variant="rounded" />
      </Animated.View>
    );
  }

  // Don't render if no rival
  if (!myRival) {
    return (
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.xl,
            padding: 16,
            borderWidth: 2,
            borderColor: theme.colors.border.light,
            borderStyle: 'dashed',
          }}
        >
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text fontSize={24}>⚔️</Text>
            <Animated.View style={{ flex: 1 }}>
              <Text variant="body" color={theme.colors.text.secondary} fontWeight="600">
                Find Your Rival
              </Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                Compete weekly with someone at your level
              </Text>
            </Animated.View>
            <Text fontSize={16}>→</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }

  const myScore = myRival.weeklyScore.mine;
  const theirScore = myRival.weeklyScore.theirs;
  const isAhead = myScore > theirScore;
  const isTied = myScore === theirScore;

  const statusColor = getStatusColor(myScore, theirScore, theme.colors);
  const motivationalMessage = getMotivationalMessage(myScore, theirScore, myRival.profile.name, avgSessionMinutes);

  // Build leaderboard data (just me and my rival for now)
  // In the future, this could include more rivals
  const leaders: RivalLeader[] = [
    ...(myScore >= theirScore
      ? [
          { name: 'You', focusMinutes: myScore, isMe: true, rank: 1 },
          { name: myRival.profile.name, focusMinutes: theirScore, isMe: false, rank: 2 },
        ]
      : [
          { name: myRival.profile.name, focusMinutes: theirScore, isMe: false, rank: 1 },
          { name: 'You', focusMinutes: myScore, isMe: true, rank: 2 },
        ]
    ),
  ];

  return (
    <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: 16,
          borderWidth: 2,
          borderColor: statusColor,
        }}
      >
        {/* Header */}
        <Animated.View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text fontSize={18}>⚔️</Text>
            <Text variant="label" color={theme.colors.text.tertiary}>
              RIVALRY STANDINGS
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: `${statusColor}15`,
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Text variant="caption" color={statusColor} fontWeight="600">
              {isAhead ? 'Winning!' : isTied ? 'Tied' : 'Behind'}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Leaderboard */}
        <Animated.View style={{ marginBottom: 12 }}>
          {leaders.map((leader, index) => (
            <LeaderboardItem
              key={leader.name}
              leader={leader}
              isLast={index === leaders.length - 1}
              theme={theme}
            />
          ))}
        </Animated.View>

        {/* Gap indicator */}
        <Animated.View
          style={{
            backgroundColor: `${statusColor}15`,
            borderRadius: theme.borderRadius.lg,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Text
            variant="bodySmall"
            color={statusColor}
            fontWeight="600"
            textAlign="center"
          >
            {motivationalMessage}
          </Text>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="caption" color={theme.colors.text.tertiary}>
            {myRival.daysRemaining} days left this week
          </Text>
          <Text variant="caption" color={theme.colors.primary[500]} fontWeight="600">
            View Details →
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Compact version for tighter spaces
 */
export function RivalLeaderboardWidgetCompact({
  myRival,
  onPress,
  isLoading = false,
}: Omit<RivalLeaderboardWidgetProps, 'avgSessionMinutes'>): JSX.Element {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <Animated.View style={{ marginHorizontal: 16, marginBottom: 12 }}>
        <Skeleton height={80} variant="rounded" />
      </Animated.View>
    );
  }

  if (!myRival) {
    return (
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.xl,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            borderStyle: 'dashed',
          }}
        >
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text fontSize={18}>⚔️</Text>
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              Find a rival to compete with
            </Text>
            <Text fontSize={14}>→</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }

  const myScore = myRival.weeklyScore.mine;
  const theirScore = myRival.weeklyScore.theirs;
  const isAhead = myScore > theirScore;
  const gap = Math.abs(myScore - theirScore);

  return (
    <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: 12,
          borderWidth: 1,
          borderColor: isAhead ? theme.colors.success[500] : theme.colors.error[500],
        }}
      >
        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text fontSize={18}>⚔️</Text>
            <Animated.View>
              <Text variant="bodySmall" color={theme.colors.text.primary} fontWeight="600">
                vs {myRival.profile.name}
              </Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                {isAhead
                  ? `Ahead by ${formatFocusMinutes(gap)} 🔥`
                  : `Behind by ${formatFocusMinutes(gap)} ⚡`}
              </Text>
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: isAhead
                ? `${theme.colors.success[500]}15`
                : `${theme.colors.error[500]}15`,
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Text
              variant="caption"
              color={isAhead ? theme.colors.success[500] : theme.colors.error[500]}
              fontWeight="600"
            >
              {myScore}m
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export default RivalLeaderboardWidget;
