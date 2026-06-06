/**
 * Auth glyphs — small icon components used by EtherealAuthButtons.
 * Pure presentation; no animation, no state.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealText } from '@/theme/tokens/ethereal-sky';

const GLYPH_SIZE = 18;

export function AppleGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <View
      style={{
        width: GLYPH_SIZE,
        height: GLYPH_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 18, color, fontWeight: '800' }}>{'\uF8FF'}</Text>
    </View>
  );
}

export function GoogleGlyph(): React.JSX.Element {
  return (
    <View
      style={{
        width: GLYPH_SIZE,
        height: GLYPH_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800' }}>
        <Text style={{ color: etherealText.googleBlue }}>G</Text>
      </Text>
    </View>
  );
}

export function EnvelopeGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <View
      style={{
        width: GLYPH_SIZE,
        height: GLYPH_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 14, color, fontWeight: '700' }}>{'\u2709'}</Text>
    </View>
  );
}
