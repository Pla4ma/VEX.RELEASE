import React, { useEffect, useMemo } from 'react';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Box, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { AnimatedCounter } from '../../../shared/ui/components/AnimatedCounter';
import type { SessionSummary } from '../../../session/types';
import { useTheme } from '../../../theme';

type XPEarnAnimationProps = {
  levelProgress: number | null;
  summary: SessionSummary;
  totalXp: number;
};

type XpLineItem = {
  amount: number;
  id: string;
  label: string;
};

function getBonusAmount(summary: SessionSummary, keyword: string): number {
  return (summary.bonuses || [])
    .filter((bonus: any) => bonus.type.toLowerCase().includes(keyword))
    .reduce((total: number, bonus: any) => total + bonus.amount, 0);
}

function buildXpLineItems(summary: SessionSummary, totalXp: number): XpLineItem[] {
  const qualityBonus = (summary.finalScore ?? 0) >= 800
    ? Math.max(0, Math.round(totalXp * 0.08))
    : 0;
  const squadBonus = getBonusAmount(summary, 'squad');
  const knownBonuses = (summary.streakBonus ?? 0) + summary.modeBonus + qualityBonus + squadBonus;
  const baseXp = Math.max(0, totalXp - knownBonuses);
  const items: XpLineItem[] = [{ amount: baseXp, id: 'base', label: 'Base XP' }];

  if ((summary.streakBonus ?? 0) > 0) {
    items.push({ amount: summary.streakBonus ?? 0, id: 'streak', label: 'Streak Bonus' });
  }
  if (summary.modeBonus > 0) {
    items.push({ amount: summary.modeBonus, id: 'mode', label: 'Mode Bonus' });
  }
  if (qualityBonus > 0) {
    items.push({ amount: qualityBonus, id: 'quality', label: 'Quality Bonus' });
  }
  if (squadBonus > 0) {
    items.push({ amount: squadBonus, id: 'squad', label: 'Squad Bonus' });
  }

  return items;
}

export function XPEarnAnimation({
  levelProgress,
  summary,
  totalXp,
}: XPEarnAnimationProps): JSX.Element {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const items = useMemo(() => buildXpLineItems(summary, totalXp), [summary, totalXp]);
  const targetProgress = Math.max(0, Math.min(1, levelProgress ?? 0));

  useEffect(() => {
    progress.value = withTiming(targetProgress, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, targetProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View entering={FadeInUp.duration(420)}>
      <Box
        p={20}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderWidth: 1,
          ...getPremiumCardStyle('large'),
        }}
      >
        <Text variant="label" color={theme.colors.primary[400]}>
          XP BREAKDOWN
        </Text>
        <Text variant="h3" color={theme.colors.text.primary} mt={2}>
          Your run is being counted.
        </Text>

        <Box mt={5} gap={3}>
          {items.map((item, index) => (
            <Animated.View
              entering={FadeInUp.delay(index * 80).duration(260)}
              key={item.id}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text variant="body" color={theme.colors.text.secondary}>
                  {item.label}
                </Text>
                <Text variant="body" color={theme.colors.text.primary} fontWeight="800">
                  +{item.amount}
                </Text>
              </Box>
            </Animated.View>
          ))}
        </Box>

        <Box mt={6}>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Total XP
          </Text>
          <AnimatedCounter
            animateOnMount
            color={theme.colors.warning.light}
            duration={1200}
            previousValue={0}
            prefix="+"
            size="xl"
            value={totalXp}
          />
        </Box>

        <Box
          height={12}
          mt={5}
          overflow="hidden"
          borderRadius={theme.borderRadius.full}
          style={{ backgroundColor: theme.colors.background.primary }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: theme.colors.primary[500],
                borderRadius: theme.borderRadius.full,
                height: '100%',
              },
              fillStyle,
            ]}
          />
        </Box>
        <Text variant="caption" color={theme.colors.text.secondary} mt={3}>
          Level progress locks in before any level-up celebration fires.
        </Text>
      </Box>
    </Animated.View>
  );
}

export default XPEarnAnimation;
