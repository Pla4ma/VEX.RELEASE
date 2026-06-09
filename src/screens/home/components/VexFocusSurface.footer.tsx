import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Icon } from '../../../icons';

interface VexFocusFooterProps {
  ctaLabel: string;
  onPressPrimary: () => void;
}

export function VexFocusFooter({ ctaLabel, onPressPrimary }: VexFocusFooterProps): JSX.Element {
  return (
    <>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14, zIndex: 2 }}>
        <View style={{ maxWidth: 220 }}>
          <LiquidButton
            accessibilityHint="Opens the recommended next VEX action"
            label={ctaLabel}
            onPress={onPressPrimary}
            rightIcon={<Icon color="#FFFFFF" name="arrowRight" size="sm" variant="solid" />}
            size="md"
            variant="primary"
          />
        </View>
        <Text style={{ color: '#6B8F85', fontSize: 13, fontWeight: '600' }}>~30 min</Text>
      </View>

      <View style={{
        alignItems: 'center', flexDirection: 'row', gap: 6,
        marginTop: 10, zIndex: 2,
      }}>
        <Icon color="#6B8F85" name="chevronRight" size="xs" variant="solid" />
        <Text style={{ color: '#6B8F85', fontSize: 12, fontWeight: '500' }}>
          Next move is saved. Open the thread.
        </Text>
      </View>
    </>
  );
}
