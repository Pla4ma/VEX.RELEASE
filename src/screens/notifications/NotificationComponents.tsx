import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text, Button, Card } from '../../components/primitives';
import { Avatar } from '../../components/Avatar';
import { lightColors } from '@/theme/tokens/colors';

import type {
  Notification,
  NotificationType,
} from './NotificationScreenConfig';
import { NOTIFICATION_CONFIG, FILTER_LABELS } from './NotificationScreenConfig';

export function NotificationFilterBar({
  availableFilterTypes,
  activeFilter,
  onFilterChange,
  primaryColor,
  secondaryBg,
  textSecondary,
}: {
  availableFilterTypes: ('all' | NotificationType)[];
  activeFilter: 'all' | NotificationType;
  onFilterChange: (f: 'all' | NotificationType) => void;
  primaryColor: string;
  secondaryBg: string;
  textSecondary: string;
}): JSX.Element {
  return (
    <Box flexDirection="row" gap={8}>
      {availableFilterTypes.map((filter) => (
        <Pressable
          key={filter}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor:
              activeFilter === filter ? primaryColor : secondaryBg,
          }}
          onPress={() => onFilterChange(filter)}
          accessibilityLabel={`Filter by ${FILTER_LABELS[filter] ?? filter}`}
          accessibilityRole="button"
          accessibilityHint={`Show only ${FILTER_LABELS[filter] ?? filter} notifications`}
          accessibilityState={{ selected: activeFilter === filter }}
        >
          <Text
            variant="caption"
            style={{
              fontWeight: '600',
              color:
                activeFilter === filter ? lightColors.text.inverse : textSecondary,
            }}
          >
            {FILTER_LABELS[filter] ?? filter}
          </Text>
        </Pressable>
      ))}
    </Box>
  );
}

export function NotificationCard({
  item,
  onPress,
  formatTime,
  primaryColor,
}: {
  item: Notification;
  onPress: (item: Notification) => void;
  formatTime: (ts: number) => string;
  primaryColor: string;
}): JSX.Element {
  const config = NOTIFICATION_CONFIG[item.type];
  return (
    <Card
      interactive
      style={{
        opacity: item.read ? 0.8 : 1,
        backgroundColor: item.read ? undefined : lightColors.surface.selected + '20',
      }}
      size="md"
      onPress={() => onPress(item)}
      accessibilityLabel={`${item.title}: ${item.message}`}
      accessibilityRole="button"
      accessibilityHint={`${item.read ? 'Read' : 'Unread'} notification. Tap to view details.`}
      accessibilityState={{ selected: !item.read }}
    >
      <Box flexDirection="row" alignItems="flex-start">
        {item.avatar ? (
          <Avatar name={item.avatar} size="md" />
        ) : (
          <Box
            width={44}
            height={44}
            borderRadius={12}
            justifyContent="center"
            alignItems="center"
            style={{ backgroundColor: config.bgColor }}
          >
            <Text fontSize={20} color={config.color}>
              {config.icon}
            </Text>
          </Box>
        )}
        <Box flex={1} ml={12}>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Text variant="body" style={{ fontWeight: '600', flex: 1 }}>
              {item.title}
            </Text>
            <Text variant="caption" color="text.tertiary">
              {formatTime(item.timestamp)}
            </Text>
          </Box>
          <Text
            variant="bodySmall"
            color="text.secondary"
            style={{ marginTop: 2 }}
          >
            {item.message}
          </Text>
          {item.actionText && (
            <Button
              variant="ghost"
              size="sm"
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                paddingHorizontal: 0,
              }}
              accessibilityLabel="Perform action"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              {item.actionText}
            </Button>
          )}
        </Box>
        {!item.read && (
          <Box
            width={8}
            height={8}
            borderRadius={4}
            ml={8}
            mt={6}
            style={{ backgroundColor: primaryColor }}
          />
        )}
      </Box>
    </Card>
  );
}

export function NotificationSectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}): JSX.Element | null {
  if (count === 0) {return null;}
  return (
    <Box px={4} py={8}>
      <Text
        variant="caption"
        color="text.tertiary"
        style={{ fontWeight: '600', textTransform: 'uppercase' }}
      >
        {title}
      </Text>
    </Box>
  );
}
