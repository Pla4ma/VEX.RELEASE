import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { Button } from './primitives/Button';
import { Text } from './primitives/Text';
import { Icon } from '../icons/components/Icon';

interface EmptyStateProps {
  iconName: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  accessibilityLabel?: string;
}

// Static-shape module-scope constants. Bake in only the literal CSS properties;
// theme-driven values stay inline so dark-mode tokens override at render time.
// Pattern: matches existing TEXT_STYLE / MAX_WIDTH_STYLE convention used elsewhere.
const MAX_WIDTH_STYLE = { maxWidth: 320 } as const;
// Static-shape hoist for the icon-wrapper View; theme-driven colors stay inline
// so they correctly override per theme. Was 8 inline props; now 2 live + 6 spread.
const ICON_WRAPPER_STYLE = {
  width: 72,
  height: 72,
  borderRadius: 36,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

export function EmptyState({
  iconName,
  title,
  body,
  actionLabel,
  onAction,
  accessibilityLabel,
}: EmptyStateProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing[5],
        paddingVertical: theme.spacing[8],
        gap: theme.spacing[3],
      }}
      accessibilityLabel={accessibilityLabel ?? `${title}: ${body}`}
      accessibilityRole="text"
    >
      <View
        style={{
          ...ICON_WRAPPER_STYLE,
          backgroundColor: theme.colors.semantic.vexCyanSoft,
          borderColor: theme.colors.semantic.border,
        }}
      >
        <Icon
          name={iconName}
          size={32}
          color={theme.colors.semantic.vexCyan}
          variant="outline"
        />
      </View>
      <View style={{ alignItems: 'center', gap: theme.spacing[2] }}>
        <Text
          variant="h4"
          fontSize={20}
          fontWeight="800"
          textAlign="center"
          color={theme.colors.text.primary}
        >
          {title}
        </Text>
        <Text
          variant="bodySmall"
          textAlign="center"
          color={theme.colors.text.secondary}
          style={MAX_WIDTH_STYLE}
        >
          {body}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Button
          accessibilityHint="Activates this empty state action"
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          variant="outline"
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
