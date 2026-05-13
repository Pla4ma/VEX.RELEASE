/**
 * Network Status Component
 * Shows offline/slow connection indicators
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import { createSheet } from '@/shared/ui/create-sheet';

interface NetworkStatusProps {
  isOffline: boolean;
  isSlowConnection?: boolean;
  pendingSyncCount?: number;
  onSync?: () => void;
  onDismiss?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOffline,
  isSlowConnection,
  pendingSyncCount,
  onSync,
  onDismiss,
}) => {
  const { theme } = useTheme();

  if (!isOffline && !isSlowConnection) {return null;}

  const isWarning = isSlowConnection && !isOffline;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: isOffline
            ? theme.colors.error.DEFAULT
            : theme.colors.warning.DEFAULT,
        },
      ]}
    >
      <View style={styles.content}>
        <Icon
          name={isOffline ? 'wifi-off' : 'alert-triangle'}
          size="sm"
          color="theme.colors.background.primary"
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: 'theme.colors.background.primary' }]}>
            {isOffline ? 'Offline Mode' : 'Slow Connection'}
          </Text>
          <Text style={[styles.description, { color: 'theme.colors.background.primary' }]}>
            {isOffline
              ? pendingSyncCount
                ? `${pendingSyncCount} items queued for sync`
                : 'Changes will sync when you reconnect'
              : 'Some features may be slower than usual'}
          </Text>
        </View>

        {isOffline && pendingSyncCount && pendingSyncCount > 0 && onSync && (
          <Pressable style={({ pressed }) => [styles.action, pressed && { opacity: 0.8 }]} onPress={onSync}
            accessibilityLabel="Sync button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Text style={[styles.actionText, { color: 'theme.colors.background.primary' }]}>
              Sync
            </Text>
          </Pressable>
        )}

        {onDismiss && (
          <Pressable style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.8 }]} onPress={onDismiss}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Icon
              name="x"
              size="sm"
              color="theme.colors.background.primary"
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

// Inline network indicator for inline usage
export const InlineNetworkIndicator: React.FC<{
  isOffline: boolean;
  size?: 'sm' | 'md';
}> = ({ isOffline, size = 'sm' }) => {
  const { theme } = useTheme();

  if (!isOffline) {return null;}

  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <View
      style={[
        styles.inline,
        {
          backgroundColor: theme.colors.error.DEFAULT + '20',
          padding: size === 'sm' ? 4 : 6,
        },
      ]}
    >
      <Icon
        name="wifi-off"
        size={size}
        color={theme.colors.error.DEFAULT}
      />
    </View>
  );
};

const styles = createSheet({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  action: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dismiss: {
    marginLeft: 8,
    padding: 4,
  },
  inline: {
    borderRadius: 4,
  },
});
