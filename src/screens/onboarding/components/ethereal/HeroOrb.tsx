/**
 * HeroOrb — persistent luminous orb that follows the user through
 * the onboarding journey. Static (motion stripped for performance).
 */
import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { etherealOrb } from '@/theme/tokens/ethereal-sky';

type HeroOrbProps = {
  size?: number;
  /** Horizontal anchor (0 = left, 1 = right). */
  anchorX?: number;
  /** Vertical anchor (0 = top, 1 = bottom). */
  anchorY?: number;
};

export function HeroOrb({
  size = 96,
  anchorX = 0.5,
  anchorY = 0.18,
}: HeroOrbProps): React.JSX.Element {
  const outerHaloStyle: ViewStyle = {
    position: 'absolute',
    width: size * 2.4,
    height: size * 2.4,
    borderRadius: size * 1.2,
    backgroundColor: etherealOrb.outerGlow,
  };

  const innerHaloStyle: ViewStyle = {
    position: 'absolute',
    width: size * 1.5,
    height: size * 1.5,
    borderRadius: size * 0.75,
    backgroundColor: etherealOrb.innerGlow,
  };

  const coreStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: etherealOrb.core,
    shadowColor: etherealOrb.ring,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: etherealOrb.ring,
  };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${anchorX * 100}%` as unknown as number,
        top: `${anchorY * 100}%` as unknown as number,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={outerHaloStyle} />
      <View style={innerHaloStyle} />
      <View style={coreStyle} />
    </View>
  );
}
