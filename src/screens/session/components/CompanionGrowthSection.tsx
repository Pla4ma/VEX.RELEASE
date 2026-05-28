import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import { Box, Button, Text } from "../../../components/primitives";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import type { SessionSummary } from "../../../session/types";
import type { Theme } from "../../../theme/types";
import {
  type CompanionGrowth,
  loadCompanionGrowth,
} from "../../../features/companion/session-storage";
import {
  type LoadState,
  buildFallbackGrowth,
} from "./CompanionGrowthSection.helpers";

type CompanionGrowthSectionProps = {
  sessionId: string;
  summary: SessionSummary;
  theme: Theme;
  userId: string;
};

export function CompanionGrowthSection({
  sessionId,
  summary,
  theme,
  userId,
}: CompanionGrowthSectionProps): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const load = useCallback(() => {
    if (!userId) {
      setLoadState({ status: "empty" });
      return;
    }
    setLoadState({ status: "loading" });
    loadCompanionGrowth(userId, sessionId)
      .then(
        (growth) => growth ?? buildFallbackGrowth(sessionId, summary, userId),
      )
      .then((growth) => setLoadState({ status: "success", growth }))
      .catch((caught: unknown) => {
        setLoadState({
          status: "error",
          error: caught instanceof Error ? caught : new Error(String(caught)),
        });
      });
  }, [sessionId, summary, userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadState.status === "loading") {
    return (
      <Box
        mt={6}
        p={4}
        borderRadius="lg"
        bg={theme.colors.background.secondary}
      >
        <Box
          width={160}
          height={16}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          mt={3}
          width="100%"
          height={10}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
        />
      </Box>
    );
  }

  if (loadState.status === "error") {
    return (
      <Box
        mt={6}
        p={4}
        borderRadius="lg"
        bg={theme.colors.background.secondary}
      >
        <Text variant="label" color={theme.colors.error.DEFAULT}>
          Companion sync stumbled.
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary} mt={1}>
          Your session is safe. Retry the companion growth sync.
        </Text>
        <Button
          variant="secondary"
          onPress={load}
          style={{ marginTop: theme.spacing[3] }}
          accessibilityLabel="Retry button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (loadState.status === "empty") {
    return (
      <Box
        mt={6}
        p={4}
        borderRadius="lg"
        bg={theme.colors.background.secondary}
      >
        <Text variant="label" color={theme.colors.text.primary}>
          Companion is waiting for a profile.
        </Text>
      </Box>
    );
  }

  const { growth } = loadState;
  const progressPercent = Math.round(growth.progressToEvolution * 100);

  return (
    <Animated.View
      entering={isReducedMotion ? undefined : FadeIn.duration(260)}
    >
      <Box
        mt={6}
        p={4}
        borderRadius="lg"
        bg={theme.colors.background.secondary}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Text variant="label" color={theme.colors.primary[400]}>
              Companion grew with you
            </Text>
            <Text variant="h4" color={theme.colors.text.primary} mt={1}>
              {growth.mood}
            </Text>
          </Box>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {growth.phase} - LVL {growth.level}
          </Text>
        </Box>
        <Box
          mt={4}
          height={10}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary[500],
              borderRadius: theme.spacing[2],
              height: theme.spacing[2],
              width: `${progressPercent}%`,
            }}
          />
        </Box>
        <Text variant="caption" color={theme.colors.text.secondary} mt={2}>
          {progressPercent}% toward the next evolution.
        </Text>
        {growth.leveledUp ? (
          <Animated.View
            entering={isReducedMotion ? undefined : ZoomIn.duration(300)}
          >
            <Text variant="label" color={theme.colors.success.DEFAULT} mt={3}>
              {growth.evolved
                ? "Evolution burst unlocked."
                : "Companion level up."}
            </Text>
          </Animated.View>
        ) : null}
      </Box>
    </Animated.View>
  );
}

export { type LoadState } from "./CompanionGrowthSection.helpers";
export type { CompanionGrowth } from "../../../features/companion/session-storage";
