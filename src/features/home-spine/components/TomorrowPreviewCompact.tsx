import React from 'react';
import { Pressable} from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';

import type { TomorrowPreviewProps } from './TomorrowPreview';

export function TomorrowPreviewCompact({
  streakWillContinue,
  events,
  onPress,
}: {
  streakWillContinue: boolean;
  events: TomorrowPreviewProps['events'];
  onPress: () => void;
}): React.ReactNode {
  const firstEvent = events[0];
  const eventMark = firstEvent
    ? firstEvent.type === 'double_xp'
      ? '2x'
      : firstEvent.type === 'squad_war'
        ? 'SW'
        : firstEvent.type === 'boss_rush'
          ? 'BR'
          : 'EV'
    : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Tomorrow preview"
      accessibilityRole="button"
      accessibilityHint="Double tap to view details"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        p="md"
        borderRadius="lg"
        bg="background.secondary"
      >
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16} />
          <Text variant="body" color="text.secondary">
            Tomorrow:
          </Text>
          <Text
            variant="body"
            color={streakWillContinue ? 'text.primary' : 'error.DEFAULT'}
            fontWeight="600"
          >
            {streakWillContinue ? 'Streak continues' : 'Streak at risk'}
          </Text>
          {eventMark && <Text fontSize={16}>{eventMark}</Text>}
        </Box>
        <Text variant="caption" color="text.tertiary">
          ›
        </Text>
      </Box>
    </Pressable>
  );
}
