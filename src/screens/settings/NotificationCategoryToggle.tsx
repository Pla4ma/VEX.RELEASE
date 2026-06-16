import React from 'react';
import { Pressable, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { lightColors } from '@/theme/tokens/colors';


interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface NotificationCategoryToggleProps {
  item: NotificationItem;
  value: boolean;
  onToggle: (id: string) => void;
}

export const NotificationCategoryToggle: React.FC<
  NotificationCategoryToggleProps
> = ({ item, value, onToggle }) => {
  const { theme } = useTheme();
  const iconColor = value
    ? theme.colors.primary[500]
    : theme.colors.text.tertiary;

  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
      onPress={() => onToggle(item.id)}
      accessibilityLabel={`${item.title} notifications`}
      accessibilityRole="button"
      accessibilityHint={`Toggle ${item.title.toLowerCase()} notifications`}
    >
      <Box
        width={40}
        height={40}
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: value
            ? theme.colors.primary[50]
            : theme.colors.background.secondary,
        }}
      >
        <Icon name={item.icon} size={20} color={iconColor} />
      </Box>
      <Box flex={1} ml={12}>
        <Text
          variant="body"
          style={{ fontWeight: '500', color: theme.colors.text.primary }}
        >
          {item.title}
        </Text>
        <Text
          variant="caption"
          color="text.secondary"
          style={{ marginTop: 2 }}
        >
          {item.description}
        </Text>
      </Box>
      <Switch
        value={value}
        onValueChange={() => onToggle(item.id)}
        trackColor={{
          false: theme.colors.background.tertiary,
          true: theme.colors.primary[500] + '80',
        }}
        thumbColor={value ? theme.colors.primary[500] : lightColors.text.inverse}
        accessibilityLabel={`${item.title} notification toggle`}
      />
    </Pressable>
  );
};
