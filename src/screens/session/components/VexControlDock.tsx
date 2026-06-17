import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useHaptics } from '../../../utils/haptics';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

interface VexControlDockProps {
  onPauseResume: () => void;
  onEnd: () => void;
  isPaused: boolean;
  testID?: string;
}

          
function DockButton({
  onPress,
  children,
  color,
}: {
  onPress: () => void;
  children: React.ReactNode;
  color: string;
}): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const { light } = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isReducedMotion) {scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });}
  };
  const handlePressOut = () => {
    if (!isReducedMotion) {scale.value = withSpring(1, { damping: 15, stiffness: 300 });}
  };

  return (
    <Pressable
      onPress={() => {
        if (!isReducedMotion) {light();}
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Dock button"
      style={getMinTouchTargetStyle()}
    >
      <Animated.View
        style={[
          {
            width: 48,
            height: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}12`,
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function VexControlDock({
  onPauseResume,
  onEnd,
  isPaused,
  testID,
}: VexControlDockProps): React.ReactNode {
  const { theme } = useTheme();

  

  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 16,
      }}
    >
      <DockButton
        onPress={onEnd}
        color={theme.colors.semantic.danger}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: theme.colors.semantic.danger,
          }}
        />
      </DockButton>

      <DockButton
        onPress={onPauseResume}
        color={theme.colors.semantic.vexCyan}
      >
        {isPaused ? (
          <View
            style={{
  width: 0,
  height: 0,
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderLeftWidth: 14,
  borderRightWidth: 0,
  borderTopWidth: 8,
  borderBottomWidth: 8,
  borderLeftColor: theme.colors.semantic.vexCyan,
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
}}
          />
        ) : (
          <View style={{ flexDirection: 'row', gap: 3 }}>
            <View
              style={{
                width: 4,
                height: 14,
                borderRadius: 1,
                backgroundColor: theme.colors.semantic.vexCyan,
              }}
            />
            <View
              style={{
                width: 4,
                height: 14,
                borderRadius: 1,
                backgroundColor: theme.colors.semantic.vexCyan,
              }}
            />
          </View>
        )}
      </DockButton>
    </View>
  );
}
