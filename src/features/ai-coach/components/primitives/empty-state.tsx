/**
 * Empty State Components
 *
 * Premium empty states with illustrations and actions
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';


interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        <Text style={styles.icon}>{icon}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>

      {(actionLabel || secondaryActionLabel) && (
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.actions}
        >
          {actionLabel && onAction && (
            <Pressable
              onPress={onAction}
              style={styles.primaryButton}
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
              style={styles.secondaryButton}
              accessibilityLabel={secondaryActionLabel}
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text style={styles.secondaryButtonText}>
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
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#4ecdc4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
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
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
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
