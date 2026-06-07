import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

interface GlassProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  variant?: 'mint' | 'premium' | 'warning';
  testID?: string;
}

interface VariantConfig {
  start: string;
  mid: string;
  end: string;
  track: string;
}

function resolveVariant(
  variant: NonNullable<GlassProgressBarProps['variant']>,
): VariantConfig {
  if (variant === 'warning') {
    return {
      start: '#DFA44A',
      mid: '#E8B85F',
      end: '#F1C575',
      track: 'rgba(223, 164, 74, 0.15)',
    };
  }
  if (variant === 'premium') {
    return {
      start: vexLightGlass.mint[300],
      mid: vexLightGlass.mint[400],
      end: vexLightGlass.mint[500],
      track: 'rgba(121, 223, 201, 0.18)',
    };
  }
  return {
    start: vexLightGlass.mint[400],
    mid: vexLightGlass.mint[500],
    end: vexLightGlass.mint[600],
    track: 'rgba(66, 207, 174, 0.16)',
  };
}

export function GlassProgressBar({
  value,
  max = 100,
  height = 8,
  variant = 'mint',
  testID,
}: GlassProgressBarProps): JSX.Element {
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.max(0, Math.min(1, value / safeMax));
  const v = resolveVariant(variant);

  return (
    <View
      testID={testID}
      style={{
        backgroundColor: v.track,
        borderRadius: 999,
        height,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <View
        style={{
          borderRadius: 999,
          height: '100%',
          overflow: 'hidden',
          width: `${pct * 100}%`,
        }}
      >
        <LinearGradient
          colors={[v.start, v.mid, v.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

export default GlassProgressBar;
