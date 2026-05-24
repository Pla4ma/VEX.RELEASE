import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { CARD_WIDTH } from './session-consequence-types';

interface BossImpactCardProps {
  bossName: string;
  healthBefore: number;
  healthAfter: number;
  damageDealt: number;
  wasDefeated: boolean;
  hadCriticalHit: boolean;
  bountyConsumedCount?: number;
  bountyLootMultiplier?: number;
}

export function BossImpactCard({
  bossName,
  healthBefore,
  healthAfter,
  damageDealt,
  wasDefeated,
  hadCriticalHit,
  bountyConsumedCount,
  bountyLootMultiplier,
}: BossImpactCardProps): JSX.Element {
  const { theme } = useTheme();
  const healthAnim = useSharedValue(healthBefore);

  useEffect(() => {
    healthAnim.value = withSpring(healthAfter, { damping: 15, stiffness: 100 });
  }, [healthAfter, healthAnim]);

  const healthBarStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, healthAnim.value)}%`,
  }));

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: wasDefeated
          ? `${theme.colors.success[500]}15`
          : theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: wasDefeated ? theme.colors.success[500] : theme.colors.border.DEFAULT,
        marginRight: theme.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
        <Text fontSize={24}>{wasDefeated ? '🏆' : '🐲'}</Text>
        <Text variant="body" fontWeight="700" color="text.primary">
          {wasDefeated ? 'BOSS DEFEATED!' : bossName}
        </Text>
      </View>

      <View
        style={{
          height: 12,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginBottom: theme.spacing[2],
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: wasDefeated
                ? theme.colors.success[500]
                : healthAfter <= 15
                  ? theme.colors.error[500]
                  : theme.colors.primary[500],
              borderRadius: theme.borderRadius.full,
            },
            healthBarStyle,
          ]}
        />
      </View>

      <Text variant="caption" color="text.secondary">
        {wasDefeated
          ? `You dealt ${damageDealt} damage and defeated the boss!`
          : `${healthAfter.toFixed(0)}% health remaining • ${damageDealt} damage dealt`}
      </Text>

      {hadCriticalHit && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            marginTop: theme.spacing[2],
            padding: theme.spacing[2],
            backgroundColor: `${theme.colors.warning[500]}20`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text fontSize={16}>⚡</Text>
          <Text variant="caption" color="warning.DEFAULT" fontWeight="600">
            Critical Hit!
          </Text>
        </View>
      )}

      {bountyConsumedCount && bountyConsumedCount > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            marginTop: theme.spacing[2],
            padding: theme.spacing[2],
            backgroundColor: `${theme.colors.warning[500]}15`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text fontSize={16}>🎯</Text>
          <Text variant="caption" color="warning.500" fontWeight="600">
            Bounty × {bountyConsumedCount} — {bountyLootMultiplier ?? 2}× loot applied
          </Text>
        </View>
      )}
    </View>
  );
}
