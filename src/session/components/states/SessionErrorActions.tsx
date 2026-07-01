import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { styles } from './SessionErrorState.styles';

interface SessionErrorActionsProps {
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}

export const SessionErrorActions: React.ComponentType<SessionErrorActionsProps> = ({
  onRetry,
  onGoBack,
  onContactSupport,
}) => {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  return (
    <>
      <View style={styles.actions}>
        {onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: semantic.danger },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetry}
            accessibilityLabel="Try again"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.primaryButtonText, { color: semantic.textPrimary }]}>
              Try Again
            </Text>
          </Pressable>
        )}
        {onGoBack && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: semantic.borderStrong },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onGoBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.secondaryButtonText, { color: semantic.textSecondary }]}>
              Go Back
            </Text>
          </Pressable>
        )}
        {onContactSupport && (
          <Pressable
            style={({ pressed }) => [
              styles.supportButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onContactSupport}
            accessibilityLabel="Contact support"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.supportButtonText, { color: semantic.textMuted }]}>
              Contact Support
            </Text>
          </Pressable>
        )}
      </View>
      <View
        style={[
          styles.recoveryInfo,
          {
            backgroundColor: `${semantic.success}10`,
            borderColor: `${semantic.success}20`,
          },
        ]}
      >
        <Text style={[styles.recoveryTitle, { color: semantic.success }]}>
          Your Progress is Safe
        </Text>
        <Text style={[styles.recoveryText, { color: semantic.textMuted }]}>
          Your session data is protected. Any focus time will be restored once
          service is back.
        </Text>
      </View>
    </>
  );
};
