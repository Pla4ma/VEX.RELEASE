import React from 'react';
import { Pressable, Switch } from 'react-native';
import type { Theme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import { Icon } from '../../icons';


export type SettingItemType = 'toggle' | 'link' | 'button' | 'select' | 'value';

export interface SettingItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: SettingItemType;
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export interface SettingGroup {
  title: string;
  items: SettingItem[];
}

interface SettingsSectionGroupProps {
  group: SettingGroup;
  theme: Theme;
}

export function SettingsSectionGroup({
  group,
  theme,
}: SettingsSectionGroupProps) {
  return (
    <Box key={group.title} mb={24}>
      <Text
        variant="caption"
        color="text.secondary"
        style={{
          marginLeft: 12,
          marginBottom: 8,
          fontWeight: '600',
          letterSpacing: 0.5,
        }}
      >
        {group.title.toUpperCase()}
      </Text>
      <Box
        borderRadius={12}
        style={{
          overflow: 'hidden',
          backgroundColor: theme.colors.surface.card,
        }}
      >
        {group.items.map((item, index) => (
          <React.Fragment key={item.id}>
            <SettingRow item={item} theme={theme} />
            {index < group.items.length - 1 && (
              <Box
                height={1}
                ml={64}
                style={{ backgroundColor: theme.colors.border.light }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

function SettingRow({ item, theme }: { item: SettingItem; theme: Theme }) {
  const iconColor = item.danger
    ? theme.colors.error.DEFAULT
    : theme.colors.primary[500];
  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
      onPress={item.type === 'toggle' ? undefined : item.onPress}
      disabled={item.type === 'toggle'}
      accessibilityLabel="Settings section"
      accessibilityRole="button"
      accessibilityHint="Double tap to change setting"
    >
      <Box
        width={36}
        height={36}
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        style={{ backgroundColor: theme.colors.background.secondary }}
      >
        <Icon name={item.icon} size={20} color={iconColor} />
      </Box>
      <Box flex={1} ml={12}>
        <Text
          variant="body"
          style={{
            fontWeight: '500',
            color: item.danger
              ? theme.colors.error.DEFAULT
              : theme.colors.text.primary,
          }}
        >
          {item.title}
        </Text>
        {item.subtitle && (
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginTop: 2 }}
          >
            {item.subtitle}
          </Text>
        )}
      </Box>
      <Box flexDirection="row" alignItems="center">
        {item.type === 'toggle' && (
          <Switch
            value={item.value as boolean}
            onValueChange={item.onToggle}
            trackColor={{
              false: theme.colors.background.tertiary,
              true: theme.colors.primary[500] + '80',
            }}
            thumbColor={
              item.value ? theme.colors.primary[500] : '#fff'
            }
          />
        )}
        {item.type === 'link' && (
          <Icon
            name="arrow-right"
            size={20}
            color={theme.colors.text.tertiary}
          />
        )}
        {item.type === 'select' && (
          <Box flexDirection="row" alignItems="center">
            <Text variant="caption" color="text.secondary">
              {item.value}
            </Text>
            <Icon
              name="arrow-right"
              size={16}
              color={theme.colors.text.tertiary}
              style={{ marginLeft: 4 }}
            />
          </Box>
        )}
        {item.type === 'value' && (
          <Text variant="caption" color="text.secondary">
            {item.value}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
