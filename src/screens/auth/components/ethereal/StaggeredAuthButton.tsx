/**
 * StaggeredAuthButton — internal button primitive used by
 * EtherealAuthButtons. Static (motion stripped for performance).
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { ShimmerSweep } from './ShimmerSweep';
import { TapRipple } from './TapRipple';
import { etherealButton } from '@/theme/tokens/ethereal-sky';
import { ArrowGlyph } from './AuthGlyphs';

export type StaggeredButtonSpec = {
  provider: 'apple' | 'google' | 'email';
  label: string;
  fill: string;
  textColor: string;
  borderColor?: string;
  borderWidth?: number;
  glyph: React.ReactNode;
  accessibilityHint: string;
  useShimmer: boolean;
  useRipple: boolean;
  rippleColor?: string;
};

type StaggeredAuthButtonProps = {
  spec: StaggeredButtonSpec;
  onPress: () => void;
  disabled: boolean;
  delay: number;
};

function AuthButtonContent({ spec }: { spec: StaggeredButtonSpec }): React.JSX.Element {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 24,
      }}
    >
      <View style={{ position: 'absolute', left: 32 }}>{spec.glyph}</View>
      <Text
        fontSize={17}
        fontWeight="700"
        style={{ color: spec.textColor }}
      >
        {spec.label}
      </Text>
      <View style={{ position: 'absolute', right: 28 }}>
        <ArrowGlyph
          color={spec.provider === 'google'
            ? etherealButton.googleText
            : etherealButton.emailText}
        />
      </View>
    </View>
  );
}

export function StaggeredAuthButton({
  spec,
  onPress,
  disabled,
  delay: _delay,
}: StaggeredAuthButtonProps): React.JSX.Element {
  const content = <AuthButtonContent spec={spec} />;

  return (
    <View>
      {spec.useShimmer ? (
        <ShimmerSweep
          accessibilityHint={spec.accessibilityHint}
          accessibilityLabel={spec.label}
          backgroundColor={spec.fill}
          borderColor={spec.borderColor}
          borderWidth={spec.borderWidth ?? (spec.borderColor ? 1 : 0)}
          disabled={disabled}
          height={56}
          onPress={onPress}
        >
          {content}
        </ShimmerSweep>
      ) : (
        <TapRipple
          accessibilityHint={spec.accessibilityHint}
          accessibilityLabel={spec.label}
          backgroundColor={spec.fill}
          disabled={disabled}
          height={56}
          onPress={onPress}
          rippleColor={spec.rippleColor ?? 'rgba(255, 255, 255, 0.55)'}
        >
          {content}
        </TapRipple>
      )}
    </View>
  );
}
