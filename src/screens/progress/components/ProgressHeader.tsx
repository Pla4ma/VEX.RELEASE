import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassSettingsButton } from '../../home/components/GlassSettingsButton';
import { VexBrandPill } from '../../home/components/VexBrandPill';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface ProgressHeaderProps {
  onOpenSettings: () => void;
}

export function ProgressHeader({ onOpenSettings }: ProgressHeaderProps): JSX.Element {
  return (
    <>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 18,
          width: '100%',
        }}
      >
        <VexBrandPill />
        <GlassSettingsButton onPress={onOpenSettings} />
      </View>
      <View style={{ gap: 4, marginBottom: 8 }}>
        <Text
          style={{
            color: vexLightGlass.mint[700],
            fontSize: 18,
            fontWeight: '500',
            letterSpacing: -0.2,
          }}
        >
          Progress
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 21,
            fontWeight: '700',
            letterSpacing: -0.5,
            lineHeight: 26,
          }}
        >
          Your focus record.
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            lineHeight: 18,
            marginTop: 4,
          }}
        >
          Focus sessions, study work, and coaching signals in one place.
        </Text>
      </View>
    </>
  );
}

export default ProgressHeader;
