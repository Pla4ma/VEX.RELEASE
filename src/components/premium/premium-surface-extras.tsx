import React from 'react';
import { View } from 'react-native';

import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

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
  return (
    <View style={{ gap: 4 }}>
      {eyebrow ? (
        <Text
          variant="label"
          style={{
            color: vexLightGlass.mint[500],
            fontSize: 13,
            fontWeight: '600',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        variant="h4"
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 20,
          fontWeight: '700',
          letterSpacing: -0.3,
          lineHeight: 28,
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          variant="bodySmall"
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 14,
            fontWeight: '400',
            letterSpacing: 0,
            lineHeight: 20,
          }}
        >
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
  const accent =
    tone === 'celebration'
      ? vexLightGlass.mint[500]
      : tone === 'warning'
        ? vexLightGlass.semantic.danger
        : tone === 'info'
          ? vexLightGlass.semantic.info
          : vexLightGlass.text.secondary;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <Text
        variant="caption"
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 13,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      <Text
        variant="bodySmall"
        style={{ color: accent, fontWeight: '700', fontSize: 14 }}
      >
        {value}
      </Text>
    </View>
  );
}
