import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import { LockGlyph, PrivacyShieldGlyph } from './AuthGlyphs';

export function LoginPrivacyStrip(): React.JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingTop: 6,
      }}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        <PrivacyShieldGlyph color={etherealText.body} />
        <Text fontSize={13} fontWeight="600" style={{ color: etherealText.body }}>
          Your focus. Your data.
        </Text>
      </View>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        <LockGlyph color={etherealText.body} />
        <Text fontSize={13} fontWeight="600" style={{ color: etherealText.body }}>
          Private by design.
        </Text>
      </View>
    </View>
  );
}
