import { vexFire } from "@/theme/tokens/vex-fire";
import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { FocusRing } from '../../../components/FocusRing';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { SessionTheme } from '../../../features/themes/session-themes';
import { getSessionThemeById } from '../../../features/themes/session-themes';
import { buildPreviewGradient } from '../utils/session-setup';

type SessionThemeSelectorProps = {
  onPressTheme: (theme: SessionTheme) => void;
  selectedDurationSeconds: number;
  selectedTheme: SessionTheme;
  selectedThemeId: string;
  themeQueryError: boolean;
  themeQueryLoading: boolean;
  themeQueryRetry: () => void;
  themes: SessionTheme[];
};

export function SessionThemeSelector({
  onPressTheme,
  selectedDurationSeconds,
  selectedTheme,
  selectedThemeId,
  themeQueryError,
  themeQueryLoading,
  themeQueryRetry,
  themes,
}: SessionThemeSelectorProps) {
  const { theme } = useTheme();
  const renderThemeItem = useCallback(
    ({ item }: { item: SessionTheme }) => {
      const isSelected = item.id === selectedThemeId;
      const isOwned = item.isOwned || item.isFree;

      return (
        <Pressable
          onPress={() => onPressTheme(item)}
          accessibilityLabel="Theme option"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Box
            width={132}
            mr="md"
            p="md"
            borderRadius={20}
            style={{
              backgroundColor: vexFire.panel,
              borderWidth: 1,
              borderColor: isSelected
                ? item.previewColor
                : vexFire.border,
            }}
          >
            <Box alignItems="center" mb="sm">
              <Box
                width={56}
                height={56}
                borderRadius={999}
                style={{ backgroundColor: item.previewColor }}
              />
            </Box>
            <Text variant="label">{item.name}</Text>
            <Text variant="caption" color={vexFire.textSecondary} mt="xs">
              {isOwned ? 'Owned' : `${item.coinCost} coins`}
            </Text>
          </Box>
        </Pressable>
      );
    },
    [selectedThemeId, onPressTheme],
  );

  return (
    <Box px="lg" mt="lg">
      <Text variant="label" mb="sm">
        Theme
      </Text>
      <Text variant="caption" color={vexFire.textSecondary} mb="md">
        Visual environments that make each session feel more personal.
      </Text>

      {themeQueryLoading ? (
        <Box
          p="md"
          bg="background.secondary"
          borderRadius="lg"
          style={{ borderWidth: 1, borderColor: vexFire.border }}
        >
          <Text variant="body" color={vexFire.textSecondary}>
            Loading your themes...
          </Text>
        </Box>
      ) : themeQueryError ? (
        <Box
          p="md"
          bg="background.secondary"
          borderRadius="lg"
          style={{ borderWidth: 1, borderColor: vexFire.danger }}
        >
          <Text variant="body" color={vexFire.textSecondary} mb="sm">
            We could not load your themes right now.
          </Text>
          <Button variant="outline"
            onPress={themeQueryRetry}
            accessibilityLabel="Retry loading themes"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Retry</VexText>
          </Button>
        </Box>
      ) : (
        <Box height={152}>
          <FlashList
            horizontal
            data={themes}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: SessionTheme) => item.id}
            contentContainerStyle={{ paddingRight: theme.spacing[5] }}
            estimatedItemSize={132}
            renderItem={renderThemeItem}
          />
        </Box>
      )}

      <Box
        mt="md"
        p="md"
        borderRadius="lg"
        style={{
          backgroundColor:
            selectedTheme.backgroundTint === 'transparent'
              ? vexFire.panel
              : selectedTheme.backgroundTint,
          borderWidth: 1,
          borderColor: vexFire.border,
        }}
      >
        <Text variant="label">{selectedTheme.name}</Text>
        <Text variant="caption" color={vexFire.textSecondary} mt="xs">
          {selectedTheme.description}
        </Text>
      </Box>

      <Box mt="md">
        <Text variant="caption" color={vexFire.textMuted} mb="sm">
          Preview
        </Text>
        <Box
          p="md"
          borderRadius="lg"
          alignItems="center"
          style={{
            backgroundColor: vexFire.panel,
            borderWidth: 1,
            borderColor: vexFire.border,
          }}
        >
          <FocusRing
            size={120}
            progressPercent={72}
            focusMinutes={Math.round(selectedDurationSeconds / 60)}
            gradientColors={buildPreviewGradient(
              getSessionThemeById(selectedThemeId).previewColor,
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}
