import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Notifications Screen
 *
 * Grouped notifications list with type-based icons and colors.
 * Groups: Today, Yesterday, This Week, Earlier
 *
 * @phase 19.1
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme';
import { Box, Text, Button, Card } from '../../components/primitives';
import { Avatar } from '../../components/Avatar';
import { ErrorState } from '../../components/states';
import { Skeleton, SkeletonList } from '../../shared/ui/primitives';
import { createDebugger } from '../../utils/debug';
import { useAuthStore } from '../../store';
import { getSupabaseClient } from '../../config/supabase';
import type { ExtendedRootStackParams } from '../../navigation/types';

const debug = createDebugger('notifications:screen');

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

// Phase 19.1 notification types with distinct icons and colors
type NotificationType =
  | 'ACHIEVEMENT'
  | 'STREAK_RISK'
  | 'BOSS'
  | 'SQUAD'
  | 'RIVAL'
  | 'COACH'
  | 'REWARD'
  | 'LEVEL_UP';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  avatar?: string;
  actionText?: string;
  actionRoute?: keyof ExtendedRootStackParams;
  actionParams?: Record<string, unknown>;
}

// Notification type configuration with emojis and colors
const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  ACHIEVEMENT: { icon: '🏆', color: '#EAB308', bgColor: '#FEF9C3' },
  STREAK_RISK: { icon: '🔥', color: '#EF4444', bgColor: '#FEE2E2' },
  BOSS: { icon: '💀', color: '#A855F7', bgColor: '#F3E8FF' },
  SQUAD: { icon: '🛡️', color: '#3B82F6', bgColor: '#DBEAFE' },
  RIVAL: { icon: '⚔️', color: '#EF4444', bgColor: '#FEE2E2' },
  COACH: { icon: '💬', color: '#22C55E', bgColor: '#DCFCE7' },
  REWARD: { icon: '🎁', color: '#F59E0B', bgColor: '#FEF3C7' },
  LEVEL_UP: { icon: '⭐', color: '#8B5CF6', bgColor: '#EDE9FE' },
};

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

type NotificationListItem = {
  type: 'header' | 'notification';
  data?: Notification;
  title?: string;
  count?: number;
};

const FILTERS: Array<{ id: 'all' | NotificationType; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'ACHIEVEMENT', label: 'Achievements' },
  { id: 'STREAK_RISK', label: 'Streaks' },
  { id: 'BOSS', label: 'Bosses' },
  { id: 'RIVAL', label: 'Rivals' },
];

/**
 * Group notifications by time periods
 */
function groupNotificationsByTime(notifications: Notification[]): GroupedNotifications {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  return notifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.timestamp);
      const notificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (notificationDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDay >= thisWeekStart) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
      return groups;
    },
    { today: [], yesterday: [], thisWeek: [], earlier: [] } as GroupedNotifications
  );
}

/**
 * Convert database notification to UI notification
 */
function mapDbNotificationToUi(dbNotification: Record<string, unknown>): Notification | null {
  try {
    const type = String(dbNotification.type || dbNotification.notification_type || '').toUpperCase();
    const validTypes: NotificationType[] = ['ACHIEVEMENT', 'STREAK_RISK', 'BOSS', 'SQUAD', 'RIVAL', 'COACH', 'REWARD', 'LEVEL_UP'];
    const notificationType = validTypes.includes(type as NotificationType) ? (type as NotificationType) : 'COACH';

    return {
      id: String(dbNotification.id || crypto.randomUUID()),
      type: notificationType,
      title: String(dbNotification.title || ''),
      message: String(dbNotification.message || dbNotification.body || ''),
      timestamp: Number(dbNotification.created_at || dbNotification.timestamp || Date.now()),
      read: Boolean(dbNotification.read || dbNotification.is_read || false),
      avatar: dbNotification.avatar ? String(dbNotification.avatar) : undefined,
      actionText: dbNotification.action_text ? String(dbNotification.action_text) : undefined,
      actionRoute: dbNotification.action_route as keyof ExtendedRootStackParams | undefined,
      actionParams: dbNotification.action_params as Record<string, unknown> | undefined,
    };
  } catch (error) {
    debug.error('Failed to map notification', error as Error);
    return null;
  }
}

/**
 * Fetch notifications from repository
 */
