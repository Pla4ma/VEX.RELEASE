import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { TomorrowPreviewProps } from './TomorrowPreview';

function getEventEmoji(events: TomorrowPreviewProps['events']): string | null {
  if (events.length === 0) {
    return null;
  }
  const first = events[0];
  if (!first) {
    return null;
  }
  if (first.type === 'double_xp') {
    return '🔥';
  }
  if (first.type === 'squad_war') {
    return '⚔️';
  }
  if (first.type === 'boss_rush') {
    return '👹';
  }
  return '🌙';
}

export function TomorrowPreviewCompact({
  streakWillContinue,
  events,
  onPress,
}: {
  streakWillContinue: boolean;
  events: TomorrowPreviewProps['events'];
  onPress: () => void;
}): JSX.Element {
  const eventEmoji = getEventEmoji(events);
  return (
    <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" p="md" borderRadius="lg" bg="background.secondary">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16}>➡️</Text>
          <Text variant="body" color="text.secondary">Tomorrow:</Text>
          <Text variant="body" color={streakWillContinue ? 'text.primary' : 'error.DEFAULT'} fontWeight="600">
            {streakWillContinue ? '🔥 Streak continues' : '⚠️ Streak at risk'}
          </Text>
          {eventEmoji ? <Text fontSize={16}>{eventEmoji}</Text> : null}
        </Box>
        <Text variant="caption" color="text.tertiary">›</Text>
      </Box>
    </Pressable>
  );
}
