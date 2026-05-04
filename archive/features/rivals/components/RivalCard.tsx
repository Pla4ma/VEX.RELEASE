import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { CurrentRival } from '../schemas';
import { formatFocusMinutes, getRivalStatusMessage } from '../service';

interface RivalCardProps {
  rival: CurrentRival;
  onPress?: () => void;
}

export function RivalCard({ rival, onPress }: RivalCardProps): JSX.Element {
  const { theme } = useTheme();
  const myScore = rival.weeklyScore.mine;
  const theirScore = rival.weeklyScore.theirs;
  const total = Math.max(myScore + theirScore, 1);
  const myPercent = Math.max((myScore / total) * 100, 5);
  const theirPercent = Math.max((theirScore / total) * 100, 5);
  const isAhead = myScore > theirScore;
  const isTied = myScore === theirScore;
  const status = getRivalStatusMessage(myScore, theirScore, rival.profile.name);
  const statusColor =
    status.tone === 'positive'
      ? theme.colors.success[500]
      : status.tone === 'urgent'
      ? theme.colors.error[500]
      : theme.colors.warning[500];

  return (
    <Pressable
      accessibilityLabel={`Weekly rivalry against ${rival.profile.name}`}
      accessibilityRole="button"
      accessibilityHint="Opens rivalry details"
      onPress={onPress}
    >
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          marginBottom: theme.spacing[3],
          borderWidth: 2,
          borderColor: isTied
            ? theme.colors.warning[500]
            : isAhead
            ? theme.colors.success[500]
            : theme.colors.error[500],
        }}
      >
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[3] }}>
          <Text variant="label" color={theme.colors.text.tertiary}>
            {rival.isGhost && __DEV__ ? 'Weekly rivalry - Ghost' : 'Weekly rivalry'}
          </Text>
          <Text variant="caption" color={theme.colors.text.tertiary}>
            {rival.daysRemaining} days left
          </Text>
        </Animated.View>

        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
          <ScoreBlock label="You" score={myScore} accent={theme.colors.primary[500]} />
          <Text variant="caption" color={theme.colors.text.tertiary} fontWeight="700">
            VS
          </Text>
          <ScoreBlock label={rival.profile.name} score={theirScore} accent={theme.colors.accent.purple} />
        </Animated.View>

        <Animated.View
          style={{
            height: theme.spacing[2],
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.full,
            overflow: 'hidden',
            flexDirection: 'row',
            marginTop: theme.spacing[3],
            marginBottom: theme.spacing[3],
          }}
        >
          <Animated.View style={{ height: '100%', width: `${myPercent}%`, backgroundColor: theme.colors.primary[500] }} />
          <Animated.View style={{ height: '100%', width: `${theirPercent}%`, backgroundColor: theme.colors.accent.purple }} />
        </Animated.View>

        <Animated.View
          style={{
            padding: theme.spacing[2],
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${statusColor}15`,
            alignItems: 'center',
          }}
        >
          <Text variant="bodySmall" color={statusColor} fontWeight="600" textAlign="center">
            {status.message}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function ScoreBlock({
  label,
  score,
  accent,
}: {
  label: string;
  score: number;
  accent: string;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View style={{ alignItems: 'center', flex: 1 }}>
      <Animated.View
        style={{
          width: 48,
          height: 48,
          borderRadius: theme.borderRadius.full,
          backgroundColor: accent,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text color={theme.colors.text.inverse} fontWeight="700">
          {label.charAt(0).toUpperCase()}
        </Text>
      </Animated.View>
      <Text variant="h4" color={theme.colors.text.primary} fontWeight="700" style={{ marginTop: theme.spacing[1] }}>
        {formatFocusMinutes(score)}
      </Text>
      <Text variant="caption" color={theme.colors.text.tertiary} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}
