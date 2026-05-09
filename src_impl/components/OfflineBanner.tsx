/**
 * Offline Banner Component
 *
 * Phase 18.8 - Shows offline status to users with sync indicator.
 *
 * Features:
 * - Displays when app is offline
 * - Shows "Offline — changes will sync when connected" message
 * - Smooth slide-in/out animation
 * - Network state monitoring
 */

import React, { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';
import { Box, Text } from './primitives';
import { Icon } from '../icons';

interface OfflineBannerProps {
  /** Custom message to display when offline */
  message?: string;
  /** Whether to show sync pending indicator */
  showSyncPending?: boolean;
  /** Number of pending operations to sync */
  pendingCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = 'Offline — changes will sync when connected',
  showSyncPending = true,
  pendingCount = 0,
}) => {
  const { theme } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);

      if (offline) {
        setWasOffline(true);
        translateY.value = withSpring(0, { damping: 15 });
        opacity.value = withTiming(1, { duration: 300 });
      } else {
        translateY.value = withSpring(-100, { damping: 15 });
        opacity.value = withTiming(0, { duration: 300 });
      }
    });

    // Initial check
    NetInfo['fetch']().then((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (offline) {
        setWasOffline(true);
        translateY.value = 0;
        opacity.value = 1;
      }
    });

    return () => unsubscribe();
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Don't render if never been offline
  if (!wasOffline && !isOffline) {return null;}

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <Box
        px={16}
        py={12}
        style={{
          backgroundColor: isOffline ? '#FEF3C7' : '#DCFCE7',
          borderBottomWidth: 1,
          borderBottomColor: isOffline ? '#FCD34D' : '#86EFAC',
        }}
      >
        <Box flexDirection="row" alignItems="center" justifyContent="center">
          <Icon
            name={isOffline ? 'wifi-off' : 'wifi'}
            size={16}
            color={isOffline ? '#D97706' : '#16A34A'}
          />
          <Text
            variant="caption"
            style={{
              marginLeft: 8,
              fontWeight: '600',
              color: isOffline ? '#92400E' : '#166534',
            }}
          >
            {isOffline ? message : 'Back online — syncing changes...'}
          </Text>

          {showSyncPending && pendingCount > 0 && isOffline && (
            <Box
              ml={10}
              px={8}
              py={2}
              borderRadius={10}
              style={{
                backgroundColor: '#D97706',
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {pendingCount}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Animated.View>
  );
};

export default OfflineBanner;
