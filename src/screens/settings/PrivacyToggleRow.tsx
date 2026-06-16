import React from 'react';
import { Pressable, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';

type ToggleKey = 'activitySharing' | 'squadFeed' | 'analytics';

interface ToggleRowData {
  key: ToggleKey;
  title: string;
  description: string;
  icon: string;
}

interface PrivacyToggleRowProps {
  row: ToggleRowData;
  value: boolean;
  onToggle: (key: ToggleKey) => void;
}

export const PrivacyToggleRow: React.FC<PrivacyToggleRowProps> = ({
  row,
  value,
  onToggle,
}) => {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityHint={`Toggles ${row.title.toLowerCase()}.`}
      accessibilityLabel={row.title}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onToggle(row.key)}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 56,
        paddingVertical: theme.spacing[2],
      }}
    >
      <Icon name={row.icon} size={20} color={theme.colors.primary[500]} />
      <Box
        flex={1}
        style={{
          marginLeft: theme.spacing[3],
          marginRight: theme.spacing[3],
        }}
      >
        <Text variant="body" color="text.primary">
          {row.title}
        </Text>
        <Text variant="caption" color="text.secondary">
          {row.description}
        </Text>
      </Box>
      <Switch value={value} onValueChange={() => onToggle(row.key)} accessibilityLabel={`${row.title} toggle`} />
    </Pressable>
  );
};
