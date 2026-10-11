import React from 'react';
import { Pressable, Switch } from 'react-native';
import type { Theme } from '../../theme';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { vexFire } from '../../theme/tokens/vex-fire';


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
        style={{
          color: vexFire.textSecondary,
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
          backgroundColor: vexFire.panel,
          borderColor: vexFire.border,
          borderWidth: 1,
        }}
      >
        {group.items.map((item, index) => (
          <React.Fragment key={item.id}>
            <SettingRow item={item} theme={theme} />
            {index < group.items.length - 1 && (
              <Box
                height={1}
                ml={64}
                style={{ backgroundColor: vexFire.line }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

function SettingRow({ item, theme: _theme }: { item: SettingItem; theme: Theme }) {
  const iconColor = item.danger
    ? vexFire.danger
    : vexFire.ember;
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: pressed ? vexFire.backgroundSoft : 'transparent',
      })}
      onPress={item.type === 'toggle' ? undefined : item.onPress}
      disabled={item.type === 'toggle'}
      accessibilityLabel={item.title}
      accessibilityRole="button"
      accessibilityHint="Double tap to change setting"
    >
      <Box
        width={36}
        height={36}
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        style={{ backgroundColor: vexFire.backgroundSoft }}
      >
        <VexIcon name={item.icon} size="md" color={iconColor} variant="solid" />
      </Box>
      <Box flex={1} ml={12}>
        <Text
          variant="body"
          style={{
            fontWeight: '500',
            color: item.danger
              ? vexFire.danger
              : vexFire.cream,
          }}
        >
          {item.title}
        </Text>
        {item.subtitle && (
          <Text
            variant="caption"
            style={{ color: vexFire.textSecondary, marginTop: 2 }}
          >
            {item.subtitle}
          </Text>
        )}
      </Box>
      <Box flexDirection="row" alignItems="center">
        {item.type === 'toggle' && (
          <Switch
            value={Boolean(item.value)}
            onValueChange={item.onToggle}
            trackColor={{
              false: vexFire.backgroundSoft,
              true: vexFire.ember,
            }}
            thumbColor={item.value ? vexFire.ember : vexFire.cream}
          />
        )}
        {item.type === 'link' && (
          <VexIcon
            name="arrow-right"
            size="md"
            color={vexFire.textMuted}
          />
        )}
        {item.type === 'select' && (
          <Box flexDirection="row" alignItems="center">
            <Text variant="caption" color={vexFire.textSecondary}>
              {item.value}
            </Text>
            <VexIcon
              name="arrow-right"
              size="sm"
              color={vexFire.textMuted}
            />
          </Box>
        )}
        {item.type === 'value' && (
          <Text variant="caption" color={vexFire.textSecondary}>
            {item.value}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
