import React, { type ReactNode } from 'react';
import { View, type ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { LiquidGlassBackdrop } from './LiquidGlassBackdrop';

interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function OrganicTopBlob(): JSX.Element {
  return (
    <Svg
      height={SCREEN_H * 0.7}
      pointerEvents="none"
      style={{
        position: 'absolute',
        right: -SCREEN_W * 0.55,
        top: -SCREEN_H * 0.28,
        width: SCREEN_W * 1.6,
      }}
      viewBox="0 0 100 100"
      width="100%"
    >
      <Defs>
        <RadialGradient cx="40%" cy="40%" id="blobMint" r="60%">
          <Stop offset="0%" stopColor="#D8FBF1" stopOpacity={0.18} />
          <Stop offset="45%" stopColor="#A9F0DD" stopOpacity={0.10} />
          <Stop offset="100%" stopColor="#5FE6C5" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path
        d="M 25 5 C 55 -8 95 8 102 35 C 110 65 85 95 55 95 C 22 95 0 75 5 45 C 8 25 5 18 25 5 Z"
        fill="url(#blobMint)"
      />
    </Svg>
  );
}

function OrganicCyanGlow(): JSX.Element {
  return (
    <Svg
      height={SCREEN_H * 0.55}
      pointerEvents="none"
      style={{
        left: -SCREEN_W * 0.4,
        position: 'absolute',
        top: SCREEN_H * 0.25,
        width: SCREEN_W * 1.1,
      }}
      viewBox="0 0 100 100"
      width="100%"
    >
      <Defs>
        <RadialGradient cx="55%" cy="50%" id="blobCyan" r="55%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.32} />
          <Stop offset="55%" stopColor="#D8FBF1" stopOpacity={0.10} />
          <Stop offset="100%" stopColor="#88DCD2" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path
        d="M 50 5 C 78 5 98 28 98 52 C 98 78 75 98 50 98 C 25 98 2 78 2 52 C 2 28 22 5 50 5 Z"
        fill="url(#blobCyan)"
      />
    </Svg>
  );
}

function TopRightAccent(): JSX.Element {
  return (
    <Svg
      height={SCREEN_H * 0.35}
      pointerEvents="none"
      style={{
        position: 'absolute',
        right: -SCREEN_W * 0.2,
        top: -40,
        width: SCREEN_W * 0.8,
      }}
      viewBox="0 0 100 60"
      width="100%"
    >
      <Defs>
        <SvgLinearGradient id="topAccent" x1="0" x2="1" y1="0" y2="0">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.22} />
          <Stop offset="100%" stopColor="#5FE6C5" stopOpacity={0} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M 0 0 C 30 10 70 5 100 25 L 100 60 L 0 60 Z"
        fill="url(#topAccent)"
      />
    </Svg>
  );
}

function BottomPearlWave(): JSX.Element {
  return (
    <Svg
      height={SCREEN_H * 0.35}
      pointerEvents="none"
      style={{
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        width: SCREEN_W,
      }}
      viewBox="0 0 100 50"
      width="100%"
    >
      <Defs>
        <SvgLinearGradient id="pearlWave" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.55} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M 0 18 C 20 4 50 28 80 14 C 92 8 100 12 100 20 L 100 50 L 0 50 Z"
        fill="url(#pearlWave)"
      />
    </Svg>
  );
}

export function GlassScreen({
  children,
  showAura = true,
  contentStyle,
  testID,
}: GlassScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();
  void vexLightGlass;

  return (
    <View
      style={{ backgroundColor: '#F8FFFC', flex: 1 }}
      testID={testID}
    >
      <LinearGradient
        colors={['#FBFFFD', '#F7FCFA', '#EFF8F5', '#EAF4F1', '#FBFFFD']}
        locations={[0, 0.25, 0.55, 0.8, 1]}
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <LiquidGlassBackdrop />
      {showAura ? <TopRightAccent /> : null}
      {showAura ? <OrganicTopBlob /> : null}
      {showAura ? <OrganicCyanGlow /> : null}
      {showAura ? <BottomPearlWave /> : null}
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
