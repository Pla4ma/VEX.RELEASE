import React from "react";
import { Pressable, View } from "react-native";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import type { TomorrowPreviewProps } from "./TomorrowPreview";

export function TomorrowPreviewCompact({
  streakWillContinue,
  events,
  onPress,
}: {
  streakWillContinue: boolean;
  events: TomorrowPreviewProps["events"];
  onPress: () => void;
}): JSX.Element {
  const firstEvent = events[0];
  const eventEmoji = firstEvent
    ? firstEvent.type === "double_xp"
      ? "🔥"
      : firstEvent.type === "squad_war"
        ? "⚔️"
        : firstEvent.type === "boss_rush"
          ? "👹"
          : "🌙"
    : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        p="md"
        borderRadius="lg"
        bg="background.secondary"
      >
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16}>➡️</Text>
          <Text variant="body" color="text.secondary">
            Tomorrow:
          </Text>
          <Text
            variant="body"
            color={streakWillContinue ? "text.primary" : "error.DEFAULT"}
            fontWeight="600"
          >
            {streakWillContinue ? "🔥 Streak continues" : "⚠️ Streak at risk"}
          </Text>
          {eventEmoji && <Text fontSize={16}>{eventEmoji}</Text>}
        </Box>
        <Text variant="caption" color="text.tertiary">
          ›
        </Text>
      </Box>
    </Pressable>
  );
}
