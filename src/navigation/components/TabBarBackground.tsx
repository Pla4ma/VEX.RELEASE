import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassBlurLayer } from '@/components/glass/GlassBlurLayer';

interface TabBarBackgroundProps {
  tabBarHeight: number;
  horizontalMargin: number;
  children: React.ReactNode;
}

export function TabBarBackground({ tabBarHeight, horizontalMargin, children }: TabBarBackgroundProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  const containerStyle = {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  } as const;

  const tabBarStyle = {
    borderRadius: 36,
    elevation: 6,
    height: tabBarHeight,
    marginBottom: Math.max(insets.bottom - 2, 10),
    marginHorizontal: horizontalMargin,
    overflow: 'hidden',
    shadowColor: 'rgba(80, 100, 95, 0.14)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
  } as const;

  const glassOverlayStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 36,
    borderWidth: 1.2,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  } as const;

  const gradientStyle = {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: '55%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  } as const;

  const topEdgeStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: 1.5,
    left: 28,
    position: 'absolute',
    right: 28,
    top: 1.2,
  } as const;

  const topEdgeSecondaryStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: 1,
    left: 32,
    position: 'absolute',
    right: 32,
    top: 3,
  } as const;

  const bottomEdgeStyle = {
    backgroundColor: 'rgba(10, 94, 77, 0.06)',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    bottom: 1.2,
    height: 1.2,
    left: 24,
    position: 'absolute',
    right: 24,
  } as const;

  return (
    <View pointerEvents="box-none" style={containerStyle}>
      <View style={tabBarStyle}>
        <GlassBlurLayer intensity={82} radius={36} />
        <View style={glassOverlayStyle} />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.32)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          style={gradientStyle}
        />
        {/* Top glass edge highlight - thin white line */}
        <View pointerEvents="none" style={topEdgeStyle} />
        {/* Secondary glass edge highlight */}
        <View pointerEvents="none" style={topEdgeSecondaryStyle} />
        {/* Bottom glass edge shadow */}
        <View pointerEvents="none" style={bottomEdgeStyle} />
        {children}
      </View>
    </View>
  );
}