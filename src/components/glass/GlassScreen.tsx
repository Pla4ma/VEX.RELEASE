import React, { type ReactNode } from 'react';
import { View, type ViewStyle, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaterBubble } from './WaterBubble';
import { LiquidGlassSphere } from './LiquidGlassSphere';
import { FloatingDroplets } from './FloatingDroplets';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
  variant?: 'home' | 'focus' | 'progress' | 'profile' | 'default';
}

// Background atmosphere layer - huge, soft, visible (35-55% opacity)
// These are BEHIND all content, never overlapping text
function BackgroundAtmosphere({ variant }: { variant: string }): JSX.Element {
  if (variant === 'focus') {
    return (
      <>
        <View
          pointerEvents="none"
          style={{
            bottom: -SCREEN_H * 0.12,
            left: -SCREEN_W * 0.18,
            opacity: 0.85,
            position: 'absolute',
            zIndex: 0,
          }}
        >
          <WaterBubble size={SCREEN_W * 0.55} opacity={0.55} />
        </View>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: -SCREEN_W * 0.12,
            top: SCREEN_H * 0.35,
            zIndex: 0,
          }}
        >
          <WaterBubble size={SCREEN_W * 0.32} opacity={0.48} />
        </View>
        <View
          pointerEvents="none"
          style={{
            left: SCREEN_W * 0.75,
            opacity: 0.85,
            position: 'absolute',
            top: SCREEN_H * 0.12,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={5} opacity={0.48} spread={SCREEN_W * 0.18} />
        </View>
      </>
    );
  }

  if (variant === 'progress') {
    return (
      <>
        <View
          pointerEvents="none"
          style={{
            left: -SCREEN_W * 0.2,
            opacity: 0.85,
            position: 'absolute',
            top: SCREEN_H * 0.05,
            zIndex: 0,
          }}
        >
          <WaterBubble size={SCREEN_W * 0.48} opacity={0.52} />
        </View>
        <View
          pointerEvents="none"
          style={{
            bottom: SCREEN_H * 0.18,
            opacity: 0.85,
            position: 'absolute',
            right: -SCREEN_W * 0.08,
            zIndex: 0,
          }}
        >
          <WaterBubble size={SCREEN_W * 0.28} opacity={0.65} />
        </View>
        <View
          pointerEvents="none"
          style={{
            left: SCREEN_W * 0.65,
            opacity: 0.52,
            position: 'absolute',
            top: SCREEN_H * 0.42,
            zIndex: 0,
          }}
        >
          <LiquidGlassSphere color="pearl" size={18} intensity={0.65} />
        </View>
        <View
          pointerEvents="none"
          style={{
            left: SCREEN_W * 0.55,
            opacity: 0.85,
            position: 'absolute',
            top: SCREEN_H * 0.62,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={4} opacity={0.52} spread={SCREEN_W * 0.15} />
        </View>
      </>
    );
  }

  if (variant === 'profile') {
    return (
      <>
        <View
          pointerEvents="none"
          style={{
            left: -SCREEN_W * 0.15,
            opacity: 0.85,
            position: 'absolute',
            top: SCREEN_H * 0.02,
            zIndex: 0,
          }}
        >
          <WaterBubble size={SCREEN_W * 0.42} opacity={0.52} />
        </View>
        <View
          pointerEvents="none"
          style={{
            bottom: SCREEN_H * 0.25,
            opacity: 0.85,
            position: 'absolute',
            right: -SCREEN_W * 0.1,
            zIndex: 0,
          }}
        >
          <WaterBubble size={SCREEN_W * 0.32} opacity={0.65} />
        </View>
        <View
          pointerEvents="none"
          style={{
            left: SCREEN_W * 0.55,
            opacity: 0.52,
            position: 'absolute',
            top: SCREEN_H * 0.08,
            zIndex: 0,
          }}
        >
          <LiquidGlassSphere color="mint" size={16} intensity={0.62} />
        </View>
        <View
          pointerEvents="none"
          style={{
            left: SCREEN_W * 0.75,
            opacity: 0.85,
            position: 'absolute',
            top: SCREEN_H * 0.45,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={4} opacity={0.52} spread={SCREEN_W * 0.15} />
        </View>
      </>
    );
  }

  // Home
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          left: -SCREEN_W * 0.22,
          opacity: 0.85,
          position: 'absolute',
          top: -SCREEN_H * 0.06,
          zIndex: 0,
        }}
      >
        <WaterBubble size={SCREEN_W * 0.52} opacity={0.55} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: -SCREEN_W * 0.12,
          top: SCREEN_H * 0.18,
          zIndex: 0,
        }}
      >
        <WaterBubble size={SCREEN_W * 0.38} opacity={0.48} />
      </View>
      <View
        pointerEvents="none"
        style={{
          bottom: -SCREEN_H * 0.08,
          left: SCREEN_W * 0.45,
          opacity: 0.85,
          position: 'absolute',
          zIndex: 0,
        }}
      >
        <WaterBubble size={SCREEN_W * 0.28} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          left: SCREEN_W * 0.72,
          opacity: 0.52,
          position: 'absolute',
          top: SCREEN_H * 0.08,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" size={14} intensity={0.58} />
      </View>
      <View
        pointerEvents="none"
        style={{
          left: SCREEN_W * 0.15,
          opacity: 0.85,
          position: 'absolute',
          top: SCREEN_H * 0.55,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={5} opacity={0.52} spread={SCREEN_W * 0.18} />
      </View>
    </>
  );
}

export function GlassScreen({
  children,
  showAura = true,
  contentStyle,
  testID,
  variant = 'default',
}: GlassScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ backgroundColor: '#F2FAF7', flex: 1 }}
      testID={testID}
    >
      {/* Background atmosphere layer - BEHIND all content */}
      {showAura ? <BackgroundAtmosphere variant={variant} /> : null}

      {/* Content layer - on top of background, text protected */}
      <View
        style={[
          { flex: 1, paddingTop: insets.top, zIndex: 2 },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default GlassScreen;
