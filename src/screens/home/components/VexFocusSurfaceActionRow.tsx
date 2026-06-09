import React from 'react';
import { View } from 'react-native';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface VexFocusSurfaceActionRowProps {
  ctaLabel: string;
  onPressPrimary: () => void;
}

function TimeCapsule(): JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: vexLightGlass.glass.fill,
        borderColor: vexLightGlass.glass.border,
        borderRadius: 999,
        borderWidth: 1.2,
        flexDirection: 'row',
        gap: 4,
        minHeight: 32,
        overflow: 'hidden',
        paddingHorizontal: 10,
        shadowColor: vexLightGlass.glass.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          backgroundColor: vexLightGlass.glass.innerHighlight,
          borderRadius: 999,
          height: 1.5,
          left: 9,
          position: 'absolute',
          right: 9,
          top: 1.5,
        }}
      />
      <Icon color={vexLightGlass.text.tertiary} name="clock" size="xs" variant="outline" />
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          fontWeight: '700',
        }}
      >
        ~30 min
      </Text>
    </View>
  );
}

export function VexFocusSurfaceActionRow({
  ctaLabel,
  onPressPrimary,
}: VexFocusSurfaceActionRowProps): JSX.Element {
  return (
    <>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 12,
          marginTop: 12,
          zIndex: 2,
        }}
      >
        <LiquidButton
          accessibilityHint="Opens the recommended next VEX action"
          label={ctaLabel}
          onPress={onPressPrimary}
          rightIcon={
            <Icon
              color={vexLightGlass.text.inverse}
              name="arrowRight"
              size="sm"
              variant="solid"
            />
          }
          size="md"
          variant="primary"
        />
        <TimeCapsule />
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 6,
          marginTop: 10,
          zIndex: 2,
        }}
      >
        <Icon color={vexLightGlass.text.secondary} name="chevronRight" size="xs" variant="solid" />
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            fontWeight: '500',
          }}
        >
          Next move is saved. Open the thread.
        </Text>
      </View>
    </>
  );
}

export default VexFocusSurfaceActionRow;
