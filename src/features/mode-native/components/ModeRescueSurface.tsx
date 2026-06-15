import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useModeRescueSurface } from '../hooks';
import type { Lane } from '../../lane-engine/types';

interface ModeRescueSurfaceProps {
  lane: Lane | null | undefined;
  onStart: () => void;
  onDismiss: () => void;
}

export function ModeRescueSurface({
  lane,
  onStart,
  onDismiss,
}: ModeRescueSurfaceProps): React.ReactNode {
  const surface = useModeRescueSurface(lane);

  return (
    <Box
      mx="md"
      my="sm"
      p="md"
      borderRadius="lg"
      bg="background.elevated"
      borderWidth={1}
      borderColor="border.light"
      gap="sm"
    >
      <Text variant="label" color="text.primary" fontWeight="600">
        {surface.headline}
      </Text>

      <Text variant="caption" color="text.secondary">
        {surface.body}
      </Text>

      <Box flexDirection="row" gap="sm" mt="xs">
        <Pressable
          onPress={onStart}
          accessibilityLabel={surface.actionLabel}
          accessibilityRole="button"
          accessibilityHint={`Starts a ${surface.suggestedDurationMinutes}-minute rescue session`}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Box
            minHeight={44}
            borderRadius="md"
            bg="primary.500"
            justifyContent="center"
            alignItems="center"
          >
            <Text variant="label" color="text.inverse" fontWeight="600">
              {surface.actionLabel} ({surface.suggestedDurationMinutes}m)
            </Text>
          </Box>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          accessibilityLabel="Dismiss rescue suggestion"
          accessibilityRole="button"
          accessibilityHint="Hides the rescue banner"
          style={({ pressed }) => ({
            paddingHorizontal: 16,
            minHeight: 44,
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text variant="caption" color="text.tertiary">
            Not now
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
}

// ── ModeActiveIndicator ────────────────────────────────────────────────
import { useModeActiveIndicator } from '../hooks';

interface ModeActiveIndicatorProps {
  lane: Lane | null | undefined;
  completionPercentage: number;
}

export function ModeActiveIndicatorBar({
  lane,
  completionPercentage,
}: ModeActiveIndicatorProps): React.ReactNode {
  const indicator = useModeActiveIndicator(lane);

  return (
    <Box px="md" py="sm" gap="xs">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flexDirection="row" alignItems="center" gap="sm">
          {indicator.targetLabel ? (
            <Text variant="caption" color="text.secondary">
              {indicator.targetLabel}
            </Text>
          ) : null}
          <Text variant="caption" color="text.primary" fontWeight="600">
            {indicator.topLine}
          </Text>
        </Box>
        <Text variant="caption" color="text.tertiary">
          {Math.round(completionPercentage)}%
        </Text>
      </Box>

      {indicator.showProgressBar ? (
        <Box
          height={3}
          borderRadius="full"
          bg="background.secondary"
          overflow="hidden"
        >
          <Box
            height="100%"
            width={`${Math.min(100, completionPercentage)}%`}
            borderRadius="full"
            bg="primary.500"
          />
        </Box>
      ) : null}
    </Box>
  );
}
