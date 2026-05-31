import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme';
import { Text } from '../primitives/Text';

type SurfaceTone = 'default' | 'celebration' | 'info' | 'warning' | 'locked';

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
