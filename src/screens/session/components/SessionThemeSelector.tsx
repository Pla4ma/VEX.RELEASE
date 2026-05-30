import React from "react";
import { Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { FocusRing } from "../../../components/FocusRing";
import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { SessionTheme } from "../../../features/themes/session-themes";
import { getSessionThemeById } from "../../../features/themes/session-themes";
import { buildPreviewGradient } from "../utils/session-setup";

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

  return (
    <Box px="lg" mt="lg">
      <Text variant="label" mb="sm">
        Theme
      </Text>
      <Text variant="caption" color="text.secondary" mb="md">
        Visual environments that make each session feel more personal.
      </Text>

      {themeQueryLoading ? (
        <Box
          p="md"
          bg="background.secondary"
          borderRadius="lg"
          style={{ borderWidth: 1, borderColor: theme.colors.border.light }}
        >
          <Text variant="body" color="text.secondary">
            Loading your themes...
          </Text>
        </Box>
      ) : themeQueryError ? (
        <Box
          p="md"
          bg="background.secondary"
          borderRadius="lg"
          style={{ borderWidth: 1, borderColor: theme.colors.error.DEFAULT }}
        >
          <Text variant="body" color="text.secondary" mb="sm">
            We could not load your themes right now.
          </Text>
          <Button
            variant="outline"
            onPress={themeQueryRetry}
            accessibilityLabel="Retry button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Retry
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
            renderItem={({ item }: { item: SessionTheme }) => {
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
                      backgroundColor: theme.colors.background.secondary,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? item.previewColor
                        : theme.colors.border.light,
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
                    <Text variant="caption" color="text.secondary" mt="xs">
                      {isOwned ? "Owned" : `${item.coinCost} coins`}
                    </Text>
                  </Box>
                </Pressable>
              );
            }}
          />
        </Box>
      )}

      <Box
        mt="md"
        p="md"
        borderRadius="lg"
        style={{
          backgroundColor:
            selectedTheme.backgroundTint === "transparent"
              ? theme.colors.background.secondary
              : selectedTheme.backgroundTint,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
      >
        <Text variant="label">{selectedTheme.name}</Text>
        <Text variant="caption" color="text.secondary" mt="xs">
          {selectedTheme.description}
        </Text>
      </Box>

      <Box mt="md">
        <Text variant="caption" color="text.tertiary" mb="sm">
          Preview
        </Text>
        <Box
          p="md"
          borderRadius="lg"
          alignItems="center"
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
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
