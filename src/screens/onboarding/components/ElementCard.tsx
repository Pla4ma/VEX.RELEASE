import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from '../../../icons/components/Icon';
import { ELEMENT_THEMES } from '../../../features/companion/types';

import type { ElementInfo } from './elementData';
import { ElementVisual } from './ElementVisual';
import { lightColors } from '@/theme/tokens/colors';

interface ElementCardProps {
  element: ElementInfo;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}

            const elementStyle_96 = {
  position: 'absolute',
  top: theme.spacing[3],
  right: theme.spacing[3],
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: themeColors.primary,
  justifyContent: 'center',
  alignItems: 'center',
};
export function ElementCard({
  element,
  isSelected,
  onSelect,
  delay: _delay,
}: ElementCardProps): React.ReactNode {
  const { theme } = useTheme();
  const themeColors = ELEMENT_THEMES[element.id];
  return (
    <View style={{ width: '48%' }}>
      <Pressable
        onPress={onSelect}
        style={{ width: '100%' }}
        accessibilityLabel={`${element.name} element`}
        accessibilityRole="button"
        accessibilityHint={`Select ${element.name} as your focus element`}
      >
        <View
          style={{
            padding: theme.spacing[4],
            borderRadius: 16,
            backgroundColor: isSelected
              ? `${themeColors.primary}20`
              : theme.colors.background.secondary,
            borderWidth: 2,
            borderColor: isSelected
              ? themeColors.primary
              : `${themeColors.primary}30`,
            minHeight: 160,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${themeColors.primary}25`,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing[3],
              boxShadow: '0px 0px isSelected ? 10 : 4px themeColors.glow / isSelected ? 0.5 : 0.2',
            }}
          >
            <ElementVisual element={element.id} color={themeColors.primary} />
          </View>

          <Text
            variant="h4"
            color={isSelected ? themeColors.primary : 'text.primary'}
            style={{ marginBottom: theme.spacing[1] }}
          >
            {element.name}
          </Text>

          <Text
            variant="caption"
            color="text.tertiary"
            style={{ marginBottom: theme.spacing[2] }}
          >
            {element.tagline}
          </Text>

          <View
            style={{
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              borderRadius: 8,
              backgroundColor: `${themeColors.glow}20`,
              alignSelf: 'flex-start',
            }}
          >
            <Text variant="caption" color={themeColors.glow} fontWeight="600">
              {element.effect}
            </Text>
          </View>

          {isSelected && (
            <View
              style={elementStyle_96}
            >
              <Icon name="check" size={14} color={lightColors.text.inverse} variant="solid" />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
