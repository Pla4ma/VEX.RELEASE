import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Pressable, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';



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

export const NotificationCategoryToggle: React.ComponentType<
  NotificationCategoryToggleProps
> = ({ item, value, onToggle }) => {
  const { theme: _theme } = useTheme();
  const iconColor = value
    ? vexFire.ember
    : vexFire.textMuted;

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
            ? vexFire.ember
            : vexFire.panel,
        }}
      >
        <VexIcon name={item.icon} size="md" color={iconColor} variant="solid" />
      </Box>
      <Box flex={1} ml={12}>
        <Text
          variant="body"
          style={{ fontWeight: '500', color: vexFire.cream }}
        >
          {item.title}
        </Text>
        <Text
          variant="caption"
          color={vexFire.textSecondary}
          style={{ marginTop: 2 }}
        >
          {item.description}
        </Text>
      </Box>
      <Switch
        value={value}
        onValueChange={() => onToggle(item.id)}
        trackColor={{
          false: vexFire.backgroundSoft,
          true: vexFire.ember + '80',
        }}
        thumbColor={value ? vexFire.ember : vexFire.cream}
        accessibilityLabel={`${item.title} notification toggle`}
      />
    </Pressable>
  );
};
