import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';

import type { ToggleKey } from './privacy-toggle-data';

interface ToggleRowData {
  key: ToggleKey;
  title: string;
  description: string;
  icon: string;
}

interface PrivacyToggleRowProps {
  row: ToggleRowData;
  value: boolean;
  disabled?: boolean;
  onToggle: (key: ToggleKey) => void;
}

export const PrivacyToggleRow: React.ComponentType<PrivacyToggleRowProps> = ({
  row,
  value,
  disabled = false,
  onToggle,
}) => {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityHint={`Toggles ${row.title.toLowerCase()}.`}
      accessibilityLabel={row.title}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onToggle(row.key)}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 56,
        paddingVertical: theme.spacing[2],
      }}
    >
      <VexIcon name={row.icon} size="md" color={vexFire.ember} variant="solid" />
      <Box
        flex={1}
        style={{
          marginLeft: theme.spacing[3],
          marginRight: theme.spacing[3],
        }}
      >
        <Text variant="body" color={vexFire.cream}>
          {row.title}
        </Text>
        <Text variant="caption" color={vexFire.textSecondary}>
          {row.description}
        </Text>
      </Box>
      <Switch value={value} disabled={disabled} onValueChange={() => onToggle(row.key)} accessibilityLabel={`${row.title} toggle`} />
    </Pressable>
  );
};
