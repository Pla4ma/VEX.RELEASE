import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import type { Theme } from '../../theme';
import type { PaywallFeatureHighlight } from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';

export function FeatureHighlightHero({
  featureHighlight,
  theme,
}: {
  featureHighlight: PaywallFeatureHighlight;
  theme: Theme;
}): React.ReactNode {
  return (
    <Animated.View entering={FadeInDown.duration(320)}>
      <LinearGradient
        colors={[...featureHighlight.gradient]}
        style={styles.featureCard}
      >
        <View
          style={[
            styles.featureIconBadge,
            { backgroundColor: theme.colors.background.primary },
          ]}
        >
          <Icon
            name={featureHighlight.iconName}
            size={20}
            color={theme.colors.primary[500]}
          />
        </View>
        <Text style={[styles.featureTitle, { color: theme.colors.text.inverse }]}>
          {featureHighlight.title}
        </Text>
        <Text
          style={[styles.featureBenefit, { color: theme.colors.text.inverse }]}
        >
          {featureHighlight.benefit}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}
