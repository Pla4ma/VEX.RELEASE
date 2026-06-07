import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
          left: 6,
          position: 'absolute',
          right: 6,
          shadowColor: '#0C765F',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          top: 7,
        },
        pillStyle,
      ]}
    >
      <BlurView
        intensity={36}
        pointerEvents="none"
        tint="light"
        style={{
          borderRadius: 999,
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View
        style={{
          backgroundColor: 'rgba(95, 230, 197, 0.26)',
          borderColor: 'rgba(255, 255, 255, 0.95)',
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
        colors={['rgba(95, 230, 197, 0.45)', 'rgba(66, 207, 174, 0.18)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: 999,
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.6]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          height: '55%',
          left: 1,
          position: 'absolute',
          right: 1,
          top: 1,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          height: 1,
          left: 10,
          position: 'absolute',
          right: 10,
          top: 1,
        }}
      />
    </Animated.View>
  );
}

export default ActiveTabPill;
