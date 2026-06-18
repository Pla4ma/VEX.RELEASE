/**
 * Session Error State
 *
 * Displays when a session encounters an unexpected error.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';
import { sanitizeErrorMessage } from '../../../../utils/error-sanitizer';
import { SessionErrorActions } from './SessionErrorActions';
import { styles } from './SessionErrorState.styles';

function getErrorMessage(err: Error): string {
  const message = err.message.toLowerCase();
  if (message.includes('network')) {
    return 'VEX lost connection. Your session is saved. Try again?';
  }
  if (message.includes('timeout')) {
    return "Couldn't start your session. The servers are taking longer than expected.";
  }
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'Session expired. Log back in and your progress is safe.';
  }
  if (message.includes('not found')) {
    return 'Session not found. It may have ended or been cleared.';
  }
  if (message.includes('sync') || message.includes('conflict')) {
    return 'Session sync failed. Your focus data is safe, but we need to resolve a conflict.';
  }
  return sanitizeErrorMessage(err);
}

interface SessionErrorStateProps {
  error: Error;
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}

export const SessionErrorState: React.FC<SessionErrorStateProps> = ({
  error,
  onRetry,
  onGoBack,
  onContactSupport,
}) => {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  return (
    <View style={[styles.container, { backgroundColor: semantic.background }]}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: `${semantic.danger}18`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: semantic.danger }}>
          ×
        </Text>
      </View>
      <Text style={[styles.title, { color: semantic.danger }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: semantic.textPrimary }]}>
        {getErrorMessage(error)}
      </Text>
      <View style={[styles.errorDetails, { backgroundColor: semantic.surfaceElevated }]}>
        <Text style={[styles.errorCode, { color: semantic.danger }]}>
          Error: {error.name}
        </Text>
        <Text style={[styles.errorHint, { color: semantic.textMuted }]}>
          {sanitizeErrorMessage(error)}
        </Text>
      </View>
      <SessionErrorActions
        onRetry={onRetry}
        onGoBack={onGoBack}
        onContactSupport={onContactSupport}
      />
    </View>
  );
};

export default SessionErrorState;
