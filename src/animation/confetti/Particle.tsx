/**
 * Confetti Particle Component
 *
 * Individual particle component for confetti celebration.
 */

<<<<<<< HEAD
import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring, withDecay, withDelay, runOnJS } from 'react-native-reanimated';
import { ParticleConfig } from './types';
import { particleStyle, shapeStyle, triangleStyle, FRICTION } from './constants';
=======
import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
import { useSharedValue, useAnimatedStyle, withSpring, withDecay, withDelay, runOnJS } from "react-native-reanimated";
import { ParticleConfig } from "./types";
import { particleStyle, shapeStyle, triangleStyle, FRICTION } from "./constants";
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleProps {
  config: ParticleConfig;
  onComplete: (id: number) => void;
}

export function Particle({ config, onComplete }: ParticleProps) {
  const animatedX = useSharedValue(config.x);
  const animatedY = useSharedValue(config.y);
  const animatedRotation = useSharedValue(config.rotation);
  const animatedScale = useSharedValue(1);
  const animatedOpacity = useSharedValue(1);

  useEffect(() => {
    const handleComplete = () => {
      runOnJS(onComplete)(config.id);
    };

    // Apply physics-based animation
    animatedX.value = withDelay(
      config.delay * 1000,
      withDecay({
        velocity: config.velocityX,
        deceleration: FRICTION,
      })
    );

    // Y animation with spring
    animatedY.value = withDelay(
      config.delay * 1000,
      withSpring(SCREEN_HEIGHT + 100, {
        velocity: config.velocityY,
        damping: 20,
        stiffness: 100,
        mass: 1,
        overshootClamping: true,
<<<<<<< HEAD
        energyThreshold: 0.1,
=======
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
      })
    );

    // Rotation animation
    animatedRotation.value = withDelay(
      config.delay * 1000,
      withSpring(config.rotation + 720, {
        damping: 10,
        stiffness: 100,
      })
    );

    // Fade out animation
    animatedOpacity.value = withDelay(
      (config.delay + 2) * 1000,
      withSpring(0, {
        damping: 20,
        stiffness: 100,
      })
    );

    // Scale animation
    animatedScale.value = withDelay(
      (config.delay + 2) * 1000,
      withSpring(0, {
        damping: 20,
        stiffness: 100,
      })
    );

    // Auto-cleanup
    const timeout = setTimeout(handleComplete, (config.delay + 3) * 1000);
    return () => clearTimeout(timeout);
<<<<<<< HEAD
  }, [animatedOpacity, animatedRotation, animatedScale, animatedX, animatedY, config, onComplete]);
=======
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, onComplete]);
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animatedX.value },
      { translateY: animatedY.value },
      { rotate: `${animatedRotation.value}deg` },
      { scale: animatedScale.value },
    ],
    opacity: animatedOpacity.value,
  }));

  const renderShape = () => {
    const size = config.size;
    const style = [
      particleStyle,
      shapeStyle,
      { width: size, height: size, backgroundColor: config.color },
      animatedStyle,
    ];

    switch (config.shape) {
      case 'circle':
        return <View style={[style, { borderRadius: size / 2 }]} />;
      case 'square':
        return <View style={style} />;
      case 'triangle':
        return (
          <View
            style={[
              triangleStyle,
              {
                ...animatedStyle,
                borderLeftWidth: size / 2,
                borderRightWidth: size / 2,
                borderBottomWidth: size,
                borderBottomColor: config.color,
              },
            ]}
          />
        );
      default:
        return <View style={[style, { borderRadius: size / 2 }]} />;
    }
  };

  return <>{renderShape()}</>;
}
