import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../theme";
import { Box, Text } from "../../components/primitives";
import { createDebugger } from "../../utils/debug";
import { useAuthStore } from "../../store";
import * as notificationService from "../../features/notifications/service";
import type { ExtendedRootStackParams } from "../../navigation/types";
import {
  routeNotificationAction,
  getAvailableNotificationFilters,
} from "../../navigation/notification-routing-core";
import { useFeatureAccess } from "../../features/liveops-config";
import { useOnboardingStore } from "../../features/onboarding/store";
import {
  NOTIFICATION_TYPE_TO_SAFE_ACTION,
  groupNotificationsByTime,
  isNotificationTypeFilterable,
  mapToNotificationAction,
} from "./NotificationScreenConfig";
import type {
  NotificationType,
  Notification,
  NotificationListItem,
} from "./NotificationScreenConfig";
import {
  NotificationLoadingState,
  NotificationErrorState,
  NotificationEmptyState,
  NotificationFilteredEmptyState,
} from "./NotificationStateViews";
import {
  NotificationFilterBar,
  NotificationCard,
  NotificationSectionHeader,
} from "./NotificationComponents";

const debug = createDebugger("notifications:screen");
type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const disclosure = useFeatureAccess();
  const motivationStyle = useOnboardingStore(
    (state) => state.explicitMotivationStyle,
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | NotificationType>(
    "all",
  );

  const availableFilterTypes = useMemo(() => {
    const safeFilters = getAvailableNotificationFilters(disclosure.features);
    const types: ("all" | NotificationType)[] = ["all"];
    safeFilters.forEach((safeType) => {
      const entry = Object.entries(NOTIFICATION_TYPE_TO_SAFE_ACTION).find(
        ([, v]) => v === safeType,
      );
      if (entry) {
        const notifType = entry[0] as NotificationType;
        if (isNotificationTypeFilterable(notifType, disclosure.features))
          types.push(notifType);
      }
    });
    return types;
  }, [disclosure.features]);

  const loadNotifications = useCallback(
    async (showLoading = true) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      if (showLoading) setIsLoading(true);
      setError(null);
      try {
        setNotifications(
          await notificationService.getNotificationCenterItems(userId),
        );
      } catch (err) {
        debug.error("Failed to load notifications", err as Error);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load notifications"),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId) return;
    return notificationService.subscribeToNotificationCenter(userId, () =>
      loadNotifications(false),
    );
  }, [userId, loadNotifications]);

  const filteredNotifications = useMemo(
    () =>
      activeFilter === "all"
        ? notifications
        : notifications.filter((n) => n.type === activeFilter),
    [notifications, activeFilter],
  );

  const grouped = useMemo(
    () => groupNotificationsByTime(filteredNotifications),
    [filteredNotifications],
  );
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      await notificationService.markNotificationRead(userId, id);
    },
    [userId],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllNotificationsRead(userId);
  }, [userId]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (!notification.read) await handleMarkAsRead(notification.id);
      const action = mapToNotificationAction(notification);
      const result = routeNotificationAction(
        navigation,
        action,
        disclosure.features,
        motivationStyle,
      );
      if (!result.success)
        debug.warn("Notification routing blocked:", result.error);
    },
    [handleMarkAsRead, navigation, disclosure.features, motivationStyle],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotifications(false);
  }, [loadNotifications]);

  const formatTime = useCallback((timestamp: number) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }, []);

  const listData = useMemo(() => {
    const items: NotificationListItem[] = [];
    const addGroup = (title: string, data: Notification[]) => {
      if (data.length > 0) {
        items.push({ type: "header", title, count: data.length });
        data.forEach((n) => items.push({ type: "notification", data: n }));
      }
    };
    addGroup("Today", grouped.today);
    addGroup("Yesterday", grouped.yesterday);
    addGroup("This Week", grouped.thisWeek);
    addGroup("Earlier", grouped.earlier);
    return items;
  }, [grouped]);

  const bg = theme.colors.background.primary;
  const inset = insets.top;

  if (isLoading)
    return <NotificationLoadingState insetsTop={inset} backgroundColor={bg} />;
  if (error)
    return (
      <NotificationErrorState
        insetsTop={inset}
        backgroundColor={bg}
        message={error.message}
        onRetry={() => loadNotifications()}
      />
    );

  const header = (
    <Box px={20} pb={12} pt={inset + 16}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={16}
      >
        <Text variant="h1">Notifications</Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={handleMarkAllAsRead}
            accessibilityLabel="Mark all read button"
            accessibilityRole="button"
            accessibilityHint="Marks all notifications as read"
          >
            <Text
              variant="caption"
              style={{ color: theme.colors.primary[500] }}
            >
              Mark all read
            </Text>
          </Pressable>
        )}
      </Box>
      <NotificationFilterBar
        availableFilterTypes={availableFilterTypes}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        primaryColor={theme.colors.primary[500]}
        secondaryBg={theme.colors.background.secondary}
        textSecondary={theme.colors.text.secondary}
      />
    </Box>
  );

  if (notifications.length === 0)
    return (
      <NotificationEmptyState backgroundColor={bg} headerElement={header} />
    );
  if (filteredNotifications.length === 0)
    return (
      <NotificationFilteredEmptyState
        backgroundColor={bg}
        headerElement={header}
        activeFilter={activeFilter}
      />
    );

  return (
    <Box flex={1} style={{ backgroundColor: bg }}>
      {header}
      <FlashList
        data={listData}
        keyExtractor={(item: NotificationListItem, index: number) =>
          item.type === "header"
            ? `header-${item.title}-${index}`
            : item.data!.id
        }
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        estimatedItemSize={80}
        renderItem={({ item }: { item: NotificationListItem }) => {
          if (item.type === "header")
            return (
              <NotificationSectionHeader
                title={item.title!}
                count={item.count!}
              />
            );
          return (
            <NotificationCard
              item={item.data!}
              onPress={handleNotificationPress}
              formatTime={formatTime}
              primaryColor={theme.colors.primary[500]}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      />
    </Box>
  );
};

export default withScreenErrorBoundary(NotificationsScreen, "Notifications");
