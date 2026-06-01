import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import {
  EVENT_ICONS,
  EVENT_LABELS,
  type DayData,
} from './weekly-calendar-types';

export function DayDetailsPopover({
  day,
  onClose,
}: {
  day: DayData;
  onClose: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const formattedDate = day.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg="background.elevated"
      borderWidth={1}
      borderColor="border.light"
      shadow
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="md"
      >
        <Text variant="h4" color="text.primary">
          {formattedDate}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Close day details"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text fontSize={20} color="text.tertiary">
            ✕
          </Text>
        </Pressable>
      </Box>
      <Box mb="md">
        <Text variant="caption" color="text.tertiary" mb="xs">
          SESSIONS
        </Text>
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={24}>
            {day.status === 'completed'
              ? 'Done'
              : day.status === 'partial'
                ? 'Partial'
                : day.status === 'missed'
                  ? 'Missed'
                  : 'Upcoming'}
          </Text>
          <Text variant="body" color="text.primary">
            {day.sessionsCompleted > 0
              ? `${day.sessionsCompleted} session${day.sessionsCompleted !== 1 ? 's' : ''}`
              : 'No sessions'}
          </Text>
        </Box>
      </Box>
      {day.events.length > 0 && (
        <Box mb="md">
          <Text variant="caption" color="text.tertiary" mb="xs">
            EVENTS
          </Text>
          {day.events.map((event, i) => (
            <Box
              key={i}
              flexDirection="row"
              alignItems="center"
              gap="sm"
              py="xs"
            >
              <Text fontSize={16}>{EVENT_ICONS[event]}</Text>
              <Text variant="body" color="text.primary">
                {EVENT_LABELS[event]}
              </Text>
            </Box>
          ))}
        </Box>
      )}
      {day.challengeExpiring && (
        <Box
          p="sm"
          borderRadius="lg"
          bg={`${theme.colors.warning[500]}15`}
          borderWidth={1}
          borderColor="warning.DEFAULT"
        >
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}></Text>
            <Text variant="bodySmall" color="warning.DEFAULT">
              Challenge ends: {day.challengeExpiring}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
