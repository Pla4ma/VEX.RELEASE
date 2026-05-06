import React from 'react';

import { Box, Button, Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';

type SessionSummaryUnavailableProps = {
  message?: string;
  onDone: () => void;
};

export function SessionSummaryUnavailable({
  message,
  onDone,
}: SessionSummaryUnavailableProps) {
  const { theme } = useTheme();

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      px={24}
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Text variant="h3" color={theme.colors.text.primary} textAlign="center">
        Session summary unavailable
      </Text>
      <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mt={12}>
        {message ?? 'This victory screen could not load the completed session.'}
      </Text>
      <Box width="100%" mt={24}>
        <Button variant="primary" size="lg" fullWidth onPress={onDone}
  accessibilityLabel="Done button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Done
        </Button>
      </Box>
    </Box>
  );
}
