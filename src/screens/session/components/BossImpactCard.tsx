import { vexFire } from "@/theme/tokens/vex-fire";
import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getCardWidth } from './session-consequence-types';

interface BossImpactCardProps {
  bossName: string;
  healthBefore: number;
  healthAfter: number;
  damageDealt: number;
  wasDefeated: boolean;
  hadCriticalHit: boolean;
}

export function BossImpactCard({
  bossName,
  healthBefore,
  healthAfter,
  damageDealt,
  wasDefeated,
  hadCriticalHit,
}: BossImpactCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = getCardWidth(screenWidth);
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
        width: cardWidth,
        padding: theme.spacing[4],
        backgroundColor: wasDefeated
          ? `${vexFire.success}15`
          : vexFire.panel,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: wasDefeated
          ? vexFire.success
          : vexFire.border,
        marginRight: theme.spacing[3],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[2],
        }}
      >
        <Text fontSize={24}>{wasDefeated ? '\u{1F3C6}' : '\u{1F432}'}</Text>
        <Text variant="body" fontWeight="700" color={vexFire.cream}>
          {wasDefeated ? 'BOSS DEFEATED!' : bossName}
        </Text>
      </View>

      <View
        style={{
          height: 12,
          backgroundColor: vexFire.background,
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
                ? vexFire.success
                : healthAfter <= 15
                  ? vexFire.danger
                  : vexFire.ember,
              borderRadius: theme.borderRadius.full,
            },
            healthBarStyle,
          ]}
        />
      </View>

      <Text variant="caption" color={vexFire.textSecondary}>
        {wasDefeated
          ? `You dealt ${damageDealt} damage and defeated the boss!`
          : `${healthAfter.toFixed(0)}% health remaining \u2022 ${damageDealt} damage dealt`}
      </Text>

      {hadCriticalHit && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            marginTop: theme.spacing[2],
            padding: theme.spacing[2],
            backgroundColor: `${vexFire.amber}20`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text fontSize={16}>{'\u26A1'}</Text>
          <Text variant="caption" color={vexFire.amber} fontWeight="600">
            Critical Hit!
          </Text>
        </View>
      )}
    </View>
  );
}
