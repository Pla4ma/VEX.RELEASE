/**
 * Offline Banner Component
 *
 * Persistent top banner when device is offline.
 * Dismissible but reappears after 30 seconds if still offline.
 *
 * Phase 7D.2 — Network error handling
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { capture } from '../../analytics';
import { FeatureEvents } from '../../analytics/analytics-events';
import { createSheet } from '@/shared/ui/create-sheet';

const DISMISS_DURATION = 30 * 1000; // 30 seconds

export interface OfflineBannerProps {
  /** Custom message to display */
  message?: string;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
  /** Callback when banner reappears */
  onReappear?: () => void;
}

export function OfflineBanner({
  message = "You're offline. Sessions will sync when reconnected.",
  onDismiss,
  onReappear,
}: OfflineBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissTimer, setDismissTimer] = useState<NodeJS.Timeout | null>(null);
  const [slideAnim] = useState(new Animated.Value(-100));

  // Subscribe to network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);

      // Log network changes
      if (!connected) {
        capture(FeatureEvents.NETWORK_STATUS_CHANGED, {
          is_connected: false,
          connection_type: state.type,
        });
      }
    });

    // Initial check
    NetInfo['fetch']().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
    };
  }, [dismissTimer]);

  // Handle banner visibility animation
  useEffect(() => {
    const shouldShow = !isConnected && !isDismissed;

    if (shouldShow) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, isDismissed, slideAnim]);

  // Reappear after dismiss duration if still offline
  useEffect(() => {
    if (isDismissed && !isConnected) {
      const timer = setTimeout(() => {
        setIsDismissed(false);
        onReappear?.();

        capture(FeatureEvents.BANNER_REAPPEARED, {
          banner_type: 'offline',
          reason: 'dismiss_timeout_while_offline',
        });
      }, DISMISS_DURATION);

      setDismissTimer(timer);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isDismissed, isConnected, onReappear]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();

    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start();

    capture(FeatureEvents.BANNER_DISMISSED, {
      banner_type: 'offline',
      duration_until_reappear_sec: DISMISS_DURATION / 1000,
    });
  }, [onDismiss, slideAnim]);

  // Don't render if connected
  if (isConnected === null || isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          paddingTop: insets.top + 8,
          backgroundColor: colors.error.DEFAULT,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📡</Text>
        </View>
        <Text
          variant="bodySmall"
          color="text.inverse"
          style={styles.message}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Pressable
          onPress={handleDismiss}
          style={styles.dismissButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}

        accessibilityLabel="✕ button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  message: {
    flex: 1,
    fontWeight: '600',
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default OfflineBanner;
