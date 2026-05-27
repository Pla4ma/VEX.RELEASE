import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../icons/components/Icon";
import { Text } from "../../components/primitives/Text";
import { CardEnterAnimation } from "../../shared/ui/components/EnterAnimation";
import type { Theme } from "../../theme";
import { FREE_BOUNDARY_COPY, PREMIUM_FEATURES } from "./paywall-copy";
import { paywallStyles as styles } from "./paywall-styles";

export function PaywallFeatureList({ theme }: { theme: Theme }): JSX.Element {
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
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.DEFAULT,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.featureIconShell,
                { backgroundColor: theme.colors.background.tertiary },
              ]}
            >
              <Icon
                name={feature.iconName}
                size={16}
                color={theme.colors.success.DEFAULT}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text
                style={[
                  styles.featureRowTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                {feature.title}
              </Text>
              <Text
                style={[
                  styles.featureRowDescription,
                  { color: theme.colors.text.secondary },
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

export function FreeBoundaryCard({ theme }: { theme: Theme }): JSX.Element {
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
        <Text
          style={[styles.boundaryText, { color: theme.colors.text.secondary }]}
        >
          {FREE_BOUNDARY_COPY}
        </Text>
      </View>
    </CardEnterAnimation>
  );
}
