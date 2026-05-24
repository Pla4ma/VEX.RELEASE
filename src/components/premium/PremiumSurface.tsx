import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';
import { getPremiumCardStyle } from '../premiumStyles';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';

type SurfaceTone = 'default' | 'celebration' | 'info' | 'warning' | 'locked';

interface PremiumSurfaceProps {
  children?: React.ReactNode;
  title?: string;
  body?: string;
  eyebrow?: string;
  icon?: string;
  tone?: SurfaceTone;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

export function PremiumSurface({
  children,
  title,
  body,
  eyebrow,
  icon,
  tone = 'default',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: PremiumSurfaceProps): JSX.Element {
  const { theme } = useTheme();

  const toneStyle = {
    default: {
      borderColor: theme.colors.semantic.border,
      backgroundColor: theme.colors.semantic.surface,
    },
    celebration: {
      borderColor: theme.colors.primary[300],
      backgroundColor: theme.colors.surface.selected,
    },
    info: {
      borderColor: theme.colors.info.DEFAULT,
      backgroundColor: theme.colors.info[50],
    },
    warning: {
      borderColor: theme.colors.warning.DEFAULT,
      backgroundColor: theme.colors.warning[50],
    },
    locked: {
      borderColor: theme.colors.semantic.border,
      backgroundColor: theme.colors.semantic.surfaceGlass,
    },
  }[tone];

  return (
    <View
      style={[
        getPremiumCardStyle('large'),
        {
          borderWidth: 1,
          padding: theme.spacing[4],
          gap: theme.spacing[3],
          ...toneStyle,
        },
        style,
      ]}
    >
      {eyebrow || title || body ? (
        <View style={{ gap: theme.spacing[1] }}>
          {eyebrow ? (
            <Text variant="label" color={theme.colors.primary[500]}>
              {icon ? `${icon} ${eyebrow}` : eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Text variant="h4" color={theme.colors.text.primary}>
              {title}
            </Text>
          ) : null}
          {body ? (
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              {body}
            </Text>
          ) : null}
        </View>
      ) : null}

      {children}

      {actionLabel && onAction ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing[3], flexWrap: 'wrap' }}>
          <Button onPress={onAction}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{actionLabel}</Button>
          {secondaryActionLabel && onSecondaryAction ? (
            <Button variant="outline" onPress={onSecondaryAction}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              {secondaryActionLabel}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: SectionHeaderProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing[1] }}>
      {eyebrow ? (
        <Text variant="label" color={theme.colors.primary[500]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="h4" color={theme.colors.text.primary}>
        {title}
      </Text>
      {body ? (
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}

interface InlineStatusRowProps {
  label: string;
  value: string;
  tone?: SurfaceTone;
}

export function InlineStatusRow({
  label,
  value,
  tone = 'default',
}: InlineStatusRowProps): JSX.Element {
  const { theme } = useTheme();
  const accent =
    tone === 'celebration'
      ? theme.colors.primary[500]
      : tone === 'warning'
        ? theme.colors.warning[500]
        : tone === 'info'
          ? theme.colors.info[500]
          : theme.colors.text.secondary;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing[3],
        alignItems: 'center',
      }}
    >
      <Text variant="caption" color={theme.colors.text.secondary}>
        {label}
      </Text>
      <Text variant="bodySmall" color={accent} style={{ fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}
