import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { SessionGlyph, type SessionGlyphName } from '../../../shared/ui/liquid-glass/SessionGlyphs';
import { isSessionLessMode } from '../../../session/modes';
import type { ModeCard } from './ModeSelector.data';

interface ModeCardItemProps {
  card: ModeCard;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  onPress: () => void;
}

export function ModeCardItem({
  card,
  isSelected,
  isDisabled,
  disabledReason,
  onPress,
}: ModeCardItemProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Pressable
      key={card.mode}
      accessibilityHint={disabledReason ?? `Selects ${card.name} mode`}
      accessibilityLabel={`${card.name} mode`}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
    >
      <Box
        minHeight={76}
        px="md"
        py="md"
        bg={isSelected ? 'surface.selected' : 'semantic.surfaceGlass'}
        borderRadius={24}
        style={{
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected
            ? theme.colors.semantic.secondary
            : theme.colors.semantic.liquidGlassBorder,
          opacity: isDisabled ? 0.55 : 1,
          shadowColor: theme.colors.semantic.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isSelected ? 0.18 : 0.08,
          shadowRadius: isSelected ? 16 : 10,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box
            width={56}
            height={56}
            borderRadius={20}
            bg="semantic.surfaceElevated"
            alignItems="center"
            justifyContent="center"
          >
            <SessionGlyph name={card.glyph} size={44} />
          </Box>
          <Box flex={1}>
            <Text variant="label" color="text.primary">
              {card.name}
            </Text>
            <Text
              variant="caption"
              color="text.secondary"
              style={{ lineHeight: 19 }}
            >
              {disabledReason ?? card.description}
            </Text>
          </Box>
          <Box
            alignItems="center"
            bg="semantic.backgroundElevated"
            borderRadius={999}
            px="sm"
            py="xs"
            style={{ borderColor: theme.colors.border.light, borderWidth: 1 }}
          >
            <Text variant="caption" color="text.secondary">
              {isSessionLessMode(card.mode) ? 'No timer' : 'Timer'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}