async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await getSupabaseClient()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data || [])
    .map((item) => mapDbNotificationToUi(item as Record<string, unknown>))
    .filter((n): n is Notification => n !== null);
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    debug.warn('Failed to mark notification as read', error);
  }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    debug.warn('Failed to mark all notifications as read', error);
  }
}

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  // Fetch notifications
  const loadNotifications = useCallback(async (showLoading = true) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchNotifications(userId);
      setNotifications(data);
    } catch (err) {
      debug.error('Failed to load notifications', err as Error);
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) {return;}

    const subscription = getSupabaseClient()
      .channel('notifications-screen')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch on any change
          loadNotifications(false);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, loadNotifications]);

  const filteredNotifications = useMemo(() => {
    return activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByTime(filteredNotifications);
  }, [filteredNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    if (!userId) {return;}

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Persist to backend
    await markNotificationAsRead(userId, id);
  }, [userId]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) {return;}

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Persist to backend
    await markAllNotificationsAsRead(userId);
  }, [userId]);

  /**
   * Handle notification tap - navigate based on type and mark as read
   */
  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    const { type, actionRoute, actionParams } = notification;

    // Use explicit action route if available
    if (actionRoute) {
      try {
        navigation.navigate(String(actionRoute), actionParams ?? {});
        return;
      } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'ui-fallback', type: 'ui' });
        debug.warn('Navigation failed for route:', actionRoute);
      }
    }

    // Fallback navigation based on type
    switch (type) {
      case 'ACHIEVEMENT':
        navigation.navigate('Main', { screen: 'Profile', params: { tab: 'achievements' } });
        break;
      case 'STREAK_RISK':
        // Navigate to Home - AtRiskBanner will be visible
        navigation.navigate('Main', { screen: 'Home' });
        break;
      case 'BOSS':
        navigation.navigate('Boss' as never);
        break;
      case 'RIVAL':
        navigation.navigate('Rivals' as never);
        break;
      case 'SQUAD':
        navigation.navigate('Guild' as never);
        break;
      case 'COACH':
        navigation.navigate('AICoach' as never);
        break;
      case 'LEVEL_UP':
        navigation.navigate('Main', { screen: 'Progress' });
        break;
      case 'REWARD':
        // Stay on notifications screen - reward already shown
        break;
      default:
        break;
    }
  }, [handleMarkAsRead, navigation]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotifications(false);
  }, [loadNotifications]);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {return 'Just now';}
    if (minutes < 60) {return `${minutes}m ago`;}
    if (hours < 24) {return `${hours}h ago`;}
    if (days < 7) {return `${days}d ago`;}
    return date.toLocaleDateString();
  }, []);

  // Build flat list with section headers
  const listData = useMemo(() => {
    const items: NotificationListItem[] = [];

    if (groupedNotifications.today.length > 0) {
      items.push({ type: 'header', title: 'Today', count: groupedNotifications.today.length });
      groupedNotifications.today.forEach((n) => items.push({ type: 'notification', data: n }));
    }

    if (groupedNotifications.yesterday.length > 0) {
      items.push({ type: 'header', title: 'Yesterday', count: groupedNotifications.yesterday.length });
      groupedNotifications.yesterday.forEach((n) => items.push({ type: 'notification', data: n }));
    }

    if (groupedNotifications.thisWeek.length > 0) {
      items.push({ type: 'header', title: 'This Week', count: groupedNotifications.thisWeek.length });
      groupedNotifications.thisWeek.forEach((n) => items.push({ type: 'notification', data: n }));
    }

    if (groupedNotifications.earlier.length > 0) {
      items.push({ type: 'header', title: 'Earlier', count: groupedNotifications.earlier.length });
      groupedNotifications.earlier.forEach((n) => items.push({ type: 'notification', data: n }));
    }

    return items;
  }, [groupedNotifications]);

  // Loading State
  if (isLoading) {
    return (
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
        {/* Header Skeleton */}
        <Box px={20} pb={12} pt={insets.top + 16}>
          <Box mb={16}>
            <Skeleton width={150} height={28} variant="text" />
          </Box>
          {/* Filter Chips Skeleton */}
          <Box flexDirection="row" gap={8}>
            <Skeleton width={50} height={28} variant="rounded" />
            <Skeleton width={80} height={28} variant="rounded" />
            <Skeleton width={70} height={28} variant="rounded" />
            <Skeleton width={60} height={28} variant="rounded" />
          </Box>
        </Box>
        {/* List Skeleton */}
        <Box px={16} pt={12}>
          <SkeletonList count={6} />
        </Box>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
        <Box px={20} pb={12} pt={insets.top + 16}>
          <Text variant="h1">Notifications</Text>
        </Box>
        <ErrorState
          title="Failed to load notifications"
          description={error.message}
          onRetry={() => loadNotifications()}
          retryLabel="Try Again"
        />
      </Box>
    );
  }

  const renderHeader = () => (
    <Box px={20} pb={12} pt={insets.top + 16}>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={16}>
        <Text variant="h1">Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllAsRead}
  accessibilityLabel="Mark all read button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text variant="caption" style={{ color: theme.colors.primary[500] }}>
              Mark all read
            </Text>
          </Pressable>
        )}
      </Box>

      {/* Filter Chips */}
      <Box flexDirection="row" gap={8}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.id}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: activeFilter === filter.id ? theme.colors.primary[500] : theme.colors.background.secondary,
            }}
            onPress={() => setActiveFilter(filter.id)}
            accessibilityLabel={`Filter by ${filter.label}`}
            accessibilityRole="button"
            accessibilityHint={`Show only ${filter.label} notifications`}
            accessibilityState={{ selected: activeFilter === filter.id }}
          >
            <Text
              variant="caption"
              style={{
                fontWeight: '600',
                color: activeFilter === filter.id ? '#FFF' : theme.colors.text.secondary,
              }}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </Box>
    </Box>
  );

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = NOTIFICATION_CONFIG[item.type];

    return (
      <Card
        interactive
        style={{ opacity: item.read ? 0.8 : 1, backgroundColor: item.read ? undefined : '#EEF2FF20' }}
        size="md"
        onPress={() => handleNotificationPress(item)}
        accessibilityLabel={`${item.title}: ${item.message}`}
        accessibilityRole="button"
        accessibilityHint={`${item.read ? 'Read' : 'Unread'} notification. Tap to view details.`}
        accessibilityState={{ selected: !item.read }}
      >
        <Box flexDirection="row" alignItems="flex-start">
          {/* Icon or Avatar */}
          {item.avatar ? (
            <Avatar name={item.avatar} size="md" />
          ) : (
            <Box width={44} height={44} borderRadius={12} justifyContent="center" alignItems="center" style={{ backgroundColor: config.bgColor }}>
              <Text fontSize={20} color={config.color}>{config.icon}</Text>
            </Box>
          )}

          {/* Content */}
          <Box flex={1} ml={12}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <Text variant="body" style={{ fontWeight: '600', flex: 1 }}>
                {item.title}
              </Text>
              <Text variant="caption" color="text.tertiary">
                {formatTime(item.timestamp)}
              </Text>
            </Box>
            <Text variant="bodySmall" color="text.secondary" style={{ marginTop: 2 }}>
              {item.message}
            </Text>

            {/* Action Button */}
            {item.actionText && (
              <Button variant="ghost" size="sm" style={{ alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 0 }}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
                {item.actionText}
              </Button>
            )}
          </Box>

          {/* Unread Indicator */}
          {!item.read && (
            <Box width={8} height={8} borderRadius={4} ml={8} mt={6} style={{ backgroundColor: theme.colors.primary[500] }} />
          )}
        </Box>
      </Card>
    );
  };

  const renderSectionHeader = (title: string, count: number) => {
    if (count === 0) {return null;}
    return (
      <Box px={4} py={8}>
        <Text variant="caption" color="text.tertiary" style={{ fontWeight: '600', textTransform: 'uppercase' }}>
          {title}
        </Text>
      </Box>
    );
  };

  // Empty State
  if (notifications.length === 0) {
    return (
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
        {renderHeader()}
        <Box flex={1} alignItems="center" justifyContent="center" px={24}>
          <Text fontSize={48}>🔔</Text>
          <Text variant="h4" mt={4}>No notifications yet</Text>
          <Text variant="body" color="text.secondary" mt={2} textAlign="center">
            You'll hear when something happens. Check back later for achievements, streak alerts, and more.
          </Text>
        </Box>
      </Box>
    );
  }

  // Filtered Empty State
  if (filteredNotifications.length === 0) {
    return (
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
        {renderHeader()}
        <Box flex={1} alignItems="center" justifyContent="center" px={24}>
          <Text fontSize={48} color={theme.colors.text.tertiary}>⌕</Text>
          <Text variant="h4" style={{ marginTop: 16, textAlign: 'center' }}>
            No {activeFilter === 'all' ? '' : activeFilter} notifications
          </Text>
          <Text variant="body" color="text.secondary" style={{ marginTop: 8, textAlign: 'center' }}>
            Try selecting a different filter
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      {renderHeader()}

      <FlashList
        data={listData}
        keyExtractor={(item: NotificationListItem, index: number) =>
          item.type === 'header' ? `header-${item.title}-${index}` : item.data!.id
        }
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        estimatedItemSize={80}
        renderItem={({ item }: { item: NotificationListItem }) => {
          if (item.type === 'header') {
            return renderSectionHeader(item.title!, item.count!);
          }
          return renderNotification({ item: item.data! });
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

export default NotificationsScreen;
