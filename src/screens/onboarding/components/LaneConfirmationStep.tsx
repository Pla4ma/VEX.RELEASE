import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { styles } from '../styles';
import type { Lane, LaneConfirmation } from '../../../features/lane-engine';

const LANE_EMOJI: Record<Lane, string> = {
  student: '\uD83D\uDCDA',
  game_like: '\uD83C\uDFC3',
  deep_creative: '\uD83D\uDCA1',
  minimal_normal: '\u2728',
};

const LANE_LABELS: Record<Lane, string> = {
  student: 'Study Mode',
  game_like: 'Run Mode',
  deep_creative: 'Project Mode',
  minimal_normal: 'Clean Mode',
};

type LaneConfirmationStepProps = {
  confirmation: LaneConfirmation | null;
  isChoosing: boolean;
  onAccept: (lane: Lane) => void;
  onChooseAnother: () => void;
};

export function LaneConfirmationStep({
  confirmation,
  isChoosing,
  onAccept,
  onChooseAnother,
}: LaneConfirmationStepProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const lane = confirmation?.recommendedLane ?? 'minimal_normal';
  const laneLabel = LANE_LABELS[lane];
  const laneEmoji = LANE_EMOJI[lane];

  const titleIn = isReducedMotion ? undefined : FadeInDown.duration(400);
  const cardIn = isReducedMotion ? undefined : FadeInUp.delay(150).duration(500);
  const actionsIn = isReducedMotion ? undefined : FadeInUp.delay(400).duration(400);

  const cardStyle = useMemo(
    () => [
      styles.choiceCard,
      {
        backgroundColor: `${theme.colors.primary[500]}0D`,
        borderColor: theme.colors.primary[500],
        borderWidth: 2,
        padding: theme.spacing[5],
      },
    ],
    [theme.colors.primary, theme.spacing],
  );

  return (
    <View style={styles.section}>
      <Animated.View entering={titleIn}>
        <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
          VEX thinks {laneLabel} fits you best.
        </Text>
        <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
          You can change this anytime.
        </Text>
      </Animated.View>

      <Animated.View entering={cardIn}>
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
            <Text style={{ fontSize: 36 }}>{laneEmoji}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                }}
              >
                {laneLabel}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing[1],
                }}
              >
                {confirmation?.reason ?? 'VEX will start with the mode that best matches your answers.'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={actionsIn}>
        <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onPress={() => onAccept(lane)}
            isLoading={isChoosing}
            accessibilityLabel={`Start with ${laneLabel}`}
            accessibilityRole="button"
            accessibilityHint={`Confirms ${laneLabel} as your focus mode and starts your first session`}
          >
            Start with this
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onPress={onChooseAnother}
            accessibilityLabel="Choose another mode"
            accessibilityRole="button"
            accessibilityHint="Shows all available focus modes to pick from"
          >
            Choose another
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

export { LANE_LABELS, LANE_EMOJI };
