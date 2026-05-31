import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { styles } from '../styles';
import type { Lane } from '../../../features/lane-engine';
import { LANE_LABELS, LANE_EMOJI } from './LaneConfirmationStep';

type LaneChoiceStepProps = {
  onSelect: (lane: Lane) => void;
};

const ALL_LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];

export const LANE_DESCRIPTIONS: Record<Lane, string> = {
  student: 'Continue learning without guessing what to study next.',
  game_like: 'Turn focus into momentum without cheap game rewards.',
  deep_creative: 'Pick up deep work where you left off.',
  minimal_normal: 'Start one useful action without noise.',
};

export function LaneChoiceStep({ onSelect }: LaneChoiceStepProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const cardIn = isReducedMotion
    ? undefined
    : FadeInUp.delay(100).duration(400);

  return (
    <View style={styles.section}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Pick your lane
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}
      >
        VEX will adapt to your choice. Change anytime from Settings.
      </Text>
      <View style={styles.choiceGrid}>
        {ALL_LANES.map((lane, index) => (
          <Animated.View
            entering={
              isReducedMotion
                ? undefined
                : FadeInUp.delay(150 + index * 80).duration(400)
            }
            key={lane}
            style={{ width: '100%' }}
          >
            <Pressable
              onPress={() => onSelect(lane)}
              style={[
                styles.choiceCard,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: theme.colors.border.DEFAULT,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing[3],
                },
              ]}
              accessibilityLabel={`Choose ${LANE_LABELS[lane]}`}
              accessibilityRole="button"
              accessibilityHint={`Selects ${LANE_LABELS[lane]} as your focus mode`}
            >
              <Text style={{ fontSize: 32 }}>{LANE_EMOJI[lane]}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.choiceTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {LANE_LABELS[lane]}
                </Text>
                <Text
                  style={[
                    styles.choiceDescription,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {LANE_DESCRIPTIONS[lane]}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
