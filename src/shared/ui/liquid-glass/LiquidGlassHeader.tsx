import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import { FocusCrystalAsset } from './FocusCrystalAsset';
import { liquidGlassSpacing } from './liquidGlassTokens';

type LiquidGlassHeaderProps = {
  eyebrow: string;
  title: string;
  body?: string;
  tone?: 'teal' | 'amber';
};

export function LiquidGlassHeader({
  eyebrow,
  title,
  body,
  tone = 'teal',
}: LiquidGlassHeaderProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: liquidGlassSpacing.cardCompact,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          variant="caption"
          style={{
            color: theme.colors.semantic.primary,
            fontWeight: '800',
            letterSpacing: 5,
            marginBottom: liquidGlassSpacing.hairlineInset,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
        <Text
          variant="h1"
          style={{ color: theme.colors.semantic.textPrimary }}
        >
          {title}
        </Text>
        {body ? (
          <Text
            variant="body"
            style={{
              color: theme.colors.semantic.textSecondary,
              marginTop: liquidGlassSpacing.hairlineInset,
            }}
          >
            {body}
          </Text>
        ) : null}
      </View>
      <FocusCrystalAsset tone={tone} size="md" />
    </View>
  );
}
