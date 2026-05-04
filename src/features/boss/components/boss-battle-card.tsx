import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Box, Card, Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';

interface BossBattleCardProps {
  bossName: string;
  bossAvatar: string;
  bossLevel: number;
  maxHealth: number;
  currentHealth: number;
  damageDealt: number;
  isDefeated: boolean;
  timeRemaining: number;
  showFocusInstruction: boolean;
}

function formatTimeRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function BossBattleCard({
  bossName,
  bossAvatar,
  bossLevel,
  maxHealth,
  currentHealth,
  damageDealt,
  isDefeated,
  timeRemaining,
  showFocusInstruction,
}: BossBattleCardProps): JSX.Element {
  const { theme } = useTheme();
  const healthAnimation = useSharedValue(0);

  const healthPercent = useMemo(() => {
    if (maxHealth <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  }, [currentHealth, maxHealth]);

  useEffect(() => {
    healthAnimation.value = withTiming(healthPercent, { duration: 350 });
  }, [healthAnimation, healthPercent]);

  const healthStyle = useAnimatedStyle(() => ({
    width: `${healthAnimation.value}%`,
  }));

  const healthColor = healthPercent > 50
    ? theme.colors.success.DEFAULT
    : healthPercent > 20
      ? theme.colors.warning.DEFAULT
      : theme.colors.error.DEFAULT;

  const instructionText = isDefeated
    ? `You dealt ${damageDealt.toLocaleString()} damage and defeated ${bossName}.`
    : showFocusInstruction
      ? 'Focus to deal damage. Complete a session to land your next hit.'
      : 'Keep your session going. Damage is applied automatically when a focus session completes.';

  return (
    <Card>
      <Box p="lg" gap="md">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flexDirection="row" alignItems="center" gap="sm" style={{ flex: 1 }}>
            <Text style={{ fontSize: 40 }}>{bossAvatar}</Text>
            <Box style={{ flex: 1 }}>
              <Text variant="h3">{bossName}</Text>
              <Text variant="caption" color="text.secondary">
                Level {bossLevel}
              </Text>
            </Box>
          </Box>

          <Box
            px="sm"
            py="xs"
            style={{
              borderRadius: theme.borderRadius.full,
              backgroundColor: `${theme.colors.primary[500]}20`,
            }}
          >
            <Text
              variant="caption"
              style={{ color: theme.colors.primary[500], fontWeight: theme.fontWeights.bold }}
            >
              {isDefeated ? 'Defeated' : 'Active'}
            </Text>
          </Box>
        </Box>

        <Box>
          <View
            style={{
              height: 18,
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden',
              backgroundColor: theme.colors.background.tertiary,
            }}
          >
            <Animated.View
              style={[
                {
                  height: '100%',
                  backgroundColor: healthColor,
                },
                healthStyle,
              ]}
            />
          </View>

          <Box mt="sm" flexDirection="row" justifyContent="space-between">
            <Text variant="caption" color="text.secondary">
              {currentHealth.toLocaleString()} / {maxHealth.toLocaleString()} HP
            </Text>
            <Text variant="caption" style={{ color: healthColor, fontWeight: theme.fontWeights.bold }}>
              {Math.round(healthPercent)}%
            </Text>
          </Box>
        </Box>

        <Box flexDirection="row" justifyContent="space-between">
          <Box>
            <Text variant="caption" color="text.secondary">Damage dealt</Text>
            <Text variant="h3">{damageDealt.toLocaleString()}</Text>
          </Box>
          <Box style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" color="text.secondary">Time remaining</Text>
            <Text
              variant="h3"
              style={{
                color: timeRemaining <= 300 ? theme.colors.error.DEFAULT : theme.colors.text.primary,
              }}
            >
              {formatTimeRemaining(Math.max(0, timeRemaining))}
            </Text>
          </Box>
        </Box>

        <Box
          p="md"
          style={{
            borderRadius: theme.borderRadius.lg,
            backgroundColor: showFocusInstruction
              ? `${theme.colors.primary[500]}14`
              : `${theme.colors.background.tertiary}CC`,
            borderWidth: 1,
            borderColor: showFocusInstruction
              ? `${theme.colors.primary[500]}33`
              : theme.colors.border.DEFAULT,
          }}
        >
          <Text variant="body">{instructionText}</Text>
        </Box>
      </Box>
    </Card>
  );
}
