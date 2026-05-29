import React from "react";
import { Pressable } from "react-native";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useModeHomeSurface } from "../hooks";
import type { Lane } from "../../lane-engine/types";
import type { HomeContext } from "../service";

interface ModeNativeHomeProps {
  lane: Lane | null | undefined;
  homeContext: HomeContext;
  onStart: () => void;
}

export function ModeNativeHome({
  lane,
  homeContext,
  onStart,
}: ModeNativeHomeProps): JSX.Element {
  const context: HomeContext = {
    ...homeContext,
    laneOverride: lane,
  };
  const surface = useModeHomeSurface(context);

  return (
    <Box flex={1} justifyContent="center" px="lg" gap="xl">
      {/* Mode feeling */}
      <Box gap="xs">
        <Text variant="caption" color="text.tertiary" textTransform="uppercase">
          {surface.lane === "student"
            ? "Study"
            : surface.lane === "game_like"
              ? "Run"
              : surface.lane === "deep_creative"
                ? "Project"
                : "Clean"}
        </Text>
        <Text variant="h2" color="text.primary">
          {surface.headline}
        </Text>
        <Text variant="body" color="text.secondary" mt="xs">
          {surface.body}
        </Text>
      </Box>

      {/* Primary action */}
      <Pressable
        onPress={onStart}
        accessibilityLabel={surface.primaryActionLabel}
        accessibilityRole="button"
        accessibilityHint={surface.secondaryHint ?? "Start a session"}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Box
          minHeight={56}
          borderRadius="lg"
          bg="primary.500"
          justifyContent="center"
          alignItems="center"
          px="lg"
        >
          <Text variant="button" color="text.inverse" fontWeight="600">
            {surface.primaryActionLabel}
          </Text>
          <Text variant="caption" color="text.inverse" mt="xs">
            ~{surface.suggestedDurationMinutes} minutes
          </Text>
        </Box>
      </Pressable>

      {/* Secondary hint */}
      {surface.secondaryHint ? (
        <Box alignItems="center" gap="xs">
          <Text variant="caption" color="text.tertiary">
            {surface.secondaryHint}
          </Text>
          {surface.rhythmLabel ? (
            <Text variant="caption" color="text.tertiary">
              {surface.rhythmLabel}
            </Text>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
