import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { NativeGlassSurface } from '../../components/glass';

interface ActiveTabPillProps {
  pillStyle: AnimatedStyle<StyleProp<ViewStyle>>;
  height: number;
}

/**
 * Active tab indicator pill. Uses native glass surface for the selected
 * tab highlight — real refraction instead of CSS gradient overlays.
 */
export function ActiveTabPill({
  pillStyle,
  height,
}: ActiveTabPillProps): React.ReactNode {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          alignSelf: 'center',
          left: 12,
          position: 'absolute',
          right: 12,
          top: 6,
        },
        pillStyle,
      ]}
    >
      <NativeGlassSurface
        variant="selected"
        radius={height / 2}
        style={{ height }}
      />
    </Animated.View>
  );
}
