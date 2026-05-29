import React, { useCallback } from "react";
import { Pressable } from "react-native";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import type { ModeCompletionSurface } from "../schemas";
import { useModeCompletion } from "../hooks";
import type { Lane } from "../../lane-engine/types";

interface ModeCompletionSurfaceProps {
  lane: Lane | null | undefined;
  topic?: string;
  task?: string;
  project?: string;
  action?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export function ModeCompletionSurface({
  lane,
  topic,
  task,
  project,
  action,
  onPrimaryAction,
  onSecondaryAction,
}: ModeCompletionSurfaceProps): JSX.Element {
  const surface: ModeCompletionSurface = useModeCompletion({
    laneOverride: lane,
    topic,
    task,
    project,
    action,
  });

  const handleSecondary = useCallback(() => {
    onSecondaryAction?.();
  }, [onSecondaryAction]);

  return (
    <Box flex={1} justifyContent="center" alignItems="center" px="lg" gap="xl">
      {/* Headline */}
      <Box alignItems="center" gap="sm">
        <Text variant="h2" color="text.primary" textAlign="center">
          {surface.headline}
        </Text>
        <Text variant="body" color="text.secondary" textAlign="center">
          {surface.body}
        </Text>
      </Box>

      {/* Primary action */}
      <Pressable
        onPress={onPrimaryAction}
        accessibilityLabel={surface.primaryActionLabel}
        accessibilityRole="button"
        accessibilityHint="Continue to the next step"
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Box
          minHeight={52}
          borderRadius="lg"
          bg="primary.500"
          justifyContent="center"
          alignItems="center"
          px="xl"
        >
          <Text variant="button" color="text.inverse" fontWeight="600">
            {surface.primaryActionLabel}
          </Text>
        </Box>
      </Pressable>

      {/* Secondary hint */}
      {surface.secondaryHint ? (
        <Pressable
          onPress={handleSecondary}
          accessibilityLabel={surface.secondaryHint}
          accessibilityRole="button"
          accessibilityHint="Tap for next action suggestion"
          style={{ minHeight: 44, justifyContent: "center" }}
          disabled={!onSecondaryAction}
        >
          <Box alignItems="center" gap="xs">
            <Text variant="caption" color="text.tertiary">
              {surface.secondaryHint}
            </Text>
            {surface.insightLabel ? (
              <Text variant="caption" color="text.tertiary">
                {surface.insightLabel}
              </Text>
            ) : null}
          </Box>
        </Pressable>
      ) : null}
    </Box>
  );
}
