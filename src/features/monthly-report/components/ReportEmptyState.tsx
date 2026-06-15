import React from 'react';
import { Box, Text, Button } from '@components/primitives';

interface ReportEmptyStateProps {
  isOffline: boolean;
  onStartSession: () => void;
}

export function ReportEmptyState({
  isOffline,
  onStartSession,
}: ReportEmptyStateProps): React.ReactNode {
  return (
    <Box flex={1} bg="background.primary">
      {isOffline ? (
        <Box bg="warning" p="sm" alignItems="center">
          <Text variant="caption" color="text.primary">
            You are offline. Data may be outdated.
          </Text>
        </Box>
      ) : null}
      <Box flex={1} p="md" justifyContent="center" alignItems="center">
        <Text variant="h3" color="text" mb="sm">
          No Sessions Yet
        </Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          Complete focus sessions this month to generate your first monthly report.
        </Text>
        <Button
          <Text>onPress={onStartSession}</Text>
          variant="primary"
          accessibilityLabel="Start a session"
          accessibilityRole="button"
          accessibilityHint="Navigates to session setup"
        >
          Start a session
        </Button>
      </Box>
    </Box>
  );
}
