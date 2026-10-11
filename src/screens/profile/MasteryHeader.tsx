import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box'
import { Card } from '../../components/primitives'
import { Text } from '../../components/primitives/Text';
import { MasteryRankBadge } from '../../features/mastery/components/MasteryRankBadge';
import {
  getMasteryRankDisplay,
  type MasteryRank,
  type MasteryState,
} from '../../features/mastery/types';
import { Icon } from '../../icons/components/Icon';
import { useTheme } from '../../theme/ThemeContext';

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
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing[3] }}>
      <Text variant="h4" color={vexFire.cream}>
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
                : vexFire.panel,
              borderWidth: isCurrent ? 1 : 0,
              borderColor: isCurrent ? rankDisplay.color : undefined,
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            <Text fontSize={24}>{rankDisplay.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text
                variant="body"
                color={vexFire.cream}
                fontWeight={isCurrent ? '700' : '500'}
                style={{
                  color: isUnlocked
                    ? rankDisplay.color
                    : vexFire.textSecondary,
                }}
              >
                {rankDisplay.title}
                {isCurrent && ' (Current)'}
                {!isUnlocked && ' (Locked)'}
              </Text>
              <Text variant="caption" color={vexFire.textMuted}>
                {RANK_UNLOCKS[rank].join(' • ')}
              </Text>
            </View>
            {isUnlocked && (
              <Icon
                name="checkmark-circle"
                size={20}
                color={vexFire.success}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const ranks: MasteryRank[] = [
    'APPRENTICE',
    'ADEPT',
    'EXPERT',
    'MASTER',
    'GRANDMASTER',
  ];

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
}): React.ReactNode {
  const { theme } = useTheme();
  const rankDisplay = getMasteryRankDisplay(state.rank);
  return (
    <Card
      size="lg"
      style={{ backgroundColor: vexFire.panel }}
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
              <Text variant="caption" color={vexFire.textSecondary}>
                Progress to {nextRankName}
              </Text>
              <Text variant="caption" color={vexFire.textMuted}>
                {pointsToNext} MP needed
              </Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: vexFire.backgroundSoft,
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
          <Text variant="body" color={vexFire.success} fontWeight="600">
            Maximum Rank Achieved!
          </Text>
        )}
      </Box>
    </Card>
  );
}
