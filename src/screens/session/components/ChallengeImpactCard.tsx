import { vexFire } from "@/theme/tokens/vex-fire";
import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getCardWidth } from './session-consequence-types';
import { SessionGlyph } from '../../../shared/ui/liquid-glass/SessionGlyphs';

interface ChallengeImpactCardProps {
  challengeName: string;
  progressBefore: number;
  progressAfter: number;
  target: number;
  wasCompleted: boolean;
}

export function ChallengeImpactCard({
  challengeName,
  progressBefore,
  progressAfter,
  target,
  wasCompleted,
}: ChallengeImpactCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = getCardWidth(screenWidth);
  const progressAnim = useSharedValue(progressBefore);

  useEffect(() => {
    progressAnim.value = withTiming(progressAfter, { duration: 1000 });
  }, [progressAfter, progressAnim]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, (progressAnim.value / target) * 100)}%`,
  }));

  return (
    <View
      style={{
        width: cardWidth,
        padding: theme.spacing[4],
        backgroundColor: wasCompleted
          ? `${vexFire.success}15`
          : vexFire.panel,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: wasCompleted
          ? vexFire.success
          : vexFire.border,
        marginRight: theme.spacing[3],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[2],
        }}
      >
        <SessionGlyph name="focused" size={36} />
        <Text
          variant="body"
          fontWeight="700"
          color={vexFire.cream}
          numberOfLines={1}
        >
          {wasCompleted ? 'Challenge Complete!' : challengeName}
        </Text>
      </View>

      <View
        style={{
          height: 8,
          backgroundColor: vexFire.background,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginBottom: theme.spacing[2],
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: wasCompleted
                ? vexFire.success
                : vexFire.ember,
              borderRadius: theme.borderRadius.full,
            },
            progressBarStyle,
          ]}
        />
      </View>

      <Text variant="caption" color={vexFire.textSecondary}>
        {wasCompleted
          ? `Completed! ${progressBefore} → ${progressAfter}/${target}`
          : `Progress: ${progressBefore} → ${progressAfter}/${target}`}
      </Text>
    </View>
  );
}
