import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { buttonTap } from '../../utils/haptics';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import {
  BossDamageSkeleton,
  BossIcon,
  DamageEstimate,
} from './BossDamagePreview.styles';
import { BossHealthBar, DefeatCelebration } from './BossDamagePreview-helpers';

export interface BossDamagePreviewProps {
  bossName: string;
  currentHealthPercent: number;
  estimatedDamage: number;
  willDefeat: boolean;
  onPress?: () => void;
  isLoading?: boolean;
}

export function BossDamagePreview({
  bossName,
  currentHealthPercent,
  estimatedDamage,
  willDefeat,
  onPress,
  isLoading = false,
}: BossDamagePreviewProps): React.ReactNode {
  const { theme } = useTheme();
  if (isLoading) {
    return <BossDamageSkeleton />;
  }
  const isNearDeath = currentHealthPercent <= 20 && !willDefeat;
  return (
    <Pressable
      onPress={() => {
        buttonTap();
        onPress?.();
      }}
      accessibilityLabel={`Boss ${bossName}, ${Math.round(currentHealthPercent)} percent health`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view boss details"
    >
      <Animated.View entering={FadeIn.duration(400)}>
        <Box
          p="md"
          borderRadius="xl"
          bg={`${theme.colors.background.elevated}90`}
          borderWidth={isNearDeath || willDefeat ? 2 : 1}
          borderColor={
            willDefeat
              ? theme.colors.success.DEFAULT
              : isNearDeath
                ? theme.colors.warning.DEFAULT
                : theme.colors.border.DEFAULT
          }
        >
          <Box flexDirection="row" alignItems="center" gap="md">
            {}
            <BossIcon willDefeat={willDefeat} />

            {}
            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Text
                  variant="body"
                  color="text.primary"
                  fontWeight="600"
                  numberOfLines={1}
                >
                  {bossName}
                </Text>
              </Box>

              {}
              <BossHealthBar
                healthPercent={currentHealthPercent}
                willDefeat={willDefeat}
              />

              {}
              <DamageEstimate
                damage={estimatedDamage}
                willDefeat={willDefeat}
              />
            </Box>
          </Box>

          {}
          {willDefeat && <DefeatCelebration />}
        </Box>
      </Animated.View>
    </Pressable>
  );
}

export { BossDamagePreview }