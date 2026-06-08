import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { StreakWidgetSkeleton } from './StreakWidget.parts';
import { DayCheckRow } from './DayCheckRow';

export interface StreakWidgetProps {
  currentDays: number;
  multiplier: number;
  hoursRemaining: number | null;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  longestStreak: number;
  onPress?: () => void;
  isLoading?: boolean;
  userId?: string;
}

function formatHoursRemaining(hours: number | null): string {
  if (hours === null || hours < 0) {return '—';}
  if (hours < 1) {return `${Math.max(0, Math.round(hours * 60))}m until streak risk`;}
  return `${hours.toFixed(hours < 10 ? 1 : 0)}h until streak risk`;
}

export function StreakWidget({
  currentDays,
  multiplier,
  hoursRemaining,
  riskLevel,
  longestStreak,
  onPress,
  isLoading = false,
}: StreakWidgetProps): JSX.Element {
  if (isLoading) {
    return <StreakWidgetSkeleton />;
  }

  const isEmpty = currentDays === 0;
  const isUrgent = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return (
    <Pressable
      accessibilityHint="Shows your streak and timing"
      accessibilityLabel="Open streak details"
      accessibilityRole="button"
      onPress={onPress}
    >
      <Animated.View entering={FadeIn.duration(400)}>
        <GlassCard
          padding={16}
          radius={22}
          variant={isUrgent ? 'warning' : 'default'}
        >
          <Box
            alignItems="center"
            flexDirection="row"
            gap="sm"
            justifyContent="space-between"
          >
            <Box alignItems="center" flexDirection="row" gap={12}>
              <GlassIconOrb size={42} variant="fire">
                <Icon color="#C2410C" name="fire" size="sm" variant="solid" />
              </GlassIconOrb>
              {isEmpty ? (
                <Text
                  style={{
                    color: vexLightGlass.text.primary,
                    fontSize: 16,
                    fontWeight: '800',
                  }}
                >
                  No streak yet
                </Text>
              ) : (
                <Text
                  style={{
                    color: vexLightGlass.text.primary,
                    fontSize: 17,
                    fontWeight: '800',
                    letterSpacing: -0.2,
                  }}
                >
                  {`${currentDays} Day Streak`}
                </Text>
              )}
            </Box>
            <GlassPill
              label={`x${multiplier.toFixed(1)}`}
              size="sm"
              variant="fire"
            />
          </Box>
          {!isEmpty ? <DayCheckRow currentDays={currentDays} /> : null}
          <Box
            alignItems="center"
            flexDirection="row"
            justifyContent="space-between"
            mt={12}
          >
            <Text
              style={{
                color: isUrgent ? '#A04A12' : vexLightGlass.text.secondary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {isEmpty
                ? 'Start your streak today.'
                : formatHoursRemaining(hoursRemaining)}
            </Text>
            {longestStreak > currentDays && !isEmpty ? (
              <Text
                style={{
                  color: vexLightGlass.text.tertiary,
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                {`Best: ${longestStreak}d`}
              </Text>
            ) : null}
          </Box>
          <View style={{ alignItems: 'flex-end', marginTop: 4 }}>
            <Icon
              color={vexLightGlass.text.tertiary}
              name="chevronRight"
              size="sm"
              variant="outline"
            />
          </View>
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
}

export default StreakWidget;
