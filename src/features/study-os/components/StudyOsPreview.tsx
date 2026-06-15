/**
 * StudyOsPreview Component
 *
 * Day 0 tiny Study OS preview for student lane.
 * Shows "Start first study block" CTA — no upload/import/AI.
 */
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { buttonTap } from '../../../utils/haptics';
import type { StudyOsHomeSurface } from '../schemas';

export interface StudyOsPreviewProps {
  surface: StudyOsHomeSurface;
  onStartBlock: () => void;
  isLoading?: boolean;
}

export function StudyOsPreview({
  surface,
  onStartBlock,
  isLoading = false,
}: StudyOsPreviewProps): React.ReactNode {
  const { theme } = useTheme();
  if (surface.hidden) {return <></>;}

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <Pressable
        onPress={() => {
          buttonTap();
          onStartBlock();
        }}
        disabled={isLoading}
        accessibilityLabel={surface.ctaLabel}
        accessibilityRole="button"
        accessibilityHint="Starts your first study block"
      >
        <Box
          p={4}
          borderRadius="lg"
          style={{
            backgroundColor: theme.colors.surface.card,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
          }}
        >
          <Text variant="heading4" color="text.primary">
            {surface.title}
          </Text>
          <Text variant="body" color="text.secondary" mt={1}>
            One focused block to start your study path.
          </Text>
          <Box
            mt={3}
            p={3}
            borderRadius="md"
            flexDirection="row"
            justifyContent="center"
            style={{ backgroundColor: theme.colors.semantic.primarySoft }}
          >
            <Text variant="button" color="semantic.primary">
              {surface.ctaLabel}
            </Text>
          </Box>
          {surface.riskLabel ? (
            <Text variant="caption" color="warning.500" mt={2}>
              {surface.riskLabel}
            </Text>
          ) : null}
          {surface.offlineFallback ? (
            <Text variant="caption" color="info.500" mt={2}>
              {surface.offlineFallback}
            </Text>
          ) : null}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
