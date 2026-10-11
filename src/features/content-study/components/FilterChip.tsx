import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { buttonTap } from '../../../utils/haptics';
import { vexFire } from '../../../theme/tokens/vex-fire';


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
}: FilterChipProps): React.ReactNode {
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
        style={{
          borderWidth: 1,
          borderColor: isActive ? vexFire.ember : vexFire.border,
          backgroundColor: isActive ? vexFire.ember : vexFire.panel,
        }}
      >
        {icon && (
          <VexIcon
            name={icon}
            size="sm"
            color={
              isActive ? vexFire.background : vexFire.textSecondary
            }
            variant="solid"
          />
        )}
        <Text
          variant="caption"
          style={{
            color: isActive ? vexFire.background : vexFire.textSecondary,
            fontWeight: isActive ? '600' : '400',
          }}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
