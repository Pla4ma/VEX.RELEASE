/**
 * Coach Banner Component
 *
 * Compact banner for displaying coach messages inline
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { SlideInDown, SlideOutUp } from 'react-native-reanimated';
import { CoachMessage, MessageCategory } from '../schemas';
import { useCoachMessageActions } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

export interface CoachBannerProps {
  message: CoachMessage;
  userId: string;
  onDismiss?: () => void;
}

const CATEGORY_COLORS: Record<MessageCategory, { bg: string; border: string; text: string }> = {
  STREAK_RISK: { bg: '#FFF5F5', border: '#FC8181', text: '#C53030' },
  SESSION_SUGGESTION: { bg: '#F0FDFB', border: '#4FD1C5', text: '#285E61' },
  MILESTONE_HYPE: { bg: '#FFFBEB', border: '#F6E05E', text: '#975A16' },
  COMEBACK_SUPPORT: { bg: '#F0FFF4', border: '#68D391', text: '#276749' },
  POST_FAILURE: { bg: '#FAF5FF', border: '#B794F6', text: '#553C9A' },
  PROGRESS_REMINDER: { bg: '#F0F9FF', border: '#63B3ED', text: '#2C5282' },
  DIFFICULTY_ADJUST: { bg: '#F8F9FA', border: '#A0AEC0', text: '#4A5568' },
  CHALLENGE_PROMPT: { bg: '#FEF2F2', border: '#FC8181', text: '#9B2C2C' },
  MOTIVATION_BOOST: { bg: '#FFFBEB', border: '#F6AD55', text: '#7C2D12' },
  BREAK_SUGGESTION: { bg: '#F0FDF4', border: '#68D391', text: '#276749' },
  OVERLOAD_WARNING: { bg: '#FFF7ED', border: '#F6AD55', text: '#7C2D12' },
};

export function CoachBanner({ message, userId, onDismiss }: CoachBannerProps): JSX.Element {
  const { dismiss, takeAction, isProcessing } = useCoachMessageActions(message.id, userId);
  const colors = CATEGORY_COLORS[message.category];

  const handleDismiss = async () => {
    await dismiss();
    onDismiss?.();
  };

  const handleAction = async () => {
    await takeAction('START_SESSION');
  };

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutUp}
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderLeftColor: colors.border,
          borderLeftWidth: 4,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIconForCategory(message.category)}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {message.content}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {(message.category === 'STREAK_RISK' || message.category === 'SESSION_SUGGESTION') && (
          <Pressable
            onPress={handleAction}
            disabled={isProcessing}
            style={[styles.actionButton, { backgroundColor: colors.border }]}
            accessibilityLabel="Start session"

          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Text style={styles.actionButtonText}>Go</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleDismiss}
          disabled={isProcessing}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={[styles.dismissText, { color: colors.text }]}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function getIconForCategory(category: MessageCategory): string {
  const icons: Record<MessageCategory, string> = {
    STREAK_RISK: '🔥',
    SESSION_SUGGESTION: '🎯',
    MILESTONE_HYPE: '🎉',
    COMEBACK_SUPPORT: '💪',
    POST_FAILURE: '🌱',
    PROGRESS_REMINDER: '📈',
    DIFFICULTY_ADJUST: '⚙️',
    CHALLENGE_PROMPT: '🎮',
    MOTIVATION_BOOST: '✨',
    BREAK_SUGGESTION: '🧘',
    OVERLOAD_WARNING: '⚠️',
  };
  return icons[category] || '💬';
}

const styles = createSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 44,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
