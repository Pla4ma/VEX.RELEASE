import { withScreenErrorBoundary } from "../shared/ui/components/ScreenErrorBoundary";
import React, { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "../components/primitives/Box";
import { Button } from "../components/primitives/Button";
import { Text } from "../components/primitives/Text";
import type { ExtendedRootStackParams } from "../navigation/types";
import { useSessionUIStore } from "../store/session-state";
import { useTheme } from "../theme";
import { Particle } from "./ComebackParticles";
import { capture, RetentionEvents } from "../shared/analytics";

type ComebackNavigationProp = NativeStackNavigationProp<
  ExtendedRootStackParams,
  "Comeback"
>;
type ComebackRoute = RouteProp<ExtendedRootStackParams, "Comeback">;

const PARTICLE_COUNT = 20;

export function ComebackScreen(): JSX.Element {
  const navigation = useNavigation<ComebackNavigationProp>();
  const route = useRoute<ComebackRoute>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dismissComeback = useSessionUIStore((state) => state.dismissComeback);
  const comebackState = route.params.comebackState;

  useEffect(() => {
    capture(RetentionEvents.COMEBACK_OFFER_VIEWED, {
      days_absent: comebackState.daysAbsent,
      reward_multiplier: comebackState.rewardMultiplier,
      streak_before: comebackState.streakBefore,
      streak_restore_eligible: comebackState.streakRestoreEligible,
    });
  }, [comebackState]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
        index,
        left: 12 + ((index * 17) % 320),
        size: 4 + (index % 5),
        duration: 5500 + index * 220,
        delay: index * 0.45,
      })),
    [],
  );

  const closePrompt = () => {
    dismissComeback();
    navigation.goBack();
  };

  const startComeback = () => {
    capture(RetentionEvents.COMEBACK_OFFER_ACCEPTED, {
      days_absent: comebackState.daysAbsent,
      reward_multiplier: comebackState.rewardMultiplier,
      streak_restore: comebackState.streakRestoreEligible,
    });
    dismissComeback();
    navigation.replace("SessionStack", {
      screen: "SessionSetup",
      params: {
        comebackMultiplier: comebackState.rewardMultiplier,
        comebackMessage: comebackState.message,
        comebackQuest: comebackState.streakRestoreEligible
          ? { streakBefore: comebackState.streakBefore, requiredSessions: 3 }
          : null,
      },
    });
  };

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <Box
        style={{
          ...StyleSheet.absoluteFill,
          backgroundColor: theme.colors.background.primary,
        }}
      >
        {particles.map((particle) => (
          <Particle
            key={particle.index}
            color={theme.colors.primary[300]}
            {...particle}
          />
        ))}
      </Box>

      <Box
        flex={1}
        justifyContent="center"
        px="lg"
        py="xl"
        style={{
          paddingTop: insets.top + theme.spacing[6],
          paddingBottom: insets.bottom + theme.spacing[6],
        }}
      >
        <Box
          p="xl"
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius["3xl"],
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            gap: theme.spacing[4],
          }}
        >
          <Text
            variant="label"
            color={theme.colors.primary[500]}
            textTransform="uppercase"
          >
            Comeback Mode
          </Text>
          <Text variant="h2" color={theme.colors.text.primary}>
            {comebackState.message}
          </Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            You were away {comebackState.daysAbsent} days
          </Text>

          <Box
            p="md"
            style={{
              backgroundColor: theme.colors.surface.selected,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.colors.primary[200],
            }}
          >
            <Text variant="body" color={theme.colors.text.primary}>
              {`⚡ ${comebackState.rewardMultiplier}x XP on your first session back`}
            </Text>
          </Box>

          {comebackState.streakRestoreEligible ? (
            <Box
              p="md"
              style={{
                backgroundColor: theme.colors.warning[50],
                borderRadius: theme.borderRadius.xl,
                borderWidth: 1,
                borderColor: theme.colors.warning[500],
                gap: theme.spacing[2],
              }}
            >
              <Text variant="body" color={theme.colors.text.primary}>
                {`🔥 Your ${comebackState.streakBefore}-day streak can be restored! Complete 3 sessions this week.`}
              </Text>
              <Box flexDirection="row" gap="sm">
                {[0, 1, 2].map((step) => (
                  <Box
                    key={step}
                    flex={1}
                    height={10}
                    style={{
                      backgroundColor:
                        step === 0
                          ? theme.colors.warning[500]
                          : theme.colors.background.tertiary,
                      borderRadius: theme.borderRadius.full,
                      opacity: step === 0 ? 0.35 : 1,
                    }}
                  />
                ))}
              </Box>
              <Text variant="caption" color={theme.colors.text.secondary}>
                0 / 3 sessions completed
              </Text>
            </Box>
          ) : null}

          <Button
            size="lg"
            onPress={startComeback}
            accessibilityLabel="Start My Comeback Session button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            Start My Comeback Session
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onPress={closePrompt}
            accessibilityLabel="Remind Me Later button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            Remind Me Later
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default withScreenErrorBoundary(ComebackScreen, "Comeback");
