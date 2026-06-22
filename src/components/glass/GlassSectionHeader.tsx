import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

interface GlassSectionHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
  trailing?: ReactNode;
}

export function GlassSectionHeader({
  eyebrow,
  title,
  body,
  trailing,
}: GlassSectionHeaderProps): React.ReactNode {
  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow ? (
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        {body ? (
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {body}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

export { GlassSectionHeader }