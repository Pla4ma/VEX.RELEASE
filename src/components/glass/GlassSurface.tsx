import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { GLASS_SURFACE_VARIANTS, type GlassSurfaceVariant } from './GlassSurface.tokens';
import { GlassBlurLayer } from './GlassBlurLayer';
import { GlassTextureOverlay } from './GlassTextureOverlay';
import {
  TopEdgeHighlight,
  SecondEdgeHighlight,
  BottomEdgeShadow,
  GlassBorder,
  GlassOuterBorder,
} from './GlassSurface.edges';
import {
  TopHighlight,
  BottomTint,
  TopAccentBar,
  GlassGlow,
} from './GlassSurface.overlays';

export type { GlassSurfaceVariant } from './GlassSurface.tokens';

interface GlassSurfaceProps {
  children?: ReactNode;
  variant?: GlassSurfaceVariant;
  radius: number;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
  accentTopBar?: boolean;
  topBarColor?: string;
  testID?: string;
}

const containerStyle: ViewStyle = {
  borderRadius: 0,
  shadowColor: '',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
};

const innerContainerStyle: ViewStyle = {
  backgroundColor: '',
  borderRadius: 0,
  overflow: 'hidden',
};

export function GlassSurface({
  children,
  variant = 'default',
  radius,
  style,
  bordered = true,
  accentTopBar = false,
  topBarColor = '#42CFAE',
  testID,
}: GlassSurfaceProps): React.ReactNode {
  const v = GLASS_SURFACE_VARIANTS[variant];

  const wrapperStyle: ViewStyle = {
    ...containerStyle,
    borderRadius: radius,
    shadowColor: v.shadowColor,
    shadowOffset: v.shadowOffset,
    shadowOpacity: v.shadowOpacity,
    shadowRadius: v.shadowRadius,
  };

  const innerStyle: ViewStyle = {
    ...innerContainerStyle,
    backgroundColor: v.fill,
    borderRadius: radius,
  };

  return (
    <View testID={testID} style={[wrapperStyle, style]}>
      {v.glowColor ? (
        <GlassGlow color={v.glowColor} opacity={v.glowOpacity ?? 0.3} radius={radius + 8} />
      ) : null}

      {bordered ? <GlassOuterBorder color={v.border} radius={radius} /> : null}

      <View style={innerStyle}>
        <GlassBlurLayer intensity={variant === 'hero' || variant === 'premium' ? 92 : 78} radius={radius} />
        <TopHighlight color={v.highlightTop} radius={radius} stop={v.highlightTopStop} />
        <GlassTextureOverlay intensity={variant === 'hero' || variant === 'premium' ? 'hero' : 'normal'} radius={radius} />
        {v.innerBottomTint && v.innerBottomStop !== undefined ? (
          <BottomTint color={v.innerBottomTint} stop={v.innerBottomStop} />
        ) : null}
        {bordered ? <GlassBorder color={v.border} radius={radius} width={v.borderWidth} /> : null}
        <TopEdgeHighlight intensity={v.topEdgeIntensity} radius={radius} />
        <SecondEdgeHighlight radius={radius} />
        <BottomEdgeShadow radius={radius} />
        {accentTopBar ? <TopAccentBar color={topBarColor} radius={radius} /> : null}
        {children}
      </View>
    </View>
  );
}
