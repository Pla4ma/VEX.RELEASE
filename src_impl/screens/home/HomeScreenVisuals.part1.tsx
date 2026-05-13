import React, { useEffect, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { FocusRing } from "../../components/FocusRing";
import { StreakBadge } from "../../components/StreakBadge";
import { Button } from "../../components/primitives/Button";
import { Text } from "../../components/primitives/Text";
import { Skeleton } from "../../components/ui/Skeleton";
import { SimpleWalletBadge } from "../../features/economy/components/SimpleWalletBadge";
import { getPremiumCardStyle } from "../../components/premiumStyles";
import { useTheme } from "../../theme";
import { createSheet } from "@/shared/ui/create-sheet";


export function getHeroGradientColors(streak: number): readonly [string, string] {
  if (streak >= 30) {return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];}
  if (streak >= 7) {return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];}
  if (streak >= 1) {return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];}
  return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];
}

export function HomeHero({
  currentStreak,
  isAtRisk,
  isFirstRun,
  isLoading,
  insetsTop,
  todayFocusMinutes,
  progressPercent,
  userId,
  userFirstName,
}: {
  currentStreak: number;
  insetsTop: number;
  isAtRisk: boolean;
  isFirstRun: boolean;
  isLoading: boolean;
  progressPercent: number;
  todayFocusMinutes: number;
  userId?: string;
  userFirstName?: string;
}): JSX.Element {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const gradientColors = useMemo(() => getHeroGradientColors(currentStreak), [currentStreak]);
  return (
    <LinearGradient
      colors={[...gradientColors]}
      style={[
        styles.hero,
        {
          flexDirection: isCompact ? 'column' : 'row',
          paddingBottom: theme.spacing[6],
          paddingHorizontal: theme.spacing[5],
          paddingTop: insetsTop + theme.spacing[5],
        },
      ]}
    >
      {userId ? (
        <View style={{ position: 'absolute', top: insetsTop + 16, right: theme.spacing[5] }}>
          <SimpleWalletBadge userId={userId} streak={currentStreak} onPress={() => undefined} />
        </View>
      ) : null}
      <View style={[styles.heroColumn, { gap: theme.spacing[3] }]}>
        <Text variant="label" color={WHITE_MUTED} style={styles.eyebrow}>VEX</Text>
        <Text variant="h2" color={WHITE}>{userFirstName ? `Welcome back, ${userFirstName}` : 'Ready to lock in?'}</Text>
        {isLoading ? (
          <View style={{ gap: theme.spacing[2] }}>
            <Skeleton width={80} height={14} />
            <Skeleton width={120} height={48} borderRadius={12} />
            <Skeleton width={104} height={28} borderRadius={14} />
          </View>
        ) : isFirstRun ? (
          <Text variant="body" color={WHITE_MUTED}>Start one clean session. VEX will turn it into today&apos;s focus, streak, and reward snapshot.</Text>
        ) : (
          <>
            <Text variant="label" color={WHITE_MUTED}>Today</Text>
            <Text color={WHITE} style={styles.focusValue}>{formatMinutes(todayFocusMinutes)}</Text>
            <StreakBadge days={currentStreak} isAtRisk={isAtRisk} variant="glass" />
          </>
        )}
      </View>
      <View style={[styles.heroRight, { alignItems: isCompact ? 'stretch' : 'center', gap: theme.spacing[2] }]}>
        {isLoading ? (
          <View style={{ alignItems: 'center', gap: theme.spacing[2] }}>
            <Skeleton width={132} height={132} variant="circular" />
            <Skeleton width={88} height={14} />
          </View>
        ) : isFirstRun ? (
          <View style={[styles.onboardPanel, getPremiumCardStyle('medium'), { backgroundColor: WHITE_SOFT, borderColor: 'rgba(255,255,255,0.22)' }]}>
            <Text variant="h4" color={WHITE}>Welcome to VEX</Text>
            <Text variant="bodySmall" color={WHITE_MUTED}>Build your first streak, earn your first XP, and watch this space turn into your daily focus snapshot.</Text>
          </View>
        ) : (
          <>
            <FocusRing progressPercent={progressPercent} focusMinutes={todayFocusMinutes} />
            <Text variant="label" color={WHITE_MUTED}>Daily Goal</Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

export function GradientStartButton({
  body,
  buttonLabel,
  eyebrow,
  onPress,
  pulse,
  title,
}: {
  body: string;
  buttonLabel: string;
  eyebrow: string;
  onPress: () => void;
  pulse: boolean;
  title: string;
}): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(withSequence(withTiming(1.02, { duration: 1500 }), withTiming(1, { duration: 1500 })), -1, false);
    } else {
      cancelAnimation(scale);
      scale.value = 1;
    }
    return () => cancelAnimation(scale);
  }, [pulse, scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={[...CTA_GRADIENT]}
        style={[
          styles.ctaGradient,
          {
            borderRadius: theme.borderRadius['2xl'],
            gap: theme.spacing[3],
            padding: theme.spacing[4],
          },
        ]}
      >
        <Text variant="label" color={WHITE_MUTED}>{eyebrow}</Text>
        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="h4" color={WHITE}>{title}</Text>
          <Text variant="bodySmall" color={WHITE_MUTED}>{body}</Text>
        </View>
        <Button
          fullWidth
          size="lg"
          variant="primary"
          style={{ backgroundColor: 'transparent', borderRadius: theme.borderRadius['2xl'], minHeight: 58 }}
          onPress={onPress}
          accessibilityLabel={buttonLabel}
          accessibilityRole="button"
          accessibilityHint="Starts or resumes the recommended focus action"
        >
          {buttonLabel}
        </Button>
      </LinearGradient>
    </Animated.View>
  );
}

export function SectionHeader({ title }: { title: string }): JSX.Element {
  const { theme } = useTheme();
  return <View style={styles.sectionHeader}><View style={[styles.sectionAccent, { backgroundColor: theme.colors.primary[500] }]} /><Text variant="h4" color={theme.colors.text.primary}>{title}</Text></View>;
}