import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { ShimmerSweep } from '../../components/primitives/ShimmerSweep';
import { useTheme } from '../../theme';
import { glow } from '../../theme/tokens/elevation';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


const WHITE_MUTED = 'rgba(255,255,255,0.72)';

export function GradientStartButton({
  body,
  buttonLabel,
  eyebrow,
  onPress,
  pulse,
  title,
}: {
  body: string;
  buttonLabel: string;
  eyebrow: string;
  onPress: () => void;
  pulse: boolean;
  title: string;
}): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(scale);
      scale.value = 1;
    }
    return () => cancelAnimation(scale);
  }, [pulse, scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (Platform.OS === 'web') {
    return (
      <View>
        <LinearGradient
          colors={[
            theme.colors.primary[500] ?? lightColors.accent.purple,
            theme.colors.primary[600] ?? lightColors.semantic.primary,
            theme.colors.primary[700] ?? lightColors.semantic.primary,
          ]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          locations={[0, 0.55, 1]}
          style={[
            styles.ctaGradient,
            glow(theme.colors.semantic.primary, 'soft'),
            {
              borderRadius: theme.borderRadius['2xl'],
              gap: theme.spacing[3],
              padding: theme.spacing[4],
            },
          ]}
        >
          <Text variant="label" color={WHITE_MUTED}>
            {eyebrow}
          </Text>
          <View style={{ gap: theme.spacing[2] }}>
            <Text variant="h4" color={theme.colors.text.inverse}>
              {title}
            </Text>
            <Text variant="bodySmall" color={WHITE_MUTED}>
              {body}
            </Text>
          </View>
          <Button
            fullWidth
            size="lg"
            variant="primary"
            style={{
              backgroundColor: 'transparent',
              borderRadius: theme.borderRadius['2xl'],
              minHeight: 58,
            }}
            onPress={onPress}
            accessibilityLabel={buttonLabel}
            accessibilityRole="button"
            accessibilityHint="Starts or resumes the recommended focus action"
          >
            {buttonLabel}
          </Button>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={[
          theme.colors.primary[500] ?? lightColors.accent.purple,
          theme.colors.primary[600] ?? lightColors.semantic.primary,
          theme.colors.primary[700] ?? lightColors.semantic.primary,
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        locations={[0, 0.55, 1]}
        style={[
          styles.ctaGradient,
          glow(theme.colors.semantic.primary, 'soft'),
          {
            borderRadius: theme.borderRadius['2xl'],
            gap: theme.spacing[3],
            padding: theme.spacing[4],
          },
        ]}
      >
        <ShimmerSweep borderRadius={theme.borderRadius['2xl']} />
        <Text variant="label" color={WHITE_MUTED}>
          {eyebrow}
        </Text>
        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="h4" color={theme.colors.text.inverse}>
            {title}
          </Text>
          <Text variant="bodySmall" color={WHITE_MUTED}>
            {body}
          </Text>
        </View>
        <Button
          fullWidth
          size="lg"
          variant="primary"
          style={{
            backgroundColor: 'transparent',
            borderRadius: theme.borderRadius['2xl'],
            minHeight: 58,
          }}
          onPress={onPress}
          accessibilityLabel={buttonLabel}
          accessibilityRole="button"
          accessibilityHint="Starts or resumes the recommended focus action"
        >
          {buttonLabel}
        </Button>
      </LinearGradient>
    </Animated.View>
  );
}

export function SectionHeader({ title }: { title: string }): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionAccent,
          { backgroundColor: theme.colors.primary[500] },
        ]}
      />
      <Text variant="h4" color={theme.colors.text.primary}>
        {title}
      </Text>
    </View>
  );
}

const styles = createSheet({
  ctaGradient: { overflow: 'hidden' },
  sectionAccent: { borderRadius: 2, height: 18, marginRight: 8, width: 3 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row' },
});
