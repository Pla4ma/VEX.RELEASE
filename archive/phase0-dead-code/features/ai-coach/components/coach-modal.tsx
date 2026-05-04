/**
 * Coach Modal Component
 *
 * Full-screen modal for displaying important coach messages
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { CoachMessage } from '../schemas';
import { useCoachMessageActions, useCoachUIActions } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

export interface CoachModalProps {
  visible: boolean;
  message: CoachMessage | null;
  userId: string;
  onClose?: () => void;
}

export function CoachModal({ visible, message, userId, onClose }: CoachModalProps): JSX.Element | null {
  const { dismiss, takeAction } = useCoachMessageActions(message?.id || '', userId);
  const uiActions = useCoachUIActions();

  if (!message) {return null;}

  const handleClose = async () => {
    await dismiss();
    uiActions.closeModal();
    onClose?.();
  };

  const handleAction = async (action: string) => {
    await takeAction(action);
    uiActions.closeModal();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.backdrop}>
          <Pressable style={styles.backdropPressable} onPress={handleClose}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"/>
        </Animated.View>

        <Animated.View entering={ZoomIn.duration(300)} style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.icon}>{getIconForCategory(message.category)}</Text>
            <Text style={styles.category}>{formatCategory(message.category)}</Text>
            <Text style={styles.messageText}>{message.content}</Text>

            <View style={styles.actions}>
              {message.category === 'STREAK_RISK' && (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleAction('START_SESSION')}
                  accessibilityLabel="Start session to save streak"

                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  <Text style={styles.primaryButtonText}>Save My Streak 🔥</Text>
                </Pressable>
              )}

              {message.category === 'MILESTONE_HYPE' && (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleAction('SHARE_MILESTONE')}
                  accessibilityLabel="Share milestone achievement"

                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  <Text style={styles.primaryButtonText}>Share Achievement 🎉</Text>
                </Pressable>
              )}

              {message.category === 'COMEBACK_SUPPORT' && (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleAction('ACCEPT_COMEBACK')}
                  accessibilityLabel="Accept comeback offer"

                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  <Text style={styles.primaryButtonText}>Start Comeback 💪</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.secondaryButton}
                onPress={handleClose}
                accessibilityLabel="Dismiss message"

              accessibilityRole="button"
              accessibilityHint="Activates this control">
                <Text style={styles.secondaryButtonText}>Maybe Later</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function getIconForCategory(category: string): string {
  const icons: Record<string, string> = {
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

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

const styles = createSheet({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  container: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#666',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});
