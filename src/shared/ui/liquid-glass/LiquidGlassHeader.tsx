import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { FocusCrystalAsset } from './FocusCrystalAsset';
import { liquidGlassSpacing } from './liquidGlassTokens';
import { vexFire } from '../../../theme/tokens/vex-fire';
export { liquidGlassSpacing };
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
            color: tone === 'amber' ? vexFire.amber : vexFire.ember,
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
          style={{ color: vexFire.cream }}
        >
          {title}
        </Text>
        {body ? (
          <Text
            variant="body"
            style={{
              color: vexFire.textSecondary,
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
