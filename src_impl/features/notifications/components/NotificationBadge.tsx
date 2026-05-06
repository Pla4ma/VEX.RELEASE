/**
 * NotificationBadge Component
 *
 * Unread notification count badge for tab bar.
 * Updates via Supabase realtime subscription.
 *
 * @phase 13.2
 */

import React, { useState, useEffect } from "react";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { getSupabaseClient } from "../../../config/supabase";
import { createDebugger } from "../../../utils/debug";

const debug = createDebugger("notifications:badge");

interface NotificationBadgeProps {
  /** User ID */
  userId: string;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * Fetch unread notification count
 */
async function fetchUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await getSupabaseClient().from("notifications").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("read", false);

    if (error) {
      debug.warn("Failed to fetch unread count", error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    debug.error("Error fetching unread count", error instanceof Error ? error : undefined);
    return 0;
  }
}

/**
 * Notification Badge for Tab Bar
 */
export function NotificationBadge({ userId, size = "md" }: NotificationBadgeProps): JSX.Element | null {
  const [count, setCount] = useState(0);

  // Initial fetch
  useEffect(() => {
    const loadCount = async () => {
      const unreadCount = await fetchUnreadCount(userId);
      setCount(unreadCount);
    };

    loadCount();
  }, [userId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = getSupabaseClient()
      .channel("notifications-badge")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch count on any change
          fetchUnreadCount(userId).then(setCount);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count.toString();
  const isLargeNumber = count > 9;

  const sizeMap = {
    sm: {
      minWidth: isLargeNumber ? 18 : 16,
      height: 16,
      fontSize: 10,
      paddingHorizontal: isLargeNumber ? 4 : 0,
    },
    md: {
      minWidth: isLargeNumber ? 22 : 18,
      height: 18,
      fontSize: 12,
      paddingHorizontal: isLargeNumber ? 5 : 0,
    },
  };

  const s = sizeMap[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 12, stiffness: 200 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box
        minWidth={s.minWidth}
        height={s.height}
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        px={s.paddingHorizontal}
        style={{
          backgroundColor: "#EF4444",
          borderWidth: 2,
          borderColor: "#FFFFFF",
        }}
      >
        <Text fontSize={s.fontSize} color="white" fontWeight="800">
          {displayCount}
        </Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Compact dot badge for subtle notification indicator
 */
export function NotificationDot({ userId }: { userId: string }): JSX.Element | null {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const loadUnread = async () => {
      const count = await fetchUnreadCount(userId);
      setHasUnread(count > 0);
    };

    loadUnread();

    const subscription = getSupabaseClient()
      .channel("notifications-dot")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount(userId).then((count) => setHasUnread(count > 0));
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  if (!hasUnread) {
    return null;
  }

  return (
    <Box
      width={8}
      height={8}
      borderRadius="full"
      style={{
        backgroundColor: "#EF4444",
        borderWidth: 1,
        borderColor: "#FFFFFF",
      }}
    />
  );
}

/**
 * Hook for notification badge state
 */
export function useNotificationBadge(userId: string | undefined): {
  count: number;
  hasUnread: boolean;
} {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadCount = async () => {
      const unreadCount = await fetchUnreadCount(userId);
      setCount(unreadCount);
    };

    loadCount();

    const subscription = getSupabaseClient()
      .channel("notifications-hook")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount(userId).then(setCount);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { count, hasUnread: count > 0 };
}

export default NotificationBadge;
