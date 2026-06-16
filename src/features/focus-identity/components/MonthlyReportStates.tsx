import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}

export function MonthlyReportErrorState({
  message,
  onRetry,
  onClose,
}: ErrorStateProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing[6],
      }}
    >
      <Text
        variant="heading3"
        color="error"
        style={{ marginBottom: theme.spacing[4] }}
      >
        Report Unavailable
      </Text>
      <Text
        variant="body"
        color="textSecondary"
        style={{ textAlign: 'center', marginBottom: theme.spacing[6] }}
      >
        {message}
      </Text>
      <Button
        onPress={onRetry}
        variant="primary"
        style={{ marginBottom: theme.spacing[4] }}
      >
        Try Again
      </Button>
      <Button onPress={onClose} variant="secondary">
        <Text>Close</Text>
      </Button>
    </View>
  );
}

interface EmptyStateProps {
  onClose: () => void;
}

export function MonthlyReportEmptyState({
  onClose,
}: EmptyStateProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing[6],
      }}
    >
      <Text
        variant="heading2"
        color="text"
        style={{ marginBottom: theme.spacing[4] }}
      >
        No Report Available
      </Text>
      <Text
        variant="body"
        color="textSecondary"
        style={{ textAlign: 'center', marginBottom: theme.spacing[6] }}
      >
        Complete sessions this month to generate your first focus report.
      </Text>
      <Button onPress={onClose} variant="primary">
        <Text>Start a Session</Text>
      </Button>
    </View>
  );
}
