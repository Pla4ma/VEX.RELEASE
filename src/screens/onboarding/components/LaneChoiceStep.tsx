import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import type { Lane } from '../../../features/lane-engine';
import { etherealCard, etherealText } from '../../../theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { LANE_LABELS } from './LaneConfirmationStep';

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
  student: 'Recall, deadlines, and review timing stay visible.',
  game_like: 'Momentum gets structured without cheap rewards.',
  deep_creative: 'Deep work resumes from the last meaningful thread.',
  minimal_normal: 'One useful action starts without noise.',
};

export function LaneChoiceStep({ onSelect }: LaneChoiceStepProps): JSX.Element {
  return (
    <View style={{ gap: 12, paddingTop: 8 }}>
      {ALL_LANES.map((lane) => (
        <Pressable
          key={lane}
          accessibilityHint={`Selects ${LANE_LABELS[lane]} as your focus mode`}
          accessibilityLabel={`Choose ${LANE_LABELS[lane]}`}
          accessibilityRole="button"
          onPress={() => onSelect(lane)}
          style={({ pressed }) => [
            getMinTouchTargetStyle(),
            {
              backgroundColor: etherealCard.fill,
              borderColor: etherealCard.border,
              borderRadius: 22,
              borderWidth: 1,
              gap: 6,
              minHeight: 92,
              opacity: pressed ? 0.9 : 1,
              padding: 18,
            },
          ]}
        >
          <Text fontSize={18} fontWeight="800" style={{ color: etherealText.heading }}>
            {LANE_LABELS[lane]}
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            style={{ color: etherealText.subtitle, lineHeight: 20 }}
          >
            {LANE_DESCRIPTIONS[lane]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
