import React from 'react';
import { View, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import type { AsyncStatus } from './StatusFeedback.types';

export const CardStatusOverlay: React.FC<{
  status: AsyncStatus;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ status, message, onRetry, style }) => {
  const { theme } = useTheme();

  if (status === 'idle' || status === 'success') {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[
        {
          ...StyleSheet.absoluteFill,
          backgroundColor: `${theme.colors.background.primary}E0`,
          borderRadius: theme.borderRadius.xl,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing[4],
          gap: theme.spacing[3],
        },
        style,
      ]}
    >
      {status === 'loading' || status === 'retrying' ? (
        <>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary[500]}
          />
          {message && (
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              {message}
            </Text>
          )}
        </>
      ) : status === 'error' ? (
        <>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.error[50],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: theme.colors.error.DEFAULT, fontSize: 24 }}>
              ✕
            </Text>
          </View>
          {message && (
            <Text
              variant="bodySmall"
              color={theme.colors.error.DEFAULT}
              textAlign="center"
            >
              {message}
            </Text>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onPress={onRetry}
              accessibilityLabel="Retry loading"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Retry
            </Button>
          )}
        </>
      ) : null}
    </Animated.View>
  );
};
