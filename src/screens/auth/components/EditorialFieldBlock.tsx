const microLabelStyle: TextStyle = {
    color: rgbaColors.rgb_224_184_112_0_85,
    fontSize: 9,
    fontFamily: SERIF_STACK,
    fontWeight: '500',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
  };

import React from 'react';
import { Platform, View, type TextStyle } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

const SERIF_STACK = Platform.select({
  ios: 'New York',
  android: 'Noto Serif',
  default: 'Georgia',
}) ?? 'Georgia';

/**
 * EditorialFieldBlock — a serif micro-label (small caps, wide letter-spacing,
 * with a leading hairline) above an input. Optionally renders an italic
 * error message in a warm coral. Wraps any form input as children.
 */
export function EditorialFieldBlock({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const errorStyle: TextStyle = {
    color: lightColors.semantic.brandCoral,
    fontSize: 11,
    fontFamily: SERIF_STACK,
    fontStyle: 'italic',
    marginTop: 2,
    letterSpacing: 0.3,
  };
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 12, height: 1, backgroundColor: rgbaColors.rgb_224_184_112_0_55 }} />
        <Text style={microLabelStyle}>{label}</Text>
      </View>
      {children}
      {error ? <Text style={errorStyle}>{error}</Text> : null}
    </View>
  );
}