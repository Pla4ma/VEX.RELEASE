import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { CardEnterAnimation } from '../../shared/ui/components/EnterAnimation';
import type { Theme } from '../../theme';
import {
  VALUE_PROPOSITION,
  type PaywallFeatureHighlight,
} from './paywall-copy';
import { LANE_PREMIUM_HERO_COPY, type PremiumLane } from './lane-hero-copy';
import { PaywallFeatureList, FreeBoundaryCard } from './PaywallFeatureList';
import { paywallStyles as styles } from './paywall-styles';

type PaywallHeroProps = {
  contextBody?: string;
  contextHeadline?: string;
  featureHighlight: PaywallFeatureHighlight | undefined;
  isPremium: boolean;
  lane?: string;
  showBoundary: boolean;
  theme: Theme;
  onClose: () => void;
};

function resolveLane(lane?: string): PremiumLane | null {
  if (!lane) {return null;}
  const lower = lane.toLowerCase();
  if (lower.includes('study') || lower.includes('student')) {return 'study';}
  if (lower.includes('game') || lower.includes('run')) {return 'run';}
  if (lower.includes('deep') || lower.includes('creative') || lower.includes('project')) {return 'project';}
  if (lower.includes('minimal') || lower.includes('clean') || lower.includes('normal')) {return 'clean';}
  return null;
}

export function PaywallHero({
  contextBody,
  contextHeadline,
  featureHighlight,
  isPremium,
  lane,
  showBoundary,
  theme,
  onClose,
}: PaywallHeroProps): JSX.Element {
  const premiumLane = resolveLane(lane);
  const laneCopy = premiumLane ? LANE_PREMIUM_HERO_COPY[premiumLane] : null;

  const heroHeadline = contextHeadline ?? laneCopy?.headline ?? 'VEX remembers more. Adapts deeper.';
  const heroBody = contextBody ?? laneCopy?.body ?? 'Free sessions, basic progress, and Rescue stay free forever. Premium adds memory, weekly intelligence, and mode-matched depth.';

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary[500] }]}>
            VEX Premium
          </Text>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {isPremium ? 'Premium is active' : VALUE_PROPOSITION}
          </Text>
        </View>
        <Button
          variant="ghost"
          onPress={onClose}
          accessibilityLabel="Close paywall"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen."
        >
          Close
        </Button>
      </View>

      {contextHeadline && contextBody ? (
        <CardEnterAnimation>
          <LinearGradient
            colors={[theme.colors.primary[500], theme.colors.warning.DEFAULT]}
            style={styles.heroCard}
          >
            <Text style={[styles.heroTitle, { color: theme.colors.text.inverse }]}>
              {contextHeadline}
            </Text>
            <Text style={[styles.heroCopy, { color: theme.colors.text.inverse }]}>
              {contextBody}
            </Text>
          </LinearGradient>
        </CardEnterAnimation>
      ) : featureHighlight ? (
        <Animated.View entering={FadeInDown.duration(320)}>
          <LinearGradient colors={[...featureHighlight.gradient]} style={styles.featureCard}>
            <View style={[styles.featureIconBadge, { backgroundColor: theme.colors.background.primary }]}>
              <Icon name={featureHighlight.iconName} size={20} color={theme.colors.primary[500]} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.colors.text.inverse }]}>
              {featureHighlight.title}
            </Text>
            <Text style={[styles.featureBenefit, { color: theme.colors.text.inverse }]}>
              {featureHighlight.benefit}
            </Text>
          </LinearGradient>
        </Animated.View>
      ) : (
        <CardEnterAnimation>
          <LinearGradient
            colors={[theme.colors.primary[500], theme.colors.warning.DEFAULT]}
            style={styles.heroCard}
          >
            <Text style={[styles.heroTitle, { color: theme.colors.text.inverse }]}>
              {heroHeadline}
            </Text>
            {laneCopy?.benefits ? (
              <View style={{ gap: 6 }}>
                {laneCopy.benefits.map((b, i) => (
                  <Text key={i} style={[styles.heroCopy, { color: theme.colors.text.inverse }]}>
                    {b}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.heroCopy, { color: theme.colors.text.inverse }]}>
                {heroBody}
              </Text>
            )}
          </LinearGradient>
        </CardEnterAnimation>
      )}

      {!featureHighlight ? <PaywallFeatureList theme={theme} /> : null}
      {showBoundary ? <FreeBoundaryCard theme={theme} /> : null}
    </>
  );
}
