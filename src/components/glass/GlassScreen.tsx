import React, { type ReactNode } from 'react';
import { View, type ViewStyle, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaterRippleBackground } from './WaterRippleBackground';
import { WaterBubble } from './WaterBubble';
import { LiquidGlassSphere } from './LiquidGlassSphere';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
}

export function GlassScreen({
  children,
  showAura = true,
  contentStyle,
  testID,
}: GlassScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ backgroundColor: '#F2FAF7', flex: 1 }}
      testID={testID}
    >
      {/* Water ripple background with atmospheric light beams */}
      {showAura ? <WaterRippleBackground /> : null}

      {/* Floating glass water bubbles - decorative atmospheric elements */}
      {showAura ? (
        <>
          <View
            pointerEvents="none"
            style={{
              left: -SCREEN_W * 0.12,
              opacity: 0.45,
              position: 'absolute',
              top: SCREEN_H * 0.06,
              zIndex: 1,
            }}
          >
            <WaterBubble size={SCREEN_W * 0.48} opacity={0.55} />
          </View>

          <View
            pointerEvents="none"
            style={{
              opacity: 0.35,
              position: 'absolute',
              right: -SCREEN_W * 0.08,
              top: SCREEN_H * 0.12,
              zIndex: 1,
            }}
          >
            <WaterBubble size={SCREEN_W * 0.38} opacity={0.45} />
          </View>

          <View
            pointerEvents="none"
            style={{
              left: SCREEN_W * 0.35,
              opacity: 0.25,
              position: 'absolute',
              top: SCREEN_H * 0.02,
              zIndex: 1,
            }}
          >
            <WaterBubble size={SCREEN_W * 0.22} opacity={0.35} />
          </View>

          <View
            pointerEvents="none"
            style={{
              bottom: -SCREEN_H * 0.06,
              left: SCREEN_W * 0.15,
              opacity: 0.3,
              position: 'absolute',
              zIndex: 1,
            }}
          >
            <WaterBubble size={SCREEN_W * 0.42} opacity={0.4} />
          </View>

          <View
            pointerEvents="none"
            style={{
              bottom: -SCREEN_H * 0.04,
              opacity: 0.25,
              position: 'absolute',
              right: SCREEN_W * 0.1,
              zIndex: 1,
            }}
          >
            <WaterBubble size={SCREEN_W * 0.32} opacity={0.35} />
          </View>
        </>
      ) : null}

      {/* Floating liquid glass spheres - smaller accents */}
      {showAura ? (
        <>
          <View
            pointerEvents="none"
            style={{
              left: SCREEN_W * 0.08,
              opacity: 0.2,
              position: 'absolute',
              top: SCREEN_H * 0.25,
              zIndex: 1,
            }}
          >
            <LiquidGlassSphere color="pearl" size={28} intensity={0.6} />
          </View>

          <View
            pointerEvents="none"
            style={{
              opacity: 0.15,
              position: 'absolute',
              right: SCREEN_W * 0.12,
              top: SCREEN_H * 0.38,
              zIndex: 1,
            }}
          >
            <LiquidGlassSphere color="mint" size={22} intensity={0.5} />
          </View>

          <View
            pointerEvents="none"
            style={{
              bottom: SCREEN_H * 0.12,
              left: SCREEN_W * 0.65,
              opacity: 0.18,
              position: 'absolute',
              zIndex: 1,
            }}
          >
            <LiquidGlassSphere color="cyan" size={18} intensity={0.5} />
          </View>
        </>
      ) : null}

      <View
        style={[
          { flex: 1, paddingTop: insets.top },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default GlassScreen;
