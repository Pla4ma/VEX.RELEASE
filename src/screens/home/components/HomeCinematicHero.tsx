import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import type { HomeController } from '../hooks/home-controller-types';

const HOME_BACKGROUND = require('../../../../assets/vex/home-background.png');
const RITUAL_MARK = require('../../../../assets/vex/home/ritual-mark.png');
const STUDY_RELIC = require('../../../../assets/vex/home/study-relic.png');

interface HomeCinematicHeroProps {
  controller: HomeController;
  onStartSession: () => void;
  onOpenStudy: () => void;
  onOpenProgress: () => void;
}

export function HomeCinematicHero({
  controller,
  onStartSession,
  onOpenStudy,
  onOpenProgress,
}: HomeCinematicHeroProps): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const title =
    controller.returnReason?.title ??
    controller.primaryRecommendation?.title ??
    'One clean block. That is the plan.';
  const body =
    controller.returnReason?.body ??
    controller.primaryRecommendation?.reason ??
    'Protect the next stretch of attention. VEX will hold the line.';
  const entering = isReducedMotion ? undefined : FadeInUp.duration(520);

  return (
    <Animated.View entering={entering} style={{ marginBottom: theme.spacing[5] }}>
      <View
        style={{
          borderColor: vexFire.borderStrong,
          borderRadius: theme.borderRadius['3xl'],
          borderWidth: 1,
          minHeight: theme.spacing[24] * 4,
          overflow: 'hidden',
          shadowColor: vexFire.shadow,
          shadowOffset: { width: 0, height: theme.spacing[5] },
          shadowOpacity: 0.48,
          shadowRadius: theme.spacing[8],
        }}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={HOME_BACKGROUND}
          resizeMode="cover"
          style={{ height: '100%', opacity: 0.58, position: 'absolute', width: '100%' }}
        />
        <LinearGradient
          colors={[vexFire.background, vexFire.overlaySoft, vexFire.background]}
          locations={[0, 0.5, 1]}
          pointerEvents="none"
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
        />
        <View style={{ padding: theme.spacing[6] }}>
          <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: theme.spacing[4] }}>
              <Text color={vexFire.ember} variant="label" style={{ letterSpacing: 2.4 }}>
                CURRENT RITUAL
              </Text>
              <Text color={vexFire.cream} variant="display" numberOfLines={3} style={{ fontFamily: theme.fonts.display, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight, marginTop: theme.spacing[3] }}>
                {title}
              </Text>
            </View>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="VEX ritual mark"
              source={RITUAL_MARK}
              resizeMode="contain"
              style={{ height: theme.spacing[20], opacity: 0.92, width: theme.spacing[20] }}
            />
          </View>

          <Text color={vexFire.textSecondary} variant="bodyLarge" numberOfLines={3} style={{ marginTop: theme.spacing[4], maxWidth: theme.spacing[24] * 3 }}>
            {body}
          </Text>

          <View style={{ borderColor: vexFire.line, borderTopWidth: 1, flexDirection: 'row', gap: theme.spacing[4], marginTop: theme.spacing[6], paddingTop: theme.spacing[4] }}>
            <HeroStat label="STREAK" value={`${controller.currentStreak}D`} />
            <HeroStat label="TODAY" value={`${controller.todayFocusMinutes}M`} />
            <HeroStat label="XP" value={`${controller.currentXp}`} />
          </View>

          <Pressable
            accessibilityHint="Opens focus setup for a new ritual"
            accessibilityLabel="Start focus session"
            accessibilityRole="button"
            onPress={onStartSession}
            style={({ pressed }) => ({ alignItems: 'center', backgroundColor: pressed ? vexFire.copper : vexFire.ember, borderRadius: theme.borderRadius.lg, flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing[6], minHeight: theme.spacing[16], opacity: pressed ? 0.86 : 1, paddingHorizontal: theme.spacing[4] })}
          >
            <Image accessibilityIgnoresInvertColors source={RITUAL_MARK} resizeMode="contain" style={{ height: theme.spacing[8], marginRight: theme.spacing[2], width: theme.spacing[8] }} />
            <Text color={vexFire.background} variant="button" style={{ fontWeight: theme.fontWeights.heavy, letterSpacing: 0.8 }}>START FOCUS</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[3] }}>
            <SecondaryAction icon={STUDY_RELIC} label="Open Study" onPress={onOpenStudy} />
            <Pressable
              accessibilityHint="Opens your progress signal"
              accessibilityLabel="Open progress"
              accessibilityRole="button"
              onPress={onOpenProgress}
              style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: theme.spacing[12], opacity: pressed ? 0.7 : 1 })}
            >
              <Text color={vexFire.amber} variant="caption">VIEW SIGNAL ↗</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function HeroStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text color={vexFire.textMuted} variant="label" style={{ letterSpacing: 1.2 }}>{label}</Text>
      <Text color={vexFire.cream} variant="h4" style={{ fontFamily: theme.fonts.display, marginTop: theme.spacing[1] }}>{value}</Text>
    </View>
  );
}

function SecondaryAction({ icon, label, onPress }: { icon: number; label: string; onPress: () => void }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable accessibilityHint={`Opens ${label.toLowerCase()}`} accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, flex: 1, flexDirection: 'row', justifyContent: 'center', minHeight: theme.spacing[12], opacity: pressed ? 0.7 : 1, paddingHorizontal: theme.spacing[2] })}>
      <Image accessibilityIgnoresInvertColors source={icon} resizeMode="contain" style={{ height: theme.spacing[6], marginRight: theme.spacing[1], width: theme.spacing[6] }} />
      <Text color={vexFire.cream} variant="caption">{label.toUpperCase()}</Text>
    </Pressable>
  );
}
