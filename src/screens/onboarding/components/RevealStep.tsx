import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ProgressBar } from "../../../components/ProgressBar";
import { getPremiumCardStyle } from "../../../components/premiumStyles";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { ONBOARDING_GOALS } from "../../../features/onboarding";
import { styles } from "../styles";

const FIRST_LEVEL_XP = 100;

type StarterPreset = {
  id: string;
  title: string;
  durationLabel: string;
  subtitle: string;
  launchDescription: string;
};

type RevealStepProps = {
  goal?: (typeof ONBOARDING_GOALS)[number];
  persona?: { id: string; name: string; description: string };
  preset?: StarterPreset;
  progress: number;
};

export function RevealStep({
  goal,
  persona,
  preset,
  progress,
}: RevealStepProps): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = 0.8;
    scale.value = withSpring(1, {
      damping: 14,
      stiffness: 120,
    });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.section}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Everything is lined up for your first win.
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}
      >
        This is the version of VEX you just built for yourself.
      </Text>

      <Animated.View
        style={[
          animatedStyle,
          styles.identityCard,
          getPremiumCardStyle("large"),
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.primary[100],
            padding: theme.spacing[5],
          },
        ]}
      >
        <Text
          style={[styles.identityEyebrow, { color: theme.colors.primary[500] }]}
        >
          YOUR VEX IS READY
        </Text>

        <View style={styles.identityBlock}>
          <Text
            style={[
              styles.identityLabel,
              { color: theme.colors.text.secondary },
            ]}
          >
            Goal
          </Text>
          <Text
            style={[styles.identityValue, { color: theme.colors.text.primary }]}
          >
            {goal?.label ?? "Choose a goal"}
          </Text>
          <Text
            style={[
              styles.identityBody,
              { color: theme.colors.text.secondary },
            ]}
          >
            {goal?.description ?? "Pick the outcome you want first."}
          </Text>
        </View>

        <View style={styles.identityBlock}>
          <Text
            style={[
              styles.identityLabel,
              { color: theme.colors.text.secondary },
            ]}
          >
            Coach
          </Text>
          <Text
            style={[styles.identityValue, { color: theme.colors.text.primary }]}
          >
            {persona?.name ?? "Pick your coach"}
          </Text>
          <Text
            style={[
              styles.identityBody,
              { color: theme.colors.text.secondary },
            ]}
          >
            {persona?.description ??
              "Your coach voice will shape the tone of VEX."}
          </Text>
        </View>

        <View style={styles.identityBlock}>
          <Text
            style={[
              styles.identityLabel,
              { color: theme.colors.text.secondary },
            ]}
          >
            Starter Session
          </Text>
          <Text
            style={[styles.identityValue, { color: theme.colors.text.primary }]}
          >
            {preset
              ? `${preset.title} · ${preset.durationLabel}`
              : "Choose your first session"}
          </Text>
          <Text
            style={[
              styles.identityBody,
              { color: theme.colors.text.secondary },
            ]}
          >
            {preset?.subtitle ??
              "Your first session sets the tone for day one."}
          </Text>
        </View>

        <View
          style={[
            styles.statPanel,
            {
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.DEFAULT,
              padding: theme.spacing[4],
            },
          ]}
        >
          <Text style={[styles.heroStat, { color: theme.colors.text.primary }]}>
            0 streak days · Level 1 · 0 XP
          </Text>
          <Text
            style={[
              styles.heroStatCaption,
              { color: theme.colors.text.secondary },
            ]}
          >
            First level-up at {FIRST_LEVEL_XP} XP
          </Text>
          <ProgressBar
            progress={progress}
            backgroundColor={theme.colors.background.secondary}
            fillColor={theme.colors.primary[500]}
            height={10}
            borderRadius={theme.borderRadius.full}
            style={styles.progressBar}
          />
          <Text
            style={[
              styles.progressCaption,
              { color: theme.colors.text.secondary },
            ]}
          >
            0 / {FIRST_LEVEL_XP} XP
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
