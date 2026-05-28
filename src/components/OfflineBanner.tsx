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

import React, { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Box, Text } from "./primitives";
import { Icon } from "../icons";
import { launchColors } from "@theme/tokens/launch-colors";
import { useReducedMotion } from "@/hooks";

interface OfflineBannerProps {
  /** Custom message to display when offline */
  message?: string;
  /** Whether to show sync pending indicator */
  showSyncPending?: boolean;
  /** Number of pending operations to sync */
  pendingCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "Offline — changes will sync when connected",
  showSyncPending = true,
  pendingCount = 0,
}) => {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const { isReducedMotion } = useReducedMotion();

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);

      if (offline) {
        setWasOffline(true);
        if (isReducedMotion) {
          translateY.value = 0;
          opacity.value = 1;
        } else {
          translateY.value = withSpring(0, { damping: 15 });
          opacity.value = withTiming(1, { duration: 300 });
        }
      } else {
        if (isReducedMotion) {
          translateY.value = -100;
          opacity.value = 0;
        } else {
          translateY.value = withSpring(-100, { damping: 15 });
          opacity.value = withTiming(0, { duration: 300 });
        }
      }
    });

    // Initial check
    NetInfo["fetch"]().then((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (offline) {
        setWasOffline(true);
        translateY.value = 0;
        opacity.value = 1;
      }
    });

    return () => unsubscribe();
  }, [translateY, opacity, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Don't render if never been offline
  if (!wasOffline && !isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
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
          backgroundColor: isOffline
            ? launchColors.hex_fef3c7
            : launchColors.hex_dcfce7,
          borderBottomWidth: 1,
          borderBottomColor: isOffline
            ? launchColors.hex_fcd34d
            : launchColors.hex_86efac,
        }}
      >
        <Box flexDirection="row" alignItems="center" justifyContent="center">
          <Icon
            name={isOffline ? "wifi-off" : "wifi"}
            size={16}
            color={
              isOffline ? launchColors.hex_d97706 : launchColors.hex_16a34a
            }
          />
          <Text
            variant="caption"
            style={{
              marginLeft: 8,
              fontWeight: "600",
              color: isOffline
                ? launchColors.hex_92400e
                : launchColors.hex_166534,
            }}
          >
            {isOffline ? message : "Back online — syncing changes..."}
          </Text>

          {showSyncPending && pendingCount > 0 && isOffline && (
            <Box
              ml={10}
              px={8}
              py={2}
              borderRadius={10}
              style={{
                backgroundColor: launchColors.hex_d97706,
              }}
            >
              <Text
                style={{
                  color: launchColors.hex_fff,
                  fontSize: 11,
                  fontWeight: "700",
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
