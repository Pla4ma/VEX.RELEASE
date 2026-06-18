import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

const ParticleShape = ({
  shape,
  size,
  color,
}: {
  shape: 'circle' | 'square' | 'triangle';
  size: number;
  color: string;
}): React.ReactNode => {
  switch (shape) {
    case 'circle':
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      );
    case 'square':
      return (
        <View style={{ width: size, height: size, backgroundColor: color }} />
      );
    case 'triangle':
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size / 2,
            borderRightWidth: size / 2,
            borderBottomWidth: size,
            borderBottomColor: color,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
          }}
        />
      );
  }
};

export interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle';
  delay: number;
}

export const DRAG = 0.98;

export const Particle: React.FC<{
  config: ParticleConfig;
  onComplete: (id: number) => void;
}> = ({ config, onComplete }) => {
  const translateX = useSharedValue(config.x);
  const translateY = useSharedValue(config.y);
  const rotation = useSharedValue(config.rotation);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(
      config.delay,
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    translateX.value = withDecay({
      velocity: config.velocityX,
      deceleration: DRAG,
    });
    translateY.value = withDecay({
      velocity: config.velocityY,
      deceleration: DRAG,
    });
    rotation.value = withDecay({
      velocity: Math.random() * 400 - 200,
      deceleration: 0.95,
    });
    const timeout = setTimeout(() => {
      opacity.value = withSpring(0, { damping: 20 });
      const innerTimeout = setTimeout(() => {
        runOnJS(onComplete)(config.id);
      }, 500);
      innerTimeoutRef = innerTimeout;
    }, 3000);
    let innerTimeoutRef: ReturnType<typeof setTimeout> | null = null;
    return () => {
      clearTimeout(timeout);
      if (innerTimeoutRef !== null) {
        clearTimeout(innerTimeoutRef);
      }
    };
  }, [config.delay, config.id, config.velocityX, config.velocityY, onComplete, opacity, rotation, scale, translateX, translateY]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));
  const shapeElement = <ParticleShape shape={config.shape} size={config.size} color={config.color} />;
  return (
    <Animated.View style={[particleStyle, animatedStyle]}>
      {shapeElement}
    </Animated.View>
  );
};

const particleStyle = { position: 'absolute' as const };
