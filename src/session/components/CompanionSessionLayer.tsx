import React from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { LivingCompanion } from "../../features/companion/components/LivingCompanion";
import type { CompanionState } from "../../features/companion/types";
import { Text } from "../../components/primitives/Text";
import { useTheme } from "../../theme";

type CompanionSessionLayerProps = {
  companionState: CompanionState;
  elapsedSeconds: number;
  eventLabel: string | null;
  isPaused: boolean;
  purityScore: number;
  sessionProgress: number;
  totalSeconds: number;
};

export function CompanionSessionLayer({
  companionState,
  elapsedSeconds,
  eventLabel,
  isPaused,
  purityScore,
  sessionProgress,
  totalSeconds,
}: CompanionSessionLayerProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      pointerEvents="none"
      style={{
        alignItems: "center",
        bottom: theme.spacing[24],
        justifyContent: "center",
        left: 0,
        opacity: 0.55,
        position: "absolute",
        right: 0,
        top: theme.spacing[16],
        zIndex: 0,
      }}
    >
      <View style={{ transform: [{ scale: 1.12 }] }}>
        <LivingCompanion
          companionState={companionState}
          elapsedSeconds={elapsedSeconds}
          isPaused={isPaused}
          purityScore={purityScore}
          sessionProgress={sessionProgress}
          totalSeconds={totalSeconds}
        />
      </View>
      {eventLabel ? (
        <Animated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(180)}
          style={{
            backgroundColor: theme.colors.background.overlay,
            borderColor: theme.colors.border.light,
            borderRadius: theme.spacing[6],
            borderWidth: 1,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[2],
            position: "absolute",
            top: theme.spacing[10],
          }}
        >
          <Text variant="label" color={theme.colors.text.inverse}>
            {eventLabel}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
