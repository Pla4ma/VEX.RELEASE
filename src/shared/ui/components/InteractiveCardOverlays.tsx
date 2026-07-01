import React from 'react';
import { View, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import type { Theme } from '../../../theme';
import { cardStyles as styles } from './InteractiveCardStyles';

export const LoadingOverlay: React.ComponentType<{ message?: string; theme: Theme }> = ({
  message,
  theme,
}) => (
  <View
    style={[
      styles.overlay,
      { backgroundColor: theme.colors.background.overlay },
    ]}
  >
    <Animated.View
      style={[styles.spinner, { borderColor: theme.colors.primary[500] }]}
    />
    {message && (
      <Text
        variant="caption"
        color="text.secondary"
        style={styles.overlayMessage}
      >
        {message}
      </Text>
    )}
  </View>
);

export const DisabledOverlay: React.ComponentType<{ reason?: string; theme: Theme }> = ({
  reason,
  theme,
}) => (
  <View
    style={[
      styles.overlay,
      { backgroundColor: theme.colors.background.overlay },
    ]}
  >
    <Icon name="lock" size="md" color={theme.colors.text.tertiary} />
    {reason && (
      <Text
        variant="caption"
        color="text.tertiary"
        style={styles.overlayMessage}
      >
        {reason}
      </Text>
    )}
  </View>
);

export const ErrorOverlay: React.ComponentType<{
  message?: string;
  onRetry?: () => void;
  theme: Theme;
}> = ({ message, onRetry, theme }) => (
  <View
    style={[
      styles.overlay,
      { backgroundColor: theme.colors.background.overlay },
    ]}
  >
    <Icon
      name="alert-circle"
      size="lg"
      color={theme.colors.error.DEFAULT}
    />
    {message && (
      <Text
        variant="caption"
        color="error.DEFAULT"
        style={styles.overlayMessage}
      >
        {message}
      </Text>
    )}
    {onRetry && (
      <Pressable
        onPress={onRetry}
        style={[
          styles.retryButton,
          { backgroundColor: theme.colors.error.DEFAULT },
        ]}
        accessibilityLabel="Retry loading"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text variant="caption" color="text.inverse">
          Retry
        </Text>
      </Pressable>
    )}
  </View>
);

export const SelectedOverlay: React.ComponentType<{ icon?: string; theme: Theme }> = ({
  icon = 'check-circle',
  theme,
}) => (
  <View
    style={[
      styles.selectedIndicator,
      { backgroundColor: theme.colors.success.DEFAULT },
    ]}
  >
    <Icon name={icon} size="sm" color={theme.colors.text.inverse} />
  </View>
);
