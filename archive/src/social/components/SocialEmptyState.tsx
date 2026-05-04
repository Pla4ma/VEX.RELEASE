/**
 * Social System - Empty State Component
 *
 * Premium empty state for when no social content exists.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../components/primitives';
import { Button } from '../../components';
import { useTheme } from '../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

interface SocialEmptyStateProps {
  type?: 'feed' | 'friends' | 'notifications' | 'profile';
  onAction?: () => void;
  fullScreen?: boolean;
}

export const SocialEmptyState: React.FC<SocialEmptyStateProps> = ({
  type = 'feed',
  onAction,
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  const content = {
    feed: {
      icon: '📭',
      title: 'No posts yet',
      message: 'Your feed is empty. Complete a focus session to share your progress!',
      actionLabel: 'Start Session',
    },
    friends: {
      icon: '👋',
      title: 'No friends yet',
      message: 'Connect with friends to see their progress and motivate each other.',
      actionLabel: 'Find Friends',
    },
    notifications: {
      icon: '🔔',
      title: 'No notifications',
      message: "You're all caught up! Check back later for updates.",
      actionLabel: undefined,
    },
    profile: {
      icon: '👤',
      title: 'Profile not found',
      message: "This user profile doesn't exist or has been removed.",
      actionLabel: 'Go Back',
    },
  };

  const { icon, title, message, actionLabel } = content[type];

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text
        variant="h3"
        style={[styles.title, { color: theme.colors.text.primary }]}
      >
        {title}
      </Text>
      <Text
        variant="body"
        style={[styles.message, { color: theme.colors.text.secondary }]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onPress={onAction}
          style={styles.actionButton}

        accessibilityLabel="Action button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = createSheet({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    minHeight: 400,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 16,
    minWidth: 140,
  },
});

export default SocialEmptyState;
