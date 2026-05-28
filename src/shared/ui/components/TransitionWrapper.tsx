import React, { useEffect, useCallback } from "react";
import { View } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";
import Animated, {
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import {
  useTransitionAnimation,
  createAnimatedStyles,
  type TransitionWrapperProps,
} from "./transition-config";

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay: number;
  initialDelay?: number;
  visible: boolean;
}
function StaggerContainer({
  children,
  staggerDelay,
  initialDelay = 0,
}: StaggerContainerProps) {
  const childrenArray = React.Children.toArray(children);
  return (
    <>
      {childrenArray.map((child, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(initialDelay + index * staggerDelay)}
          exiting={FadeOut}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}
export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  visible,
  enterConfig = { preset: "fade", duration: 300, easing: "ease" },
  exitConfig = { preset: "fade", duration: 200, easing: "ease" },
  onEnterComplete,
  onExitComplete,
  style,
  maintainLayout = false,
  staggerChildren,
  childDelay = 0,
}) => {
  const [isMounted, setIsMounted] = React.useState(visible);
  const activeConfig = visible ? enterConfig : exitConfig;
  const handleAnimationComplete = useCallback(() => {
    if (!visible) {
      setIsMounted(false);
      onExitComplete?.();
    } else {
      onEnterComplete?.();
    }
  }, [visible, onExitComplete, onEnterComplete]);
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
    }
  }, [visible, isMounted]);
  const { progress } = useTransitionAnimation(
    visible,
    activeConfig,
    handleAnimationComplete,
  );
  const animatedStyle = useAnimatedStyle(() =>
    createAnimatedStyles(activeConfig.preset, progress),
  );
  if (!isMounted && !maintainLayout) {
    return null;
  }
  const content = staggerChildren ? (
    <StaggerContainer
      staggerDelay={staggerChildren}
      initialDelay={childDelay}
      visible={visible}
    >
      {children}
    </StaggerContainer>
  ) : (
    children
  );
  if (!isMounted) {
    return maintainLayout ? <View style={[styles.placeholder, style]} /> : null;
  }
  return (
    <Animated.View style={[style, animatedStyle]}>{content}</Animated.View>
  );
};
interface LayoutTransitionProps {
  children: React.ReactNode;
  layoutId: string;
  style?: import("react-native").ViewStyle;
}
export const LayoutTransition: React.FC<LayoutTransitionProps> = ({
  children,
  style,
}) => {
  return <Animated.View style={style}>{children}</Animated.View>;
};
const styles = createSheet({ placeholder: { opacity: 0 } });
export default TransitionWrapper;
