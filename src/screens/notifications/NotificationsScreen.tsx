import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import type { ExtendedRootStackParams } from '../../navigation/types';
import {
  NotificationLoadingState,
  NotificationErrorState,
  NotificationEmptyState,
  NotificationFilteredEmptyState,
} from './NotificationStateViews';
import {
  NotificationFilterBar,
  NotificationCard,
  NotificationSectionHeader,
} from './NotificationComponents';
import { useNotificationsData } from './useNotificationsData';
import type { NotificationListItem } from './NotificationScreenConfig';

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const insets = useSafeAreaInsets();
  const {
    notifications,
    isLoading,
    isRefreshing,
    error,
    activeFilter,
    setActiveFilter,
    availableFilterTypes,
    unreadCount,
    listData,
    loadNotifications,
    handleMarkAllAsRead,
    handleNotificationPress,
    handleRefresh,
    formatTime,
  } = useNotificationsData();

  const handleOpenNotificationSettings = useCallback(() => {
    navigation.navigate('Settings', { screen: 'NotificationSettings' });
  }, [navigation]);

  const bg = theme.colors.background.primary;
  const inset = insets.top;

  if (isLoading)
    {return <NotificationLoadingState insetsTop={inset} backgroundColor={bg} />;}
  if (error)
    {return (
      <NotificationErrorState
        insetsTop={inset}
        backgroundColor={bg}
        message={error.message}
        onRetry={() => loadNotifications()}
      />
    );}

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
            accessibilityLabel="Mark all notifications as read"
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
    {return (
      <NotificationEmptyState backgroundColor={bg} headerElement={header} onAdjustSettings={handleOpenNotificationSettings} />
    );}
  if (listData.length === 0)
    {return (
      <NotificationFilteredEmptyState
        backgroundColor={bg}
        headerElement={header}
        activeFilter={activeFilter}
      />
    );}

  return (
    <Box flex={1} style={{ backgroundColor: bg }}>
      {header}
      <FlashList
        data={listData}
        keyExtractor={(item: NotificationListItem, index: number) =>
          item.type === 'header'
            ? `header-${item.title}-${index}`
            : item.data!.id
        }
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        estimatedItemSize={80}
        renderItem={({ item }: { item: NotificationListItem }) => {
          if (item.type === 'header')
            {return (
              <NotificationSectionHeader
                title={item.title!}
                count={item.count!}
              />
            );}
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

export default withScreenErrorBoundary(NotificationsScreen, 'Notifications');
