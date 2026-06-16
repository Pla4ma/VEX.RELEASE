import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function VexTabBarGlassDecoration() {
  return (
    <>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.32)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          height: '55%',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          height: 1.5,
          left: 28,
          position: 'absolute',
          right: 28,
          top: 1.2,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          height: 1,
          left: 32,
          position: 'absolute',
          right: 32,
          top: 3,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(10, 94, 77, 0.06)',
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          bottom: 1.2,
          height: 1.2,
          left: 24,
          position: 'absolute',
          right: 24,
        }}
      />
    </>
  );
}