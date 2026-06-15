/**
 * Empty State Components
 *
 * Premium empty states with illustrations and actions
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '../../../../theme/ThemeContext';
import { Icon } from '../../../../icons/components/Icon';
import { lightColors } from '@/theme/tokens/colors';

interface EmptyStateProps {
  iconName: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  iconName,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.semantic.vexCyanSoft, borderColor: theme.colors.semantic.border }]}>
          <Icon name={iconName} size={32} color={theme.colors.semantic.vexCyan} variant="outline" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{message}</Text>
      </Animated.View>

      {(actionLabel || secondaryActionLabel) && (
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.actions}
        >
          {actionLabel && onAction && (
            <Pressable
              onPress={onAction}
              style={[styles.primaryButton, { backgroundColor: theme.colors.semantic.vexCyan }]}
              accessibilityLabel={actionLabel}
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </Pressable>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Pressable
              onPress={onSecondaryAction}
              style={[styles.secondaryButton, { borderColor: theme.colors.border.DEFAULT }]}
              accessibilityLabel={secondaryActionLabel}
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text.secondary }]}>
                {secondaryActionLabel}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    flex: 1,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: lightColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export {
  NoMessagesEmptyState,
  NoHistoryEmptyState,
  NoRecommendationsEmptyState,
  NoComebackEmptyState,
  MutedStateEmptyState,
  ErrorStateEmptyState,
  OfflineEmptyState,
  NoPersonasEmptyState,
  ColdStartEmptyState,
} from './empty-state-variants';
