import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Box, Card, Text } from '../../components/primitives';
import { MasteryRankBadge } from '../../features/mastery/components/MasteryRankBadge';
import {
  getMasteryRankDisplay,
  type MasteryRank,
  type MasteryState,
} from '../../features/mastery/types';
import { Icon } from '../../icons';
import { useTheme } from '../../theme';

const RANK_UNLOCKS: Record<MasteryRank, string[]> = {
  APPRENTICE: ['All base session modes', 'Basic boss encounters'],
  ADEPT: ['DEEP_WORK mode unlocked', 'Advanced boss tier 3-4 access'],
  EXPERT: ['Nightmare Mode sessions (2x XP)', 'Boss tier 5-6 access'],
  MASTER: ['Mastery Duel type', 'Custom challenge creation'],
  GRANDMASTER: ['Exclusive Grandmaster badge', 'Priority support access'],
};

export function RankUnlocks({
  currentRank,
}: {
  currentRank: MasteryRank;
}): JSX.Element {
  const { theme } = useTheme();
  const ranks: MasteryRank[] = [
    'APPRENTICE',
    'ADEPT',
    'EXPERT',
    'MASTER',
    'GRANDMASTER',
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
              flexDirection: 'row',
              alignItems: 'center',
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
                fontWeight={isCurrent ? '700' : '500'}
                style={{
                  color: isUnlocked
                    ? rankDisplay.color
                    : theme.colors.text.secondary,
                }}
              >
                {rankDisplay.title}
                {isCurrent && ' (Current)'}
                {!isUnlocked && ' (Locked)'}
              </Text>
              <Text variant="caption" color="text.tertiary">
                {RANK_UNLOCKS[rank].join(' • ')}
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

export function MasteryHeader({
  state,
  pointsToNext,
  nextRankName,
  progressStyle,
}: {
  state: MasteryState;
  pointsToNext: number;
  nextRankName: string;
  progressStyle: ReturnType<typeof useAnimatedStyle>;
}): JSX.Element {
  const { theme } = useTheme();
  const rankDisplay = getMasteryRankDisplay(state.rank);
  return (
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
        {pointsToNext > 0 && (
          <View style={{ width: '100%', gap: theme.spacing[2] }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                overflow: 'hidden',
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
  );
}
