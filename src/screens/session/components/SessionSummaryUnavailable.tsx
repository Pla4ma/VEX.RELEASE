import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { Text as VexText } from '../../../components/primitives/Text';

type SessionSummaryUnavailableProps = {
  message?: string;
  onDone: () => void;
  onRetry?: () => void;
};

export function SessionSummaryUnavailable({
  message,
  onDone,
  onRetry,
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
      <Text
        variant="body"
        color={theme.colors.text.secondary}
        textAlign="center"
        mt={12}
      >
        {message ?? 'This victory screen could not load the completed session.'}
      </Text>
      <Box width="100%" mt={24}>
        {onRetry ? (
          <Button variant="secondary"
            size="lg"
            fullWidth
            onPress={onRetry}
            accessibilityLabel="Retry session summary recovery"
            accessibilityRole="button"
            accessibilityHint="Attempts to rebuild this completion summary from the saved session record"
          >
            <VexText>Retry recovery</VexText>
          </Button>
        ) : null}
      </Box>
      <Box width="100%" mt={onRetry ? 12 : 24}>
        <Button variant="primary"
          size="lg"
          fullWidth
          onPress={onDone}
          accessibilityLabel="Return to home"
          accessibilityRole="button"
          accessibilityHint="Leaves this unavailable completion summary and opens the home screen"
        >
          <VexText>Done</VexText>
        </Button>
      </Box>
    </Box>
  );
}
