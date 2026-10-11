import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { SessionHistoryItem } from '../types';
import { semanticOpacity } from '../../../theme/tokens/opacity';
import { spacing } from '../../../theme/tokens/spacing';
import { sizing } from '../../../theme/tokens/sizing';
import {
  StandardHitSlops,
  getMinTouchTargetStyle,
} from '../../../utils/touchTarget';
import { formatDuration } from '../../../utils/format-duration';
import { vexFire } from '../../../theme/tokens/vex-fire';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryItem({
  entry,
  index,
  onPress,
}: {
  entry: SessionHistoryItem;
  index: number;
  onPress: (entry: SessionHistoryItem) => void;
}): React.ReactNode {
  const isDisabled = entry.summary === null;

  return (
    <Animated.View
      entering={isDisabled ? undefined : FadeInUp.delay(index * spacing[2])}
    >
      <Pressable
        accessibilityHint={
          isDisabled
            ? 'Completion story is not available for this synced record'
            : 'Opens the saved completion story for this session'
        }
        accessibilityLabel={`Open ${entry.title} from ${formatDate(entry.startedAtMs)}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        hitSlop={StandardHitSlops.TEXT_BUTTON}
        onPress={() => onPress(entry)}
        style={({ pressed }) => ({
          opacity:
            pressed || isDisabled
              ? semanticOpacity.disabled
              : semanticOpacity.hover,
        })}
      >
        <Box
          alignItems="center"
          borderRadius="lg"
          flexDirection="row"
          mb="sm"
          p="md"
          style={[getMinTouchTargetStyle(), { backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1 }]}
        >
          <Box
            alignItems="center"
            style={{ backgroundColor: vexFire.backgroundSoft }}
            borderRadius="full"
            height={sizing.avatar.lg}
            justifyContent="center"
            mr="md"
            width={sizing.avatar.lg}
          >
            <Text variant="h4" style={{ color: vexFire.ember }}>
              {entry.grade}
            </Text>
          </Box>
          <Box flex={1}>
            <Text variant="body" fontWeight="600" style={{ color: vexFire.cream }}>
              {entry.title}
            </Text>
            <Text variant="caption" style={{ color: vexFire.textSecondary }}>
              {formatDate(entry.startedAtMs)}
            </Text>
          </Box>
          <Box alignItems="flex-end">
            <Text variant="body" fontWeight="600" style={{ color: vexFire.cream }}>
              {formatDuration(entry.effectiveDurationSeconds)}
            </Text>
            <Text variant="caption" style={{ color: vexFire.textSecondary }}>
              {entry.finalScore} pts
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}
