import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

interface ActiveTabPillProps {
  pillStyle: AnimatedStyle<StyleProp<ViewStyle>>;
  height: number;
}

export function ActiveTabPill({
  pillStyle,
  height,
}: ActiveTabPillProps): JSX.Element {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          alignSelf: 'center',
          borderRadius: 999,
          height,
          left: 12,
          position: 'absolute',
          right: 12,
          shadowColor: 'rgba(18, 184, 148, 0.12)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.85,
          shadowRadius: 6,
          top: 6,
        },
        pillStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: 'rgba(66, 207, 174, 0.10)',
          borderColor: 'rgba(255, 255, 255, 0.72)',
          borderRadius: 999,
          borderWidth: 1,
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.42)', 'rgba(255, 255, 255, 0.06)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.6]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          height: '52%',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      {/* Top glass edge highlight */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          borderRadius: 999,
          height: 1,
          left: 8,
          position: 'absolute',
          right: 8,
          top: 1.2,
        }}
      />
    </Animated.View>
  );
}

export default ActiveTabPill;
