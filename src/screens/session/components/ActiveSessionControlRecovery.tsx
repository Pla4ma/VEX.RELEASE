import React from "react";
import { Pressable } from "react-native";

import { Box, Card, Text } from "../../../components/primitives";
import { Icon } from "../../../icons";
import type { ActiveSessionControlFailure } from "../utils/active-session-control-failure";

type ActiveSessionControlRecoveryProps = {
  failure: ActiveSessionControlFailure;
  onDismiss: () => void;
  onRetry: () => void;
};

export function ActiveSessionControlRecovery({
  failure,
  onDismiss,
  onRetry,
}: ActiveSessionControlRecoveryProps): JSX.Element {
  return (
    <Box px="lg" pb="md">
      <Card size="md">
        <Box flexDirection="row" alignItems="flex-start" gap={12}>
          <Icon name="alert-circle" size={20} color="warning.DEFAULT" />
          <Box flex={1}>
            <Text variant="h4" color="text.primary">
              {failure.title}
            </Text>
            <Text
              variant="caption"
              color="text.secondary"
              style={{ marginTop: 6 }}
            >
              {failure.message}
            </Text>
            <Text
              variant="caption"
              color="text.tertiary"
              style={{ marginTop: 6 }}
            >
              {failure.supportHint}
            </Text>
            <Box flexDirection="row" gap={10} mt={12}>
              <Pressable
                onPress={onRetry}
                accessibilityLabel={`Retry ${failure.action} session action`}
                accessibilityRole="button"
                accessibilityHint="Attempts the failed session control again"
              >
                <Box px={14} py={10} borderRadius="lg" bg="primary.500">
                  <Text variant="label" color="text.inverse">
                    Retry
                  </Text>
                </Box>
              </Pressable>
              <Pressable
                onPress={onDismiss}
                accessibilityLabel="Dismiss session recovery warning"
                accessibilityRole="button"
                accessibilityHint="Keeps the session open and hides this recovery message"
              >
                <Box px={14} py={10} borderRadius="lg" bg="background.tertiary">
                  <Text variant="label" color="text.secondary">
                    Keep focusing
                  </Text>
                </Box>
              </Pressable>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
