import React from "react";

import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { sizing } from "../../../theme/tokens/sizing";

export function HistorySkeleton(): JSX.Element {
  return (
    <Box p="lg">
      {[0, 1, 2].map((key) => (
        <Box
          key={key}
          bg="background.secondary"
          borderRadius="lg"
          height={sizing.height["2xl"]}
          mb="sm"
        />
      ))}
    </Box>
  );
}

export function HistoryEmptyState({
  onStart,
}: {
  onStart: () => void;
}): JSX.Element {
  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl">
      <Text variant="h3" color="text.primary" textAlign="center" mb="md">
        Your record starts with one real session.
      </Text>
      <Text variant="body" color="text.secondary" textAlign="center" mb="lg">
        Finish a focus block and VEX will track the rhythm you actually built.
      </Text>
      <Button
        accessibilityHint="Starts setup for a new focus session"
        accessibilityLabel="Start a focus session"
        accessibilityRole="button"
        onPress={onStart}
        variant="primary"
      >
        Start Focus
      </Button>
    </Box>
  );
}
