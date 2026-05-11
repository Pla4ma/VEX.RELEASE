/**
 * SessionValidationFeedback Component
 *
 * Displays validation errors and warnings for session configuration.
 * Provides actionable guidance to users.
 *
 * @phase 1 - Deepening: Validation feedback UI
 */

import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '../../components/primitives/Text';
import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { useTheme } from '../../theme';
import type { ValidationError, ValidationWarning } from '../utils/validation';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionValidationFeedbackProps {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  onFixError?: (field: string) => void;
  onDismissWarning?: (field: string) => void;
  compact?: boolean;
}

export function SessionValidationFeedback({
  errors,
  warnings,
  onFixError,
  onDismissWarning,
  compact = false,
}: SessionValidationFeedbackProps): JSX.Element | null {
  const { theme } = useTheme();

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  // Group errors by field
  const errorsByField = errors.reduce((acc, error) => {
    if (!acc[error.field]) {acc[error.field] = [];}
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  if (compact) {
    return (
      <Box>
        {errors.length > 0 && (
          <Box
            flexDirection="row"
            alignItems="center"
            bg="error.light"
            p="sm"
            borderRadius="md"
            mb="xs"
          >
            <Text style={styles.compactIcon}>❌</Text>
            <Text variant="caption" color="error.DEFAULT" ml="xs">
              {errors.length} error{errors.length > 1 ? 's' : ''} to fix
            </Text>
          </Box>
        )}
        {warnings.length > 0 && (
          <Box
            flexDirection="row"
            alignItems="center"
            bg="warning.light"
            p="sm"
            borderRadius="md"
          >
            <Text style={styles.compactIcon}>⚠️</Text>
            <Text variant="caption" color="warning.DEFAULT" ml="xs">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      {/* Errors Section */}
      {errors.length > 0 && (
        <Box bg="error.light" p="md" borderRadius="lg" mb="md">
          <Box flexDirection="row" alignItems="center" mb="sm">
            <Text style={styles.sectionIcon}>❌</Text>
            <Text variant="h5" color="error.DEFAULT">
              {errors.length} Error{errors.length > 1 ? 's' : ''}
            </Text>
          </Box>

          {Object.entries(errorsByField).map(([field, fieldErrors]) => (
            <View key={field} style={styles.errorGroup}>
              <Text variant="bodySmall" color="error.DEFAULT" fontWeight="600">
                {formatFieldName(field)}
              </Text>
              {fieldErrors.map((error, index) => (
                <Box key={index} flexDirection="row" mt="xs">
                  <Text style={styles.bullet}>•</Text>
                  <Text variant="bodySmall" color="error.DEFAULT" flex={1}>
                    {error.message}
                  </Text>
                </Box>
              ))}
              {onFixError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => onFixError(field)}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}

                accessibilityLabel="Fix this → button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  Fix this →
                </Button>
              )}
            </View>
          ))}
        </Box>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <Box bg="warning.light" p="md" borderRadius="lg">
          <Box flexDirection="row" alignItems="center" mb="sm">
            <Text style={styles.sectionIcon}>⚠️</Text>
            <Text variant="h5" color="warning.DEFAULT">
              {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
            </Text>
          </Box>

          {warnings.map((warning, index) => (
            <Box key={index} flexDirection="row" alignItems="flex-start" mt="xs">
              <Text style={styles.bullet}>•</Text>
              <Box flex={1}>
                <Text variant="bodySmall" color="warning.DEFAULT">
                  {warning.message}
                </Text>
                {onDismissWarning && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onDismissWarning(warning.field)}
                    style={{ alignSelf: 'flex-start', marginTop: 2 }}

                  accessibilityLabel="Dismiss button"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                    Dismiss
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Animated.View>
  );
}

function formatFieldName(field: string): string {
  return field
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const styles = createSheet({
  container: {
    width: '100%',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compactIcon: {
    fontSize: 14,
  },
  errorGroup: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  bullet: {
    marginRight: 8,
    color: 'inherit',
  },
});

export default SessionValidationFeedback;
