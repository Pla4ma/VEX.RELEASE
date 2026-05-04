/**
 * Coach Card Component
 *
 * Displays a coach message in card format with appropriate styling
 * based on message category and priority.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { CoachMessage, MessageCategory } from '../schemas';
import { useCoachMessageActions } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

export interface CoachCardProps {
  message: CoachMessage;
  userId: string;
  onAction?: (action: string) => void;
  onDismiss?: () => void;
}

const CATEGORY_CONFIG: Record<MessageCategory, { icon: string; color: string; bgColor: string }> = {
  STREAK_RISK: { icon: '🔥', color: '#FF6B6B', bgColor: '#FFF5F5' },
  SESSION_SUGGESTION: { icon: '🎯', color: '#4ECDC4', bgColor: '#F0FDFB' },
  MILESTONE_HYPE: { icon: '🎉', color: '#FFD93D', bgColor: '#FFFBEB' },
  COMEBACK_SUPPORT: { icon: '💪', color: '#6BCB77', bgColor: '#F0FFF4' },
  POST_FAILURE: { icon: '🌱', color: '#9B59B6', bgColor: '#FAF5FF' },
  PROGRESS_REMINDER: { icon: '📈', color: '#3498DB', bgColor: '#F0F9FF' },
  DIFFICULTY_ADJUST: { icon: '⚙️', color: '#95A5A6', bgColor: '#F8F9FA' },
  CHALLENGE_PROMPT: { icon: '🎮', color: '#E74C3C', bgColor: '#FEF2F2' },
  MOTIVATION_BOOST: { icon: '✨', color: '#F39C12', bgColor: '#FFFBEB' },
  BREAK_SUGGESTION: { icon: '🧘', color: '#1ABC9C', bgColor: '#F0FDF4' },
  OVERLOAD_WARNING: { icon: '⚠️', color: '#E67E22', bgColor: '#FFF7ED' },
};

export function CoachCard({ message, userId, onAction, onDismiss }: CoachCardProps) {
  const { dismiss, markRead, takeAction, isProcessing } = useCoachMessageActions(message.id, userId);
  const config = CATEGORY_CONFIG[message.category];

  const handleAction = async (action: string) => {
    await takeAction(action);
    onAction?.(action);
  };

  const handleDismiss = async () => {
    await dismiss();
    onDismiss?.();
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.container, { backgroundColor: config.bgColor }]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.category, { color: config.color }]}>
          {formatCategory(message.category)}
        </Text>
        <Pressable
          onPress={handleDismiss}
          disabled={isProcessing}
          accessibilityLabel="Dismiss message"
          style={styles.dismissButton}

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.content}>{message.content}</Text>

      <View style={styles.actions}>
        {getActionButtons(message.category, handleAction, isProcessing)}
      </View>
    </Animated.View>
  );
}

function formatCategory(category: MessageCategory): string {
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getActionButtons(
  category: MessageCategory,
  onAction: (action: string) => void,
  isProcessing: boolean
): React.ReactNode {
  const buttonStyle = [styles.actionButton, isProcessing && styles.buttonDisabled];

  switch (category) {
    case 'STREAK_RISK':
    case 'SESSION_SUGGESTION':
      return (
        <Pressable
          onPress={() => onAction('START_SESSION')}
          disabled={isProcessing}
          style={buttonStyle}
          accessibilityLabel="Start focus session"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.actionButtonText}>Start Session</Text>
        </Pressable>
      );

    case 'COMEBACK_SUPPORT':
      return (
        <Pressable
          onPress={() => onAction('ACCEPT_COMEBACK')}
          disabled={isProcessing}
          style={buttonStyle}
          accessibilityLabel="Accept comeback offer"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.actionButtonText}>Let's Go!</Text>
        </Pressable>
      );

    case 'CHALLENGE_PROMPT':
      return (
        <Pressable
          onPress={() => onAction('VIEW_CHALLENGE')}
          disabled={isProcessing}
          style={buttonStyle}
          accessibilityLabel="View challenge details"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.actionButtonText}>View Challenge</Text>
        </Pressable>
      );

    case 'DIFFICULTY_ADJUST':
      return (
        <>
          <Pressable
            onPress={() => onAction('EASIER')}
            disabled={isProcessing}
            style={[buttonStyle, styles.secondaryButton]}
            accessibilityLabel="Make it easier"

          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Text style={styles.secondaryButtonText}>Easier</Text>
          </Pressable>
          <Pressable
            onPress={() => onAction('HARDER')}
            disabled={isProcessing}
            style={buttonStyle}
            accessibilityLabel="Make it harder"

          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Text style={styles.actionButtonText}>Harder</Text>
          </Pressable>
        </>
      );

    default:
      return (
        <Pressable
          onPress={() => onAction('ACKNOWLEDGED')}
          disabled={isProcessing}
          style={buttonStyle}
          accessibilityLabel="Acknowledge message"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.actionButtonText}>Got It</Text>
        </Pressable>
      );
  }
}

export function CoachCardSkeleton(): JSX.Element {
  return (
    <View style={[styles.container, styles.skeleton]}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonCategory} />
      </View>
      <View style={styles.skeletonContent} />
      <View style={styles.skeletonContent} />
      <View style={styles.skeletonButton} />
    </View>
  );
}

const styles = createSheet({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 18,
    color: '#999',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#E8E8E8',
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#F0F0F0',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  skeletonCategory: {
    width: 100,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  skeletonContent: {
    width: '100%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  skeletonButton: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
});
