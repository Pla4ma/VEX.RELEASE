import React, { useMemo } from "react";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { calculateEstimatedXp } from "./duration-picker-types";

export function XpEstimate({
  minutes,
  xpPerMinute,
  streakMultiplier,
  isStrictMode,
}: {
  minutes: number;
  xpPerMinute: number;
  streakMultiplier: number;
  isStrictMode: boolean;
}): JSX.Element {
  const { theme } = useTheme();
  const estimatedXp = useMemo(
    () =>
      calculateEstimatedXp(
        minutes,
        xpPerMinute,
        streakMultiplier,
        isStrictMode,
      ),
    [minutes, xpPerMinute, streakMultiplier, isStrictMode],
  );
  return (
    <Box alignItems="center" gap="xs" mt="md">
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={20}>✨</Text>
        <Text variant="h4" color="text.primary" fontWeight="700">
          ~{estimatedXp} XP
        </Text>
      </Box>

      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        flexWrap="wrap"
        justifyContent="center"
      >
        <Text variant="caption" color="text.tertiary">
          {minutes} min × {xpPerMinute} XP/min
        </Text>
        {streakMultiplier > 1 && (
          <Box
            px="xs"
            py="xs"
            borderRadius="sm"
            bg={`${theme.colors.accent.orange}20`}
          >
            <Text
              variant="caption"
              color={theme.colors.accent.orange}
              fontWeight="700"
            >
              🔥 {streakMultiplier.toFixed(1)}× streak
            </Text>
          </Box>
        )}
        {isStrictMode && (
          <Box
            px="xs"
            py="xs"
            borderRadius="sm"
            bg={`${theme.colors.success[500]}20`}
          >
            <Text
              variant="caption"
              color={theme.colors.success.DEFAULT}
              fontWeight="700"
            >
              +20% strict
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
