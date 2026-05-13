import React, { useMemo } from "react";
import { View, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeInDown, FadeInLeft, FadeInRight, useReducedMotion, Easing } from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";


export const EnterAnimation: React.FC<EnterAnimationProps> = ({
  children,
  direction = 'up',
  speed = 'normal',
  delay = 0,
  style,
  enabled = true,
}) => {
  const reducedMotion = useReducedMotion();

  const entering = useMemo(() => {
    if (!enabled) {return undefined;}
    return getEnterAnimation(direction, speed, delay, 20, reducedMotion ?? false);
  }, [direction, speed, delay, enabled, reducedMotion]);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
};

export const StaggeredEnter: React.FC<StaggeredEnterProps> = ({
  children,
  direction = 'up',
  speed = 'normal',
  staggerDelay = 40,
  initialDelay = 0,
  containerStyle,
}) => {
  const reducedMotion = useReducedMotion();
  const animatedChildren = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) {return child;}

      const delay = initialDelay + index * staggerDelay;
      const entering = getEnterAnimation(direction, speed, delay, 20, reducedMotion ?? false);

      return (
        <Animated.View
          key={child.key || index}
          entering={entering}
          style={styles.staggerItem}
        >
          {child}
        </Animated.View>
      );
    });
  }, [children, direction, speed, staggerDelay, initialDelay, reducedMotion]);

  return (
    <View style={[styles.staggerContainer, containerStyle]}>
      {animatedChildren}
    </View>
  );
};

export const CardEnterAnimation: React.FC<CardEnterAnimationProps> = ({
  children,
  index = 0,
  total: _total = 1,
  style,
}) => {
  const reducedMotion = useReducedMotion();
  const delay = Math.min(index * 80, 400); // Cap stagger at 400ms

  const entering = useMemo(() => {
    return getEnterAnimation('up', 'normal', delay, 20, reducedMotion ?? false);
  }, [delay, reducedMotion]);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
};

export const ScreenEnterAnimation: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  const reducedMotion = useReducedMotion();

  const entering = useMemo(() => {
    return getEnterAnimation('fade', 'normal', 0, 0, reducedMotion ?? false);
  }, [reducedMotion]);

  return (
    <Animated.View entering={entering} style={[styles.screenContainer, style]}>
      {children}
    </Animated.View>
  );
};

export const HeroEnterAnimation: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}> = ({ children, delay = 0, style }) => {
  const reducedMotion = useReducedMotion();

  const entering = useMemo(() => {
    return getEnterAnimation('up', 'slow', delay, 30, reducedMotion ?? false);
  }, [delay, reducedMotion]);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
};