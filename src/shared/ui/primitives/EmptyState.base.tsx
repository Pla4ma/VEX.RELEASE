import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import { glow } from '../../../theme/tokens/elevation';
import { useFadeIn, useSlideIn } from '../hooks/useReanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface EmptyStateProps {
  icon?: string;
  iconName?: string;
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

export function EmptyState({
  icon,
  iconName,
  tone = 'primary',
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  animated = true,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const fadeStyle = useFadeIn(500, animated ? 100 : 0);
  const slideStyle = useSlideIn('up', 30);
  const containerStyle = animated ? fadeStyle : undefined;
  const contentStyle = animated ? slideStyle : undefined;
  const toneColorMap: Record<NonNullable<EmptyStateProps['tone']>, string> = {
    primary: theme.colors.primary[400],
    success: theme.colors.success.DEFAULT,
    warning: theme.colors.warning.DEFAULT,
    error: theme.colors.error.DEFAULT,
    info: theme.colors.info.DEFAULT,
  };
  const accent = toneColorMap[tone];
  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <View
          style={[
            styles.iconContainer,
            iconName
              ? {
                  backgroundColor: theme.colors.background.tertiary,
                  ...glow(accent, 'whisper'),
                }
              : { backgroundColor: theme.colors.background.tertiary },
          ]}
        >
          {iconName ? (
            <Icon name={iconName} size="2xl" color={accent} variant="solid" />
          ) : (
            <Text style={styles.icon}>{icon}</Text>
          )}
        </View>

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.message, { color: theme.colors.text.tertiary }]}>
          {message}
        </Text>

        {(actionLabel || secondaryActionLabel) && (
          <View style={styles.actions}>
            {actionLabel && onAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary[500] },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onAction}
                accessibilityLabel="Action"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.colors.text.inverse },
                  ]}
                >
                  {actionLabel}
                </Text>
              </Pressable>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onSecondaryAction}
                accessibilityLabel="Action"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.colors.primary[500] },
                  ]}
                >
                  {secondaryActionLabel}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: { alignItems: 'center', maxWidth: 400 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: { flexDirection: 'column', gap: 12, width: '100%' },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '500' },
});
