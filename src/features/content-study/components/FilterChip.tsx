import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { buttonTap } from '../../../utils/haptics';
import { lightColors } from '@/theme/tokens/colors';


interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: string;
}

export function FilterChip({
  label,
  isActive,
  onPress,
  icon,
}: FilterChipProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => { buttonTap(); onPress(); }}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} filter${isActive ? ', active' : ''}`}
      accessibilityHint="Double tap to toggle filter"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        px="md"
        py="sm"
        borderRadius="full"
        bg={isActive ? 'primary.500' : 'background.tertiary'}
        style={{
          borderWidth: 1,
          borderColor: isActive ? 'transparent' : theme.colors.border.light,
        }}
      >
        {icon && (
          <Icon
            name={icon}
            size={14}
            color={
              isActive ? lightColors.text.inverse : theme.colors.text.secondary
            }
          />
        )}
        <Text
          variant="caption"
          style={{
            color: isActive
              ? lightColors.text.inverse
              : theme.colors.text.secondary,
            fontWeight: isActive ? '600' : '400',
          }}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
