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
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  VALUE_PROPOSITION,
  type PaywallFeatureHighlight,
} from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';

type PaywallHeroProps = {
  contextBody?: string;
  contextHeadline?: string;
  featureHighlight: PaywallFeatureHighlight | undefined;
  isPremium: boolean;
  showBoundary: boolean;
  theme: Theme;
  onClose: () => void;
};

export function PaywallHero({
  contextBody,
  contextHeadline,
  featureHighlight,
  isPremium,
  showBoundary,
  theme,
  onClose,
}: PaywallHeroProps): JSX.Element {
  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary[500] }]}>VEX Premium</Text>
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
            <View
              style={[
                styles.featureIconBadge,
                { backgroundColor: theme.colors.background.primary },
              ]}
            >
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
              Premium is for deeper commitment
            </Text>
            <Text style={[styles.heroCopy, { color: theme.colors.text.inverse }]}>
              {PREMIUM_BOUNDARY_COPY}
            </Text>
          </LinearGradient>
        </CardEnterAnimation>
      )}

      {!featureHighlight ? <PaywallFeatureList theme={theme} /> : null}
      {showBoundary ? <FreeBoundaryCard theme={theme} /> : null}
    </>
  );
}

function PaywallFeatureList({ theme }: { theme: Theme }): JSX.Element {
  return (
    <View style={styles.featuresList}>
      {PREMIUM_FEATURES.map((feature, index) => (
        <Animated.View key={feature.title} entering={FadeInDown.duration(350).delay(index * 80)}>
          <View
            style={[
              styles.featureRow,
              {
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.DEFAULT,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[styles.featureIconShell, { backgroundColor: theme.colors.background.tertiary }]}
            >
              <Icon name={feature.iconName} size={16} color={theme.colors.success.DEFAULT} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureRowTitle, { color: theme.colors.text.primary }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureRowDescription, { color: theme.colors.text.secondary }]}>
                {feature.description}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function FreeBoundaryCard({ theme }: { theme: Theme }): JSX.Element {
  return (
    <CardEnterAnimation>
      <View
        style={[
          styles.boundaryCard,
          {
            backgroundColor: theme.colors.background.tertiary,
            borderColor: theme.colors.border.DEFAULT,
          },
        ]}
      >
        <Icon name="shield" size={20} color={theme.colors.text.secondary} />
        <Text style={[styles.boundaryText, { color: theme.colors.text.secondary }]}>
          {FREE_BOUNDARY_COPY}
        </Text>
      </View>
    </CardEnterAnimation>
  );
}
