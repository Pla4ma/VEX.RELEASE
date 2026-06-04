import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets } from '../../../theme/tokens/motion';
import { VexFocusMark } from './VexFocusMark';

interface AuthHeroBrandProps {
  label?: string;
  title?: string;
  tagline?: string;
}

export function AuthHeroBrand({
  label,
  title = 'VEX',
  tagline = 'Protect one block. Leave with proof.',
}: AuthHeroBrandProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const glowOpacity = useSharedValue(0.3);
  const dividerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(12);

  useEffect(() => {
    if (isReducedMotion) {
      glowOpacity.value = 0.35;
      dividerScale.value = 1;
      containerOpacity.value = 1;
      containerTranslateY.value = 0;
      taglineOpacity.value = 1;
      titleOpacity.value = 1;
      titleTranslateY.value = 0;
      return;
    }

    glowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 3000 }),
      -1,
      true,
    );
    dividerScale.value = withDelay(600, withTiming(1, { duration: 620 }));
    containerOpacity.value = withTiming(1, { duration: 520 });
    containerTranslateY.value = withSpring(0, springPresets.settle);
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 420 }));
    titleOpacity.value = withDelay(360, withTiming(1, { duration: 420 }));
    titleTranslateY.value = withDelay(360, withTiming(0, { duration: 420 }));
  }, [
    isReducedMotion,
    glowOpacity,
    dividerScale,
    containerOpacity,
    containerTranslateY,
    taglineOpacity,
    titleOpacity,
    titleTranslateY,
  ]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: dividerScale.value }],
    opacity: dividerScale.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          gap: theme.spacing[4],
          marginTop: theme.spacing[2],
        },
        containerStyle,
      ]}
    >
      {label ? (
        <Text
          color="semantic.vexCyan"
          textAlign="center"
          variant="label"
          letterSpacing={3}
          style={{ opacity: 0.9 }}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}

      <Animated.View
        style={[
          {
            marginVertical: theme.spacing[2],
            shadowColor: theme.colors.semantic.vexCyan,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 24,
          },
          glowStyle,
        ]}
      >
        <VexFocusMark size={72} />
      </Animated.View>

      <Animated.View
        style={[
          {
            maxWidth: '100%',
            paddingHorizontal: theme.spacing[2],
          },
          titleStyle,
        ]}
      >
        <Text
          color="text.primary"
          textAlign="center"
          variant="display"
          letterSpacing={0}
          style={{
            flexShrink: 1,
            fontSize: title.length > 8 ? 40 : 56,
            lineHeight: title.length > 8 ? 46 : 60,
            textShadowColor: 'rgba(0,229,255,0.15)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 24,
          }}
        >
          {title}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          {
            width: 40,
            height: 2,
            backgroundColor: theme.colors.semantic.vexCyan,
            borderRadius: 1,
            marginTop: theme.spacing[2],
            shadowColor: theme.colors.semantic.vexCyan,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
          },
          dividerStyle,
        ]}
      />

      <Animated.View style={taglineStyle}>
        <Text
          color="text.secondary"
          textAlign="center"
          variant="body"
          style={{
            maxWidth: 280,
            opacity: 0.85,
            marginTop: theme.spacing[1],
          }}
        >
          {tagline}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export default AuthHeroBrand;
