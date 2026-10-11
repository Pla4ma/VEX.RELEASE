import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon } from '../../icons/components/Icon';
import { Text } from '../../components/primitives/Text';
import { CardEnterAnimation } from '../../shared/ui/components/EnterAnimation';
import type { Theme } from '../../theme';
import { vexFire } from '../../theme/tokens/vex-fire';
import { FREE_BOUNDARY_COPY, PREMIUM_FEATURES } from './paywall-copy';
import { paywallStyles as styles } from './paywall-styles';

export function PaywallFeatureList({ theme: _theme }: { theme: Theme }): React.ReactNode {
  return (
    <View style={styles.featuresList}>
      {PREMIUM_FEATURES.map((feature, index) => (
        <Animated.View
          key={feature.title}
          entering={FadeInDown.duration(350).delay(index * 80)}
        >
          <View
            style={[
              styles.featureRow,
              {
                backgroundColor: vexFire.panel,
                borderColor: vexFire.border,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.featureIconShell,
                { backgroundColor: vexFire.backgroundSoft },
              ]}
            >
              <Icon
                name={feature.iconName}
                size={16}
                color={vexFire.success}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text
                style={[
                  styles.featureRowTitle,
                  { color: vexFire.cream },
                ]}
              >
                {feature.title}
              </Text>
              <Text
                style={[
                  styles.featureRowDescription,
                  { color: vexFire.textSecondary },
                ]}
              >
                {feature.description}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

export function FreeBoundaryCard({ theme: _theme }: { theme: Theme }): React.ReactNode {
  return (
    <CardEnterAnimation>
      <View
        style={[
          styles.boundaryCard,
          {
            backgroundColor: vexFire.backgroundSoft,
            borderColor: vexFire.border,
          },
        ]}
      >
        <Icon name="shield" size={20} color={vexFire.textSecondary} />
        <Text
          style={[styles.boundaryText, { color: vexFire.textSecondary }]}
        >
          {FREE_BOUNDARY_COPY}
        </Text>
      </View>
    </CardEnterAnimation>
  );
}
